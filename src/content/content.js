import { ext } from '../shared/ext.js';

/**
 * Inspector agent. Injected programmatically (never statically) and only into
 * frames that are direct children of our viewer tab. It talks to the viewer
 * page with postMessage; the viewer identifies the sender by `event.source`.
 */
(function () {
  if (window.__rdtLoaded) return;
  if (window === window.top || window.parent !== window.top) return;
  window.__rdtLoaded = true;

  const ORIGIN = new URL(ext.runtime.getURL('/')).origin;
  let frameId = null;
  let inspecting = false;
  let selectedEl = null;
  let hoverEl = null;
  let tempEl = null;
  let touchOn = false;
  let mutations = false;
  let root = null;
  let styleEl = null;
  let frameworks = null;
  let lastSig = '';
  let ignoreScrollUntil = 0;
  let markTimer = 0;

  const post = (type, data) => {
    try { window.parent.postMessage({ rdt: 1, type, frameId, ...data }, ORIGIN); } catch { /* parent gone */ }
  };

  /* ------------------------------------------------------------ helpers */
  const px = (v) => parseFloat(v) || 0;
  const r1 = (n) => Math.round(n * 10) / 10;
  const isOurs = (el) => !!el && (el.id === 'rdt-overlay-root' || (el.closest && el.closest('#rdt-overlay-root')));
  const kids = (el) => Array.prototype.filter.call(el.children, (c) => c.id !== 'rdt-overlay-root');

  const nodeAt = (path) => {
    let el = document.documentElement;
    for (const i of path || []) { el = kids(el)[i]; if (!el) return null; }
    return el;
  };
  const pathOf = (el) => {
    const p = [];
    while (el && el !== document.documentElement) {
      const par = el.parentElement;
      if (!par) return null;
      p.unshift(kids(par).indexOf(el));
      el = par;
    }
    return p;
  };
  const labelOf = (el) => {
    const id = el.id ? '#' + el.id : '';
    const cl = Array.prototype.slice.call(el.classList, 0, 3).map((c) => '.' + c).join('');
    return el.localName + id + cl;
  };
  const treeNode = (el) => {
    const k = kids(el);
    let txt = '';
    if (!k.length) txt = (el.textContent || '').trim().slice(0, 40);
    return { p: pathOf(el), t: el.localName, id: el.id || '', c: Array.prototype.slice.call(el.classList, 0, 4), n: k.length, txt };
  };

  const GROUPS = {
    Layout: ['display', 'flex-direction', 'align-items', 'justify-content', 'gap'],
    Position: ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
    'Box Model': ['width', 'height', 'padding', 'margin', 'border-radius'],
    Typography: ['font-family', 'font-size', 'line-height', 'font-weight', 'letter-spacing', 'color', 'text-align'],
    Background: ['background-color', 'background-image', 'background-size'],
    Border: ['border', 'border-top'],
    Effects: ['box-shadow', 'opacity', 'filter', 'backdrop-filter'],
    Animation: ['transition', 'animation']
  };
  const sides = (cs, pre, post2 = '') => ['top', 'right', 'bottom', 'left'].map((s) => cs.getPropertyValue(`${pre}-${s}${post2}`));
  const collapse = (a) => (a[0] === a[1] && a[1] === a[2] && a[2] === a[3] ? a[0] : a[0] === a[2] && a[1] === a[3] ? `${a[0]} ${a[1]}` : a.join(' '));
  function cssValue(cs, p) {
    let v = cs.getPropertyValue(p);
    if (v) return v;
    if (p === 'padding' || p === 'margin') return collapse(sides(cs, p));
    if (p === 'border-radius') return collapse(['top-left', 'top-right', 'bottom-right', 'bottom-left'].map((c) => cs.getPropertyValue(`border-${c}-radius`)));
    if (p === 'border' || p === 'border-top') {
      const s = p === 'border' ? 'top' : 'top';
      const st = cs.getPropertyValue(`border-${s}-style`);
      return st === 'none' ? 'none' : `${cs.getPropertyValue(`border-${s}-width`)} ${st} ${cs.getPropertyValue(`border-${s}-color`)}`;
    }
    return v;
  }

  function elInfo(el) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const css = {};
    for (const [g, props] of Object.entries(GROUPS)) css[g] = props.map((p) => [p, cssValue(cs, p)]);
    return {
      p: pathOf(el),
      label: labelOf(el),
      tag: el.localName,
      id: el.id || '',
      classes: Array.prototype.slice.call(el.classList),
      size: { w: r1(r.width), h: r1(r.height) },
      box: {
        margin: sides(cs, 'margin').map(px),
        border: sides(cs, 'border', '-width').map(px),
        padding: sides(cs, 'padding').map(px)
      },
      display: cs.display,
      position: cs.position,
      color: cs.color,
      font: `${(cs.fontFamily.split(',')[0] || '').trim().replace(/["']/g, '')} ${cs.fontSize}/${cs.lineHeight}`,
      fontParts: { family: (cs.fontFamily.split(',')[0] || '').trim().replace(/["']/g, ''), size: cs.fontSize, line: cs.lineHeight, weight: cs.fontWeight },
      css
    };
  }

  /* ------------------------------------------------------------ overlay */
  function ensureRoot() {
    if (root && root.isConnected) return root;
    root = document.createElement('div');
    root.id = 'rdt-overlay-root';
    root.style.cssText = 'all:initial;position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483647;';
    document.documentElement.appendChild(root);
    return root;
  }
  const box = (x, y, w, h, bg, extra = '') => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${Math.max(0, w)}px;height:${Math.max(0, h)}px;background:${bg};box-sizing:border-box;pointer-events:none;${extra}`;
    return d;
  };
  function paint() {
    const host = ensureRoot();
    host.textContent = '';
    const el = tempEl || hoverEl || selectedEl;
    if (!el || !el.isConnected) return;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const m = sides(cs, 'margin').map(px), b = sides(cs, 'border', '-width').map(px), p = sides(cs, 'padding').map(px);
    host.appendChild(box(r.left - m[3], r.top - m[0], r.width + m[1] + m[3], r.height + m[0] + m[2], 'rgba(246,178,107,.55)'));
    host.appendChild(box(r.left, r.top, r.width, r.height, 'rgba(255,229,153,.6)'));
    host.appendChild(box(r.left + b[3], r.top + b[0], r.width - b[1] - b[3], r.height - b[0] - b[2], 'rgba(147,196,125,.55)'));
    host.appendChild(box(r.left + b[3] + p[3], r.top + b[0] + p[0], r.width - b[1] - b[3] - p[1] - p[3], r.height - b[0] - b[2] - p[0] - p[2], 'rgba(111,168,220,.6)'));
    const tip = document.createElement('div');
    tip.textContent = `${labelOf(el)}  ${r1(r.width)} × ${r1(r.height)}`;
    const ty = r.top > 26 ? r.top - 24 : r.bottom + 4;
    tip.style.cssText = `position:fixed;left:${Math.max(2, Math.min(r.left, window.innerWidth - 220))}px;top:${ty}px;background:#111827;color:#fff;font:600 11px/1 ui-monospace,Menlo,monospace;padding:5px 7px;border-radius:4px;white-space:nowrap;max-width:300px;overflow:hidden;text-overflow:ellipsis;`;
    host.appendChild(tip);
  }
  let raf = 0;
  const schedulePaint = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (tempEl || hoverEl || selectedEl) paint(); }); };
  window.addEventListener('scroll', schedulePaint, true);
  window.addEventListener('resize', schedulePaint);

  /* ------------------------------------------------------------ inspect mode */
  function setStyle(css) {
    if (!css) { if (styleEl) { styleEl.remove(); styleEl = null; } return; }
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'rdt-style'; (document.head || document.documentElement).appendChild(styleEl); }
    styleEl.textContent = css;
  }
  const TOUCH_CURSOR = "html,html *{cursor:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><circle cx='14' cy='14' r='11' fill='rgba(120,120,120,.35)' stroke='white' stroke-width='2'/></svg>\") 14 14,auto !important}";
  let sampling = false; // colour sampling mode (see the colour block below)
  const refreshStyle = () => setStyle(inspecting || sampling ? 'html,html *{cursor:crosshair !important}' : touchOn ? TOUCH_CURSOR : '');

  const elAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && !isOurs(el) ? el : null; };
  const onMove = (e) => { const el = elAt(e); if (el && el !== hoverEl) { hoverEl = el; paint(); } };
  const swallow = (e) => { e.preventDefault(); e.stopImmediatePropagation(); };
  const onClick = (e) => {
    swallow(e);
    const el = elAt(e);
    setInspect(false);
    if (el) select(el, true);
  };
  const EVTS = ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend'];
  function setInspect(on) {
    if (on === inspecting) return;
    inspecting = on;
    if (on) {
      window.addEventListener('mousemove', onMove, true);
      window.addEventListener('click', onClick, true);
      EVTS.forEach((n) => window.addEventListener(n, swallow, true));
    } else {
      window.removeEventListener('mousemove', onMove, true);
      window.removeEventListener('click', onClick, true);
      EVTS.forEach((n) => window.removeEventListener(n, swallow, true));
      hoverEl = null;
      paint();
    }
    refreshStyle();
    post('inspect', { on });
  }
  function select(el, picked) {
    selectedEl = el;
    hoverEl = null;
    tempEl = null;
    paint();
    post('selected', { el: elInfo(el), picked: !!picked });
  }

  /* ------------------------------------------------------------ overflow scan */
  function scanOverflow() {
    const vw = document.documentElement.clientWidth;
    const out = [];
    const all = document.body ? document.body.querySelectorAll('*') : [];
    for (let i = 0; i < all.length && out.length < 40; i++) {
      const el = all[i];
      if (isOurs(el)) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.right > vw + 1 || r.left < -1) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') continue;
        out.push({ p: pathOf(el), label: labelOf(el), right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width) });
      }
    }
    return { vw, scrollW: document.documentElement.scrollWidth, items: out };
  }
  function markOverflow(items) {
    const host = ensureRoot();
    host.textContent = '';
    for (const it of items || []) {
      const el = nodeAt(it.p);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      host.appendChild(box(r.left, r.top, r.width, r.height, 'rgba(239,68,68,.18)', 'outline:2px dashed #ef4444;outline-offset:-2px;'));
    }
    clearTimeout(markTimer);
    markTimer = setTimeout(() => paint(), 8000);
  }


  /* ------------------------------------------------------------ accessibility audit */
  function a11yAudit() {
    const res = [];
    const vis = (el) => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false; const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

    // 1 - colour contrast (WCAG AA), measured on real text with solid backgrounds
    const rgb = (c) => { const m = /^rgba?\(([^)]+)\)$/.exec(c || ''); if (!m) return null; const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return p.length >= 3 && p.every((x) => !Number.isNaN(x)) ? { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 } : null; };
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
    const backdrop = (el) => {
      const layers = [];
      for (let e = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.backgroundImage !== 'none') return null;
        const c = rgb(cs.backgroundColor);
        if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
      }
      let base = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
      return base;
    };
    let measured = 0, failing = 0, worst = 21;
    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode() && seen.size < 400) {
      const n = walker.currentNode;
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      const el = n.parentElement;
      if (!el || seen.has(el) || isOurs(el) || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName) || !vis(el)) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      const fg = rgb(cs.color), bg = backdrop(el);
      if (!fg || !bg) continue;
      const f = over(fg, bg);
      const l1 = lum(f), l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
      const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
      measured++;
      if (ratio < need) { failing++; worst = Math.min(worst, ratio); }
    }
    res.push(!measured
      ? { label: 'Color Contrast', status: 'pass', note: 'No measurable text on solid backgrounds' }
      : failing
        ? { label: 'Color Contrast', status: 'warn', note: `${failing} of ${measured} text elements fail WCAG AA (worst ${worst.toFixed(1)}:1)` }
        : { label: 'Color Contrast', status: 'pass', note: `All ${measured} measured text elements meet WCAG AA` });

    // 2 - heading structure
    const hs = Array.prototype.filter.call(document.querySelectorAll('h1,h2,h3,h4,h5,h6'), vis);
    const h1 = hs.filter((h) => h.tagName === 'H1').length;
    let jumps = 0;
    for (let i = 1; i < hs.length; i++) if (+hs[i].tagName[1] - +hs[i - 1].tagName[1] > 1) jumps++;
    res.push(!hs.length
      ? { label: 'Heading Structure', status: 'warn', note: 'No headings found' }
      : h1 === 1 && !jumps
        ? { label: 'Heading Structure', status: 'pass', note: `Single h1, ${plural(hs.length - 1, 'other heading')} in order` }
        : { label: 'Heading Structure', status: 'warn', note: `${h1 === 1 ? 'Single h1' : plural(h1, 'h1')}${jumps ? `, ${plural(jumps, 'skipped level')}` : ''}` });

    // 3 - image alt text (empty alt = decorative = fine)
    const imgs = Array.prototype.filter.call(document.querySelectorAll('img'), (i) => !isOurs(i));
    const noAlt = imgs.filter((i) => !i.hasAttribute('alt') && i.getAttribute('role') !== 'presentation').length;
    res.push(!imgs.length
      ? { label: 'Image Alt Text', status: 'pass', note: 'No images on this page' }
      : noAlt
        ? { label: 'Image Alt Text', status: 'warn', note: `${noAlt} of ${plural(imgs.length, 'image')} missing an alt attribute` }
        : { label: 'Image Alt Text', status: 'pass', note: `All ${plural(imgs.length, 'image')} have alt attributes` });

    // 4 - keyboard navigation
    const posTab = document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex^="-"])').length;
    const fake = Array.prototype.filter.call(document.querySelectorAll('[onclick],[role="button"],[role="link"]'), (e) => vis(e) && !e.matches('a[href],button,input,select,textarea,summary,[tabindex]')).length;
    res.push(posTab || fake
      ? { label: 'Keyboard Navigation', status: 'warn', note: [posTab && `${plural(posTab, 'positive tabindex')} breaks natural order`, fake && `${plural(fake, 'clickable element')} not reachable by keyboard`].filter(Boolean).join('; ') }
      : { label: 'Keyboard Navigation', status: 'pass', note: 'Tab order follows document order' });

    // 5 - focus visibility (really focus the first controls and compare styles)
    const focusables = Array.prototype.filter.call(document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex^="-"])'), (e) => !isOurs(e) && !e.disabled && vis(e)).slice(0, 25);
    const sig = (e) => { const c = getComputedStyle(e); return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.backgroundColor, c.textDecorationLine, c.color].join('|'); };
    const prevActive = document.activeElement;
    let noRing = 0;
    for (const e of focusables) {
      try {
        const before = sig(e);
        e.focus({ preventScroll: true });
        const after = sig(e);
        if (before === after) noRing++;
        e.blur();
      } catch { /* ignore */ }
    }
    try { if (prevActive && prevActive.focus && prevActive !== document.body) prevActive.focus({ preventScroll: true }); } catch { /* ignore */ }
    res.push(!focusables.length
      ? { label: 'Focus Visibility', status: 'pass', note: 'No focusable controls found' }
      : noRing
        ? { label: 'Focus Visibility', status: 'warn', note: `${noRing} of ${plural(focusables.length, 'control')} show no visible focus change` }
        : { label: 'Focus Visibility', status: 'pass', note: `Focus indicator visible on all ${plural(focusables.length, 'control')} checked` });

    // 6 - accessible name of buttons and links
    const named = (e) => (e.getAttribute('aria-label') || '').trim() || e.getAttribute('aria-labelledby') || (e.getAttribute('title') || '').trim() || (e.textContent || '').trim() || Array.prototype.some.call(e.querySelectorAll('img[alt]'), (i) => i.alt.trim());
    const ctrls = Array.prototype.filter.call(document.querySelectorAll('button,[role="button"],a[href]'), (e) => !isOurs(e) && vis(e));
    const unnamed = ctrls.filter((e) => !named(e)).length;
    res.push(unnamed
      ? { label: 'Button Label', status: 'warn', note: `${plural(unnamed, 'button/link')} without an accessible name (e.g. icon-only without aria-label)` }
      : { label: 'Button Label', status: 'pass', note: ctrls.length ? `All ${plural(ctrls.length, 'button/link')} have accessible names` : 'No buttons or links found' });

    // 7 - form labels
    const fields = Array.prototype.filter.call(document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image]),select,textarea'), (e) => !isOurs(e) && vis(e));
    const labelled = (e) => (e.getAttribute('aria-label') || '').trim() || e.getAttribute('aria-labelledby') || (e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`)) || e.closest('label') || (e.getAttribute('title') || '').trim();
    const unlabelled = fields.filter((e) => !labelled(e)).length;
    res.push(unlabelled
      ? { label: 'Form Label', status: 'warn', note: `${plural(unlabelled, 'form field')} missing a label (placeholder alone is not enough)` }
      : { label: 'Form Label', status: 'pass', note: fields.length ? `All ${plural(fields.length, 'form field')} are labelled` : 'No form fields found' });
    return res;
  }

  /* ------------------------------------------------------------ page info */
  function domFramework() {
    const d = document;
    if (d.querySelector('#__next,script#__NEXT_DATA__')) return ['Next.js'];
    if (d.querySelector('#__nuxt')) return ['Nuxt'];
    if (d.querySelector('[ng-version]')) return ['Angular'];
    if (d.querySelector('[data-v-app]')) return ['Vue'];
    if (d.querySelector('[class*="svelte-"]')) return ['Svelte'];
    return [];
  }
  // the page's own icon: <link rel="icon"> or /favicon.ico (empty for non-http pages)
  function faviconUrl() {
    const link = document.querySelector('link[rel~="icon"],link[rel="shortcut icon"]');
    if (link && link.href) return link.href;
    return /^https?:$/.test(location.protocol) ? `${location.origin}/favicon.ico` : '';
  }
  function info() {
    const de = document.documentElement;
    return {
      url: location.href,
      title: document.title,
      favicon: faviconUrl(),
      protocol: location.protocol.replace(':', '').toUpperCase(),
      host: location.host,
      frameworks: frameworks || domFramework(),
      viewport: { w: window.innerWidth, h: window.innerHeight },
      dpr: window.devicePixelRatio,
      scroll: { w: de.scrollWidth, h: de.scrollHeight },
      hScroll: de.scrollWidth > de.clientWidth + 1,
      online: navigator.onLine,
      ready: document.readyState
    };
  }
  function pushInfoIfChanged(force) {
    const i = info();
    const sig = [i.url, i.title, i.favicon, i.viewport.w, i.viewport.h, i.scroll.w, i.scroll.h, i.dpr, i.ready, (i.frameworks || []).join()].join('|');
    if (force || sig !== lastSig) {
      const urlChanged = !lastSig || lastSig.split('|')[0] !== i.url;
      lastSig = sig;
      post(urlChanged ? 'navigated' : 'info', { info: i });
    }
  }

  /* ------------------------------------------------------------ commands from viewer */
  const reply = (m, data) => post('res', { reqId: m.reqId, data });
  window.addEventListener('message', (e) => {
    if (e.source !== window.parent || e.origin !== ORIGIN) return;
    const m = e.data;
    if (!m || m.rdt !== 1) return;
    try {
      switch (m.type) {
        case 'hello': post('ready', { info: info() }); break;
        case 'config':
          touchOn = !!m.touch;
          mutations = !!m.mutations;
          if (!inspecting) refreshStyle();
          break;
        case 'inspect': setInspect(!!m.on); break;
        case 'sample': setSampling(!!m.on); break;
        case 'palette': reply(m, paletteColors()); break;
        case 'children': { const el = nodeAt(m.path); reply(m, el ? kids(el).slice(0, 300).map(treeNode) : []); break; }
        case 'select': { const el = nodeAt(m.path); if (el) { select(el); try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch { /* */ } } break; }
        case 'selected': reply(m, selectedEl && selectedEl.isConnected ? elInfo(selectedEl) : null); break;
        case 'element': { const el = nodeAt(m.path); reply(m, el ? elInfo(el) : null); break; }
        case 'a11y': reply(m, a11yAudit()); break;
        case 'highlight': tempEl = nodeAt(m.path); paint(); break;
        case 'unhighlight': tempEl = null; paint(); break;
        case 'overflow': reply(m, scanOverflow()); break;
        case 'overflow:mark': markOverflow(m.items); break;
        case 'overflow:clear': paint(); break;
        case 'info': reply(m, info()); break;
        case 'back': history.back(); break;
        case 'forward': history.forward(); break;
        case 'reload': location.reload(); break;
        case 'scrollTo': {
          const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          ignoreScrollUntil = Date.now() + 120;
          window.scrollTo(window.scrollX, (m.ratio || 0) * max);
          break;
        }
        default: break;
      }
    } catch (err) { /* never break the host page */ }
  });

  window.addEventListener('scroll', () => {
    if (Date.now() < ignoreScrollUntil) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    post('scroll', { ratio: window.scrollY / max });
  }, { passive: true });

  let mTimer = 0;
  new MutationObserver(() => {
    if (!mutations || mTimer) return;
    mTimer = setTimeout(() => { mTimer = 0; post('mutated', {}); }, 500);
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* ------------------------------------------------------------ colour sampling */
  // Parses "rgb(…)" / "rgba(…)" (also the modern space syntax) into {r,g,b,a}; null for anything else.
  // Modern sites (Tailwind v4, design tokens) return colours as oklch(), lab(), color-mix() or color(srgb …).
  // Those are not rgb() strings, so any other colour is resolved to sRGB by a 1x1 canvas.
  let colorCtx = null;
  function parseRgb(c) {
    if (!c) return null;
    const m = /^rgba?\(([^)]+)\)$/.exec(c);
    if (m) {
      const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
      return p.length >= 3 && p.every((x) => !Number.isNaN(x)) ? { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 } : null;
    }
    if (!colorCtx) { const cv = document.createElement('canvas'); cv.width = cv.height = 1; colorCtx = cv.getContext('2d', { willReadFrequently: true }); }
    colorCtx.fillStyle = '#010203';
    const before = colorCtx.fillStyle;
    colorCtx.fillStyle = c;
    if (colorCtx.fillStyle === before) return null; // not a colour the canvas understands
    colorCtx.clearRect(0, 0, 1, 1);
    colorCtx.fillRect(0, 0, 1, 1);
    const d = colorCtx.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
  }
  // The colour a visitor actually sees behind an element: its own background if opaque, otherwise the first
  // non-transparent background up the tree (translucent layers are blended over white, the page default).
  function visibleBackground(el) {
    for (let e = el; e && e !== document.documentElement.parentElement; e = e.parentElement) {
      const c = parseRgb(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) {
        const a = Math.min(1, c.a);
        const rgbOut = [c.r * a + 255 * (1 - a), c.g * a + 255 * (1 - a), c.b * a + 255 * (1 - a)].map(Math.round);
        return { rgb: rgbOut, source: e === el ? 'element' : 'ancestor' };
      }
    }
    return { rgb: [255, 255, 255], source: 'page' };
  }
  // Does the element itself contain visible text? (a text node that is a direct child, e.g. <h1>Title</h1>)
  function hasOwnText(el) {
    for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    return false;
  }
  // What the pointer is on decides the colour:
  //  - text, on a transparent element -> its text colour
  //  - an element with its own background -> that background
  //  - anything else -> the background the visitor sees behind it
  function sampleInfo(el) {
    const cs = getComputedStyle(el);
    const bg = visibleBackground(el);
    const t = parseRgb(cs.color);
    const text = t && t.a > 0.5 ? [Math.round(t.r), Math.round(t.g), Math.round(t.b)] : null;
    // a text element WITHOUT its own background gives its text colour; one with its own background (a button,
    // a code block) gives that background
    const kind = hasOwnText(el) && text && bg.source !== 'element' ? 'text' : 'box';
    return {
      label: labelOf(el),
      tag: el.localName,
      kind,
      bg: bg.rgb,
      bgSource: bg.source,
      text,
      primary: kind === 'text' ? text : bg.rgb,
    };
  }
  let sampleEl = null, sampleRaf = 0, samplePending = null;
  const onSampleMove = (e) => {
    const el = elAt(e);
    if (!el || el === sampleEl) return;
    sampleEl = el;
    samplePending = el;
    if (!sampleRaf) sampleRaf = requestAnimationFrame(() => { sampleRaf = 0; if (samplePending) post('sample:hover', { info: sampleInfo(samplePending) }); });
  };
  const onSampleClick = (e) => {
    swallow(e);
    const el = elAt(e) || sampleEl;
    if (el) post('sample:pick', { info: sampleInfo(el) });
    setSampling(false);
  };
  function setSampling(on) {
    if (on === sampling) return;
    sampling = on;
    if (on) {
      window.addEventListener('mousemove', onSampleMove, true);
      window.addEventListener('click', onSampleClick, true);
      EVTS.forEach((n) => window.addEventListener(n, swallow, true));
    } else {
      window.removeEventListener('mousemove', onSampleMove, true);
      window.removeEventListener('click', onSampleClick, true);
      EVTS.forEach((n) => window.removeEventListener(n, swallow, true));
      sampleEl = null; samplePending = null;
    }
    refreshStyle();
    post('sample:state', { on });
  }
  // Colours used on this page, most used first: backgrounds, text and borders (opaque ones only).
  function paletteColors(limit = 14) {
    const counts = new Map();
    const add = (c) => {
      if (!c || c.a < 0.5) return;
      const k = `${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)}`;
      counts.set(k, (counts.get(k) || 0) + 1);
    };
    const all = document.body ? document.body.querySelectorAll('*') : [];
    for (let i = 0; i < all.length && i < 5000; i++) {
      const el = all[i];
      if (isOurs(el)) continue;
      const cs = getComputedStyle(el);
      add(parseRgb(cs.backgroundColor));
      add(parseRgb(cs.color));
      if (parseFloat(cs.borderTopWidth) > 0) add(parseRgb(cs.borderTopColor));
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
      .map(([k, n]) => ({ rgb: k.split(',').map(Number), n }));
  }

  /* ------------------------------------------------------------ scrollbars */
  // The device is a phone or a screen, not a desktop window: its scrollbar would eat part of the page. The page is
  // still scrollable with the wheel, trackpad and touch; only the bar itself is hidden. Works on every device.
  function hideScrollbars() {
    if (document.getElementById('rdt-noscrollbar')) return;
    const st = document.createElement('style');
    st.id = 'rdt-noscrollbar';
    st.textContent = 'html,body{scrollbar-width:none !important;-ms-overflow-style:none !important}' +
      '::-webkit-scrollbar{width:0 !important;height:0 !important;display:none !important}';
    (document.head || document.documentElement).appendChild(st);
  }

  /* ------------------------------------------------------------ boot */
  hideScrollbars();
  Promise.resolve(ext.runtime.sendMessage({ type: 'whoami' })).then((r) => { if (r) frameId = r.frameId; }).catch(() => {}).then(() => {
    post('ready', { info: info() });
    lastSig = '';
    pushInfoIfChanged(true);
    Promise.resolve(ext.runtime.sendMessage({ type: 'detectFramework' })).then((r) => {
      if (r && Array.isArray(r.frameworks)) { frameworks = r.frameworks; pushInfoIfChanged(true); }
    }).catch(() => {});
  });
  setInterval(() => pushInfoIfChanged(false), 600);
  window.addEventListener('load', () => pushInfoIfChanged(true));
})();
