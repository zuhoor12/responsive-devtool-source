import { ext, isFirefox } from '../shared/ext.js';

/**
 * Background (service worker on Chrome, event page on Firefox).
 *
 * Responsibilities – all scoped to tabs that run our viewer page, so nothing
 * happens for normal browsing:
 *  1. open the viewer tab from the toolbar button
 *  2. strip X-Frame-Options / CSP from sub-frames of the viewer tab (DNR session rule)
 *  3. inject the inspector content script into the device iframes
 *  4. forward a per-frame network log (webRequest) to the viewer
 *  5. Chrome only, opt-in: CDP emulation (touch, UA, DPR, network throttling, hi-res screenshots)
 */

const VIEWER = 'viewer.html';
const sessions = new Map(); // tabId -> session
const cdp = new Map(); // tabId -> cdp state
const hasCdpApi = () => !!ext.debugger;

/* ------------------------------------------------------------------ open viewer */
ext.action.onClicked.addListener(async (tab) => {
  if (isFirefox) {
    try {
      const ok = await ext.permissions.contains({ origins: ['<all_urls>'] });
      if (!ok) await ext.permissions.request({ origins: ['<all_urls>'] });
    } catch { /* ignore */ }
  }
  const url = tab && /^https?:/i.test(tab.url || '') ? tab.url : '';
  const page = ext.runtime.getURL(VIEWER) + (url ? `?url=${encodeURIComponent(url)}` : '');
  await ext.tabs.create({ url: page, index: tab && typeof tab.index === 'number' ? tab.index + 1 : undefined });
});

/* ------------------------------------------------------------------ sessions */
function ensureSession(tabId) {
  let s = sessions.get(tabId);
  if (s) return s;
  s = { tabId, ports: new Set(), ruleId: (tabId % 100000) + 1, reqs: new Map(), netFns: null };
  sessions.set(tabId, s);
  installRule(s).catch((e) => console.warn('[rdt] header rule failed', e));
  attachNet(s);
  refreshNavListener();
  return s;
}

function disposeSession(tabId) {
  const s = sessions.get(tabId);
  if (!s) return;
  sessions.delete(tabId);
  detachNet(s);
  ext.declarativeNetRequest.updateSessionRules({ removeRuleIds: [s.ruleId] }).catch(() => {});
  cdpDisable(tabId).catch(() => {});
  refreshNavListener();
}

const notify = (s, msg) => s.ports.forEach((p) => { try { p.postMessage(msg); } catch { /* port closed */ } });

ext.runtime.onConnect.addListener((port) => {
  if (port.name !== 'viewer' || !port.sender || !port.sender.tab) return;
  const tabId = port.sender.tab.id;
  const s = ensureSession(tabId);
  s.ports.add(port);
  port.onMessage.addListener((m) => { if (m && m.type === 'ping') return; });
  port.onDisconnect.addListener(() => {
    s.ports.delete(port);
    if (!s.ports.size) setTimeout(() => { const cur = sessions.get(tabId); if (cur && !cur.ports.size) disposeSession(tabId); }, 8000);
  });
  port.postMessage({ type: 'hello', cdpSupported: hasCdpApi() || (!isFirefox), cdpActive: cdp.has(tabId) });
  injectExisting(tabId);
});

ext.tabs.onRemoved.addListener((tabId) => disposeSession(tabId));

/* ------------------------------------------------------------------ 2. header rule */
async function installRule(s) {
  const rule = {
    id: s.ruleId,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        { header: 'x-frame-options', operation: 'remove' },
        { header: 'content-security-policy', operation: 'remove' },
        { header: 'content-security-policy-report-only', operation: 'remove' }
      ]
    },
    condition: { tabIds: [s.tabId], resourceTypes: ['sub_frame'] }
  };
  await ext.declarativeNetRequest.updateSessionRules({ removeRuleIds: [s.ruleId], addRules: [rule] });
}

