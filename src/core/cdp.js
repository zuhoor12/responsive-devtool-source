import { ext, hasExt, isFirefox, send } from '../shared/ext.js';
import { events } from './frames.js';

/** Chrome-only "advanced emulation" through chrome.debugger (opt-in, optional permission). */
export const supported = hasExt && !isFirefox;
let active = false;
export const isActive = () => active;
export function _setActive(v, reason) { active = !!v; events.emit('cdp:status', { active, reason: reason || null }); }

/**
 * Must be called from inside a click handler (user gesture) – Chrome shows the permission prompt once.
 * → { ok:true } | { ok:false, error }
 */
export async function enable() {
  if (!supported) return { ok: false, error: 'Advanced emulation needs Chrome / Chromium.' };
  // "debugger" is a required permission in the Chrome manifest (Chrome does not allow it as optional),
  // so there is nothing to request here.
  const r = await send({ type: 'cdp:enable' });
  if (!r || r.error) return { ok: false, error: (r && r.error) || 'Could not attach.' };
  _setActive(true);
  return { ok: true };
}

export async function disable() { await send({ type: 'cdp:disable' }); _setActive(false); }

/**
 * Apply emulation to the device frames.
 *  devices: { [deviceId]: { dpr:number, touch:boolean, ua:string } }
 *  network: null (no throttling) | { offline?:boolean, down:Mbps, up:Mbps, latency:ms, loss:% }   (0 = unlimited)
 *  media:   { dark?, reducedMotion?, focus? } -> prefers-color-scheme / prefers-reduced-motion / page always reports focus
 */
export function configure({ devices = {}, network = null, media = null } = {}) {
  if (!active) return Promise.resolve(null);
  return send({ type: 'cdp:config', config: { devices, network, media } });
}

/** Hi-res screenshot of one device frame. → { ok, dataUrl, error } */
export async function screenshot(deviceId, { fullPage = false, scale = 1, format = 'png', quality = 90 } = {}) {
  const r = await send({ type: 'cdp:shot', deviceId, fullPage, scale, format, quality });
  if (!r || r.error || !r.data) return { ok: false, error: (r && r.error) || 'Capture failed.' };
  return { ok: true, dataUrl: `data:image/${format};base64,${r.data}` };
}

export const NET_PRESETS = {
  online: { label: 'Online', down: 0, up: 0, latency: 0, loss: 0 },
  'fast-3g': { label: 'Fast 3G', down: 1.6, up: 0.75, latency: 150, loss: 0 },
  'slow-3g': { label: 'Slow 3G', down: 0.4, up: 0.4, latency: 400, loss: 2 },
  '4g': { label: '4G', down: 12, up: 6, latency: 70, loss: 0 },
  offline: { label: 'Offline', down: 0, up: 0, latency: 0, loss: 0, offline: true }
};
