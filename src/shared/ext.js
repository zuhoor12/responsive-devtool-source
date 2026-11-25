// Tiny cross-browser wrapper (Chrome `chrome.*` / Firefox `browser.*`, both promise based in MV3).
export const ext = globalThis.browser ?? globalThis.chrome ?? null;
export const hasExt = !!(ext && ext.runtime && ext.runtime.id);
export const TARGET = typeof __TARGET__ !== 'undefined' ? __TARGET__ : 'dev';
export const isFirefox = TARGET === 'firefox';
export const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'dev';

/** runtime.sendMessage that never throws; resolves null on failure. */
export function send(msg) {
  if (!hasExt) return Promise.resolve(null);
  try {
    return Promise.resolve(ext.runtime.sendMessage(msg)).catch(() => null);
  } catch {
    return Promise.resolve(null);
  }
}
