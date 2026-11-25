/**
 * Responsive DevTool – extension core. The UI imports ONLY from here:
 *
 *   import rdt from '../core/index.js';
 *
 *   useEffect(() => rdt.connect(), []);                         // once, at app start
 *   <iframe ref={rdt.frames.ref(id)} {...rdt.frames.iframeProps(id)} src={url} />
 *   rdt.on('element:selected', ({ deviceId, element, picked }) => …)
 */
import { ext, hasExt, TARGET, isFirefox, VERSION } from '../shared/ext.js';
import * as framesApi from './frames.js';
import { net } from './net.js';
import * as cdp from './cdp.js';
import * as capture from './capture.js';
import { connect, isConnected } from './link.js';

const frames = {
  ref: framesApi.ref, iframeProps: framesApi.iframeProps, register: framesApi.register, unregister: framesApi.unregister,
  has: framesApi.has, ids: framesApi.ids, SANDBOX: framesApi.SANDBOX
};

export function normalizeUrl(v) {
  v = (v || '').trim();
  if (!v) return '';
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return v;
  if (/^(localhost|127\.|0\.0\.0\.0|\[::1\]|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(v)) return 'http://' + v;
  if (/^[\w-]+(:\d+)(\/|$)/.test(v)) return 'http://' + v;
  return 'https://' + v;
}

/** `?url=` passed by the toolbar button (the URL of the tab the user clicked from) */
export const initialUrl = () => new URLSearchParams(location.search).get('url') || '';

/** Persistent storage (chrome.storage.local, falls back to localStorage when the page is opened outside the extension). */
export const storage = {
  async get(key, fallback = null) {
    try {
      if (hasExt) { const r = await ext.storage.local.get(key); return r[key] ?? fallback; }
      const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  async set(key, value) {
    try { hasExt ? await ext.storage.local.set({ [key]: value }) : localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
  }
};

const rdt = {
  /** { extension:boolean, target:'chrome'|'firefox'|'dev', version, cdpSupported } */
  env: { extension: hasExt, target: TARGET, firefox: isFirefox, version: VERSION, cdpSupported: cdp.supported },
  connect,
  isConnected,
  on: framesApi.events.on,
  frames,
  agent: framesApi.agent,
  setAgentConfig: framesApi.setAgentConfig,
  net,
  cdp,
  capture,
  storage,
  normalizeUrl,
  initialUrl
};

export default rdt;
export { net, cdp, capture, frames };
