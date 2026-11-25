import { ext, hasExt } from '../shared/ext.js';
import { events } from './frames.js';
import { ingest } from './net.js';
import { _setActive } from './cdp.js';
import { send } from '../shared/ext.js';

let port = null;
let timer = null;
let connected = false;
export const isConnected = () => connected;

/**
 * Opens the long-lived port to the background. While it is open the background:
 *  - strips X-Frame-Options / CSP from this tab's sub-frames (so any site can be framed)
 *  - injects the inspector agent into every device iframe
 *  - forwards webRequest events (network log)
 * Reconnects automatically (the MV3 service worker may be restarted by the browser).
 * Returns a disconnect function.
 */
export function connect() {
  if (!hasExt) return () => {};
  let stopped = false;
  const open = () => {
    if (stopped) return;
    try { port = ext.runtime.connect({ name: 'viewer' }); } catch { setTimeout(open, 1000); return; }
    connected = true; events.emit('bg:connected', { connected });
    port.onMessage.addListener((m) => {
      if (!m) return;
      if (m.type === 'hello') {
        _setActive(!!m.cdpActive);
        events.emit('bg:hello', { cdpSupported: !!m.cdpSupported, cdpActive: !!m.cdpActive });
        send({ type: 'inject' });                       // pick up frames that loaded before we connected
      } else if (m.type === 'net') {
        ingest(m.req);
      } else if (m.type === 'cdp') {
        _setActive(!!m.active, m.reason);
      }
    });
    port.onDisconnect.addListener(() => {
      connected = false; port = null; events.emit('bg:connected', { connected });
      if (!stopped) setTimeout(open, 600);
    });
  };
  open();
  timer = setInterval(() => { try { port && port.postMessage({ type: 'ping' }); } catch { /* reconnecting */ } }, 20000);
  return () => { stopped = true; clearInterval(timer); try { port && port.disconnect(); } catch { /* */ } };
}