/* ------------------------------------------------------------------ 3. injection */
let navOn = false;
function onDomReady(d) {
  if (!sessions.has(d.tabId) || d.frameId === 0 || d.parentFrameId !== 0) return;
  inject(d.tabId, [d.frameId]);
}
function refreshNavListener() {
  const need = sessions.size > 0;
  if (need && !navOn) { ext.webNavigation.onDOMContentLoaded.addListener(onDomReady); navOn = true; }
  else if (!need && navOn) { ext.webNavigation.onDOMContentLoaded.removeListener(onDomReady); navOn = false; }
}
async function inject(tabId, frameIds) {
  try {
    const opts = { target: { tabId, frameIds }, files: ['content.js'] };
    if (!isFirefox) opts.injectImmediately = true;
    await ext.scripting.executeScript(opts);
  } catch { /* frame gone / error page */ }
}
async function injectExisting(tabId) {
  try {
    const frames = await ext.webNavigation.getAllFrames({ tabId });
    const ids = (frames || []).filter((f) => f.frameId !== 0 && f.parentFrameId === 0).map((f) => f.frameId);
    if (ids.length) await inject(tabId, ids);
  } catch { /* ignore */ }
}

/* Framework detection runs in the page's own JS world (needs access to page globals). */
function pageDetect() {
  const w = window, d = document, out = [];
  const keysOf = (el) => { try { return Object.keys(el); } catch { return []; } };
  const roots = [...d.querySelectorAll('#root,#app,#__next,#__nuxt,body > div,body')].slice(0, 12);
  const has = (re) => roots.some((el) => keysOf(el).some((k) => re.test(k)));
  if (w.__NEXT_DATA__ || w.next) out.push('Next.js');
  if (w.__NUXT__ || w.$nuxt) out.push('Nuxt');
  if (w.___gatsby) out.push('Gatsby');
  if (w.__remixContext) out.push('Remix');
  if (d.querySelector('astro-island,[data-astro-cid]')) out.push('Astro');
  if (w.ng || d.querySelector('[ng-version]')) out.push('Angular');
  if (w.__VUE__ || has(/^__vue/) || d.querySelector('[data-v-app]')) out.push('Vue');
  if (w.__svelte || d.querySelector('[class*="svelte-"]')) out.push('Svelte');
  if (w._$HY) out.push('Solid');
  if (has(/^__reactContainer\$|^__reactFiber\$|^_reactRootContainer/) || w.React) out.push('React');
  if (w.jQuery) out.push('jQuery');
  const gen = d.querySelector('meta[name=generator]');
  if (gen && gen.content) out.push(String(gen.content).split(' ')[0]);
  return out;
}
async function detectFramework(tabId, frameId) {
  try {
    const res = await ext.scripting.executeScript({ target: { tabId, frameIds: [frameId] }, world: 'MAIN', func: pageDetect });
    return (res && res[0] && res[0].result) || [];
  } catch { return null; }
}

/* ------------------------------------------------------------------ 4. network log */
function attachNet(s) {
  const filter = { urls: ['<all_urls>'], tabId: s.tabId };
  const wr = ext.webRequest;
  const onStart = (d) => {
    if (d.frameId === 0) return;
    s.reqs.set(d.requestId, { t0: d.timeStamp, url: d.url, method: d.method, type: d.type, frameId: d.frameId, parentFrameId: d.parentFrameId });
    if (s.reqs.size > 2000) s.reqs.delete(s.reqs.keys().next().value);
  };
  const finish = (d, failed) => {
    const r = s.reqs.get(d.requestId);
    if (!r) return;
    s.reqs.delete(d.requestId);
    let size = null;
    for (const h of d.responseHeaders || []) if (h.name.toLowerCase() === 'content-length') size = parseInt(h.value, 10);
    notify(s, {
      type: 'net',
      req: {
        id: d.requestId, url: r.url, method: r.method, kind: r.type, frameId: r.frameId, parentFrameId: r.parentFrameId,
        status: failed ? 0 : d.statusCode, error: failed ? d.error : null, size: Number.isFinite(size) ? size : null,
        cached: !!d.fromCache, time: Math.max(0, Math.round(d.timeStamp - r.t0))
      }
    });
  };
  const onDone = (d) => finish(d, false);
  const onFail = (d) => finish(d, true);
  wr.onBeforeRequest.addListener(onStart, filter);
  wr.onCompleted.addListener(onDone, filter, ['responseHeaders']);
  wr.onErrorOccurred.addListener(onFail, filter);
  s.netFns = { onStart, onDone, onFail };
}
function detachNet(s) {
  if (!s.netFns) return;
  const wr = ext.webRequest;
  wr.onBeforeRequest.removeListener(s.netFns.onStart);
  wr.onCompleted.removeListener(s.netFns.onDone);
  wr.onErrorOccurred.removeListener(s.netFns.onFail);
  s.netFns = null;
}

