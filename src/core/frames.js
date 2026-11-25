import { createEmitter } from './emitter.js';

/**
 * Frame registry + postMessage bridge to the inspector agent (content script)
 * running inside every device iframe.
 */
export const events = createEmitter();           // shared event bus for the whole core
const frames = new Map();                        // deviceId -> HTMLIFrameElement
const refCache = new Map();                      // deviceId -> stable callback ref
const pending = new Map();
let seq = 0;
let agentConfig = { touch: false, mutations: false };
let onReady = () => {};                          // set by net.js (frameId -> deviceId mapping)
export const _setReadyHook = (fn) => { onReady = fn; };

export const SANDBOX = 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-pointer-lock';

/** Props every device <iframe> must get. `name` is how the background identifies the frame. */
export const iframeProps = (deviceId) => ({ name: `rdt-${deviceId}`, sandbox: SANDBOX });

export function register(deviceId, el) { if (el) frames.set(deviceId, el); }
export function unregister(deviceId, el) { if (!el || frames.get(deviceId) === el) frames.delete(deviceId); }
export const has = (deviceId) => frames.has(deviceId);
export const ids = () => [...frames.keys()];

/** React helper: <iframe ref={rdt.frames.ref('iphone-15')} {...rdt.frames.iframeProps('iphone-15')} /> */
export function ref(deviceId) {
  if (!refCache.has(deviceId)) {
    let last = null;
    refCache.set(deviceId, (el) => {
      if (el) { last = el; register(deviceId, el); }
      else { unregister(deviceId, last); last = null; }
    });
  }
  return refCache.get(deviceId);
}

export function post(deviceId, type, payload = {}) {
  const el = frames.get(deviceId);
  try { if (el && el.contentWindow) el.contentWindow.postMessage({ rdt: 1, type, ...payload }, '*'); } catch { /* detached */ }
}
export function broadcast(type, payload = {}) { for (const id of frames.keys()) post(id, type, payload); }

export function request(deviceId, type, payload = {}, timeout = 4000) {
  return new Promise((resolve) => {
    const reqId = ++seq;
    const t = setTimeout(() => { pending.delete(reqId); resolve(null); }, timeout);
    pending.set(reqId, (v) => { clearTimeout(t); resolve(v); });
    post(deviceId, type, { ...payload, reqId });
  });
}

/** Options applied to every frame now and whenever one (re)loads. { touch:boolean, mutations:boolean } */
export function setAgentConfig(patch) {
  agentConfig = { ...agentConfig, ...patch };
  broadcast('config', agentConfig);
}
export const getAgentConfig = () => agentConfig;

window.addEventListener('message', (e) => {
  const d = e.data;
  if (!d || d.rdt !== 1 || typeof d.type !== 'string') return;
  let deviceId = null;
  for (const [k, el] of frames) if (el.contentWindow === e.source) { deviceId = k; break; }
  if (!deviceId) return;                               // only trust our own device iframes

  switch (d.type) {
    case 'res': { const f = pending.get(d.reqId); if (f) { pending.delete(d.reqId); f(d.data); } break; }
    case 'ready':
      onReady(deviceId, d.frameId);
      post(deviceId, 'config', agentConfig);
      events.emit('frame:ready', { deviceId, frameId: d.frameId, info: d.info });
      break;
    case 'navigated': events.emit('frame:navigated', { deviceId, info: d.info }); break;
    case 'info': events.emit('frame:info', { deviceId, info: d.info }); break;
    case 'selected': events.emit('element:selected', { deviceId, element: d.el, picked: !!d.picked }); break;
    case 'inspect': events.emit('inspect:changed', { deviceId, on: !!d.on }); break;
    case 'sample:hover': events.emit('sample:hover', { deviceId, info: d.info }); break;
    case 'sample:pick': events.emit('sample:pick', { deviceId, info: d.info }); break;
    case 'sample:state': events.emit('sample:state', { deviceId, on: !!d.on }); break;
    case 'scroll': events.emit('scroll', { deviceId, ratio: d.ratio }); break;
    case 'mutated': events.emit('dom:mutated', { deviceId }); break;
    default: break;
  }
});

/* ---- typed convenience wrappers over the agent protocol ---- */
export const agent = {
  /** Start/stop "pick an element" mode inside one frame. Emits element:selected with picked:true. */
  inspect: (id, on) => post(id, 'inspect', { on }),
  /** Colour sampling: hover shows the colour under the pointer, a click picks it. */
  sample: (id, on) => post(id, 'sample', { on }),
  /** Colours used on the page → [{ rgb:[r,g,b], n }] (most used first) */
  palette: (id) => request(id, 'palette', {}, 6000),
  /** Children of the node at `path` (array of child indexes from <html>; [] = <html>). → [{p,t,id,c,n,txt}] */
  children: (id, path = []) => request(id, 'children', { path }),
  /** Select node → emits element:selected (picked:false) */
  select: (id, path) => post(id, 'select', { path }),
  /** Computed-style info of the selected element, or null. */
  selected: (id) => request(id, 'selected'),
  highlight: (id, path) => post(id, 'highlight', { path }),
  unhighlight: (id) => post(id, 'unhighlight'),
  /** → { vw, scrollW, items:[{p,label,right,left,w}] } */
  overflow: (id) => request(id, 'overflow'),
  markOverflow: (id, items) => post(id, 'overflow:mark', { items }),
  clearOverlay: (id) => post(id, 'overflow:clear'),
  /** Fresh page info (url,title,frameworks,viewport,scroll,hScroll…) */
  info: (id) => request(id, 'info'),
  back: (id) => (id ? post(id, 'back') : broadcast('back')),
  forward: (id) => (id ? post(id, 'forward') : broadcast('forward')),
  reload: (id) => (id ? post(id, 'reload') : broadcast('reload')),
  /** ratio 0..1 of the scrollable height (for synchronised scrolling) */
  scrollTo: (id, ratio) => post(id, 'scrollTo', { ratio }),
  /** Per-frame agent options, e.g. { touch:true }. Overrides setAgentConfig for that frame. */
  config: (id, cfg) => post(id, 'config', cfg),
  /** Accessibility audit of the page -> [{ label, status:'pass'|'warn', note }] */
  a11y: (id) => request(id, 'a11y', {}, 8000),
  /** Info of the node at `path` without selecting or highlighting it. */
  element: (id, path) => request(id, 'element', { path })
};
