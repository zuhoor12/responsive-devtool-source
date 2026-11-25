import { events, _setReadyHook } from './frames.js';

/**
 * Per-device network log built from the background's webRequest events.
 * A request is attributed to a device through the frameId the content script reports on handshake.
 */
const frameMap = new Map();   // frameId -> deviceId
const parentOf = new Map();   // frameId -> parentFrameId
const waiting = new Map();    // frameId -> requests that arrived before the handshake
const logs = new Map();       // deviceId -> request[]
const docStatus = new Map();  // deviceId -> { code, error }
const LIMIT = 400;

function resolve(frameId, parentFrameId) {
  let f = frameId;
  for (let i = 0; i < 5 && f != null && f !== 0; i++) {
    if (frameMap.has(f)) return frameMap.get(f);
    f = parentOf.get(f);
  }
  return frameMap.get(parentFrameId) || null;
}

function route(req) {
  const deviceId = resolve(req.frameId, req.parentFrameId);
  if (!deviceId) {
    const q = waiting.get(req.frameId) || [];
    q.push(req); if (q.length > 80) q.shift();
    waiting.set(req.frameId, q);
    return;
  }
  if (req.kind === 'sub_frame' && req.parentFrameId === 0) {   // the iframe's own document → new navigation
    logs.set(deviceId, []);
    docStatus.set(deviceId, { code: req.status, error: req.error });
    events.emit('net:document', { deviceId, status: req.status, error: req.error, url: req.url });
    events.emit('net:cleared', { deviceId });
  }
  const list = logs.get(deviceId) || [];
  list.push(req);
  if (list.length > LIMIT) list.shift();
  logs.set(deviceId, list);
  events.emit('net:request', { deviceId, request: req });
}

_setReadyHook((deviceId, frameId) => {
  if (frameId == null) return;
  frameMap.set(frameId, deviceId);
  const q = waiting.get(frameId);
  if (q) { waiting.delete(frameId); q.forEach(route); }
});

/** called by link.js for every { type:'net' } message from the background */
export function ingest(req) {
  if (req.parentFrameId != null) parentOf.set(req.frameId, req.parentFrameId);
  route(req);
}

export const net = {
  /** Request[]: { id,url,method,kind,frameId,status(0=failed),error,size(bytes|null),cached,time(ms) } */
  get: (deviceId) => logs.get(deviceId) || [],
  status: (deviceId) => docStatus.get(deviceId) || null,
  clear: (deviceId) => { logs.set(deviceId, []); events.emit('net:cleared', { deviceId }); }
};