/* ------------------------------------------------------------------ 5. CDP (Chrome, opt-in) */
let cdpListening = false;
const cmd = (tabId, sessionId, method, params = {}) =>
  ext.debugger.sendCommand(sessionId ? { tabId, sessionId } : { tabId }, method, params);

function listenCdp() {
  if (cdpListening || !ext.debugger) return;
  cdpListening = true;
  ext.debugger.onEvent.addListener((source, method, params) => {
    const st = cdp.get(source.tabId);
    if (!st || source.sessionId) return;
    if (method === 'Target.attachedToTarget') onTargetAttached(source.tabId, st, params);
    else if (method === 'Target.detachedFromTarget') st.targets.delete(params.sessionId);
  });
  ext.debugger.onDetach.addListener((source, reason) => {
    if (source.sessionId || !cdp.has(source.tabId)) return;
    cdp.delete(source.tabId);
    const s = sessions.get(source.tabId);
    if (s) notify(s, { type: 'cdp', active: false, reason });
  });
}

async function cdpEnable(tabId) {
  if (!ext.debugger) throw new Error('Debugger API unavailable – grant the "debugger" permission first.');
  listenCdp();
  if (cdp.has(tabId)) return;
  const st = { targets: new Map(), config: { devices: {}, network: null, media: null } };
  cdp.set(tabId, st);
  try {
    try { await ext.debugger.attach({ tabId }, '1.3'); }
    catch (e) {
      // left over from a service-worker restart: re-attach cleanly
      if (/already attached/i.test(String(e && e.message))) { await ext.debugger.detach({ tabId }).catch(() => {}); await ext.debugger.attach({ tabId }, '1.3'); }
      else throw e;
    }
    await cmd(tabId, null, 'Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
  } catch (e) {
    cdp.delete(tabId);
    throw e;
  }
  const s = sessions.get(tabId);
  if (s) notify(s, { type: 'cdp', active: true });
}

async function cdpDisable(tabId) {
  if (!cdp.has(tabId)) return;
  cdp.delete(tabId);
  try { await ext.debugger.detach({ tabId }); } catch { /* already detached */ }
  const s = sessions.get(tabId);
  if (s) notify(s, { type: 'cdp', active: false });
}

async function onTargetAttached(tabId, st, p) {
  const sid = p.sessionId;
  const entry = { deviceId: null, type: p.targetInfo && p.targetInfo.type };
  st.targets.set(sid, entry);
  try {
    await cmd(tabId, sid, 'Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
    if (entry.type === 'iframe') {
      const r = await cmd(tabId, sid, 'Runtime.evaluate', { expression: 'window.name', returnByValue: true });
      const name = (r && r.result && r.result.value) || '';
      if (typeof name === 'string' && name.startsWith('rdt-')) entry.deviceId = name.slice(4);
    }
    await applyConfig(tabId, sid, st, entry);
  } catch { /* target vanished */ }
}

async function applyConfig(tabId, sid, st, entry) {
  const safe = async (method, params) => { try { await cmd(tabId, sid, method, params); } catch { /* unsupported */ } };
  const n = st.config.network;
  if (n && (n.offline || n.down > 0 || n.up > 0 || n.latency > 0)) {
    const params = {
      offline: !!n.offline, latency: n.latency || 0,
      downloadThroughput: n.down > 0 ? Math.round(n.down * 125000) : -1,
      uploadThroughput: n.up > 0 ? Math.round(n.up * 125000) : -1
    };
    await safe('Network.enable', {});
    try { await cmd(tabId, sid, 'Network.emulateNetworkConditions', n.loss > 0 ? { ...params, packetLoss: n.loss } : params); }
    catch { await safe('Network.emulateNetworkConditions', params); }
  } else {
    await safe('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  }
  const dev = entry.deviceId && st.config.devices[entry.deviceId];
  if (dev) {
    await safe('Emulation.setDeviceMetricsOverride', { width: 0, height: 0, deviceScaleFactor: dev.dpr || 0, mobile: false });
    await safe('Emulation.setTouchEmulationEnabled', { enabled: !!dev.touch, maxTouchPoints: 5 });
    await safe('Emulation.setEmitTouchEventsForMouse', { enabled: !!dev.touch, configuration: 'mobile' });
    await safe('Emulation.setUserAgentOverride', { userAgent: dev.ua || '' });
  }
  const media = st.config.media || {};
  await safe('Emulation.setFocusEmulationEnabled', { enabled: !!media.focus });
  await safe('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-color-scheme', value: media.dark ? 'dark' : '' },
      { name: 'prefers-reduced-motion', value: media.reducedMotion ? 'reduce' : '' }
    ]
  });
}

async function cdpConfigure(tabId, config) {
  const st = cdp.get(tabId);
  if (!st) return;
  st.config = config;
  for (const [sid, entry] of st.targets) await applyConfig(tabId, sid, st, entry);
}

async function cdpShot(tabId, o) {
  const st = cdp.get(tabId);
  if (!st) throw new Error('Advanced emulation is not active.');
  let sid = null, entry = null;
  for (const [k, v] of st.targets) if (v.deviceId === o.deviceId) { sid = k; entry = v; }
  if (!sid) throw new Error('This device frame is not attached yet – reload the page and try again.');
  const format = o.format === 'jpeg' || o.format === 'webp' ? o.format : 'png';
  const scale = Math.min(4, Math.max(1, o.scale || 1));
  const m = await cmd(tabId, sid, 'Page.getLayoutMetrics');
  const vv = m.cssVisualViewport || m.visualViewport;
  const cs = m.cssContentSize || m.contentSize;
  const clip = o.fullPage
    ? { x: 0, y: 0, width: Math.ceil(cs.width), height: Math.ceil(cs.height), scale: 1 }
    : { x: vv.pageX, y: vv.pageY, width: vv.clientWidth, height: vv.clientHeight, scale: 1 };
  // output pixels = css px × deviceScaleFactor, so temporarily use the requested scale as DPR
  await cmd(tabId, sid, 'Emulation.setDeviceMetricsOverride', { width: 0, height: 0, deviceScaleFactor: scale, mobile: false });
  try {
    const params = { format, clip, captureBeyondViewport: !!o.fullPage, fromSurface: true };
    if (format !== 'png') params.quality = Math.round(o.quality || 90);
    const r = await cmd(tabId, sid, 'Page.captureScreenshot', params);
    return r.data;
  } finally {
    await applyConfig(tabId, sid, st, entry);
  }
}

/* ------------------------------------------------------------------ messages */
async function handle(msg, sender) {
  const tabId = sender.tab && sender.tab.id;
  switch (msg && msg.type) {
    case 'whoami':
      return { frameId: sender.frameId, tabId };
    case 'detectFramework':
      return { frameworks: await detectFramework(tabId, sender.frameId) };
    case 'capture':
      return { dataUrl: await ext.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }) };
    case 'inject':
      await injectExisting(tabId);
      return { ok: true };
    case 'cdp:enable':
      ensureSession(tabId);
      await cdpEnable(tabId);
      return { ok: true };
    case 'cdp:disable':
      await cdpDisable(tabId);
      return { ok: true };
    case 'cdp:config':
      await cdpConfigure(tabId, msg.config);
      return { ok: true };
    case 'cdp:shot':
      return { data: await cdpShot(tabId, msg) };
    default:
      return null;
  }
}

ext.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handle(msg, sender).then(sendResponse, (e) => sendResponse({ error: String((e && e.message) || e) }));
  return true;
});
