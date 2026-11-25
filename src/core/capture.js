import { send } from '../shared/ext.js';
import * as cdp from './cdp.js';

const mime = (f) => (f === 'jpeg' ? 'image/jpeg' : f === 'webp' ? 'image/webp' : 'image/png');
const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not decode image')); i.src = src; });
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Cross-browser capture: screenshot of the visible tab cropped to a DOM element (1x, what you see).
 * Hide modals/toasts and wait a frame BEFORE calling it – they would be part of the picture.
 */
export const captureElement = (el) => captureRect(el.getBoundingClientRect());

/** Same, for any rectangle in viewport coordinates ({ left, top, width, height }). */
export async function captureRect(b) {
  const r = await send({ type: 'capture' });
  if (!r || !r.dataUrl) throw new Error((r && r.error) || 'The browser refused to capture this tab.');
  const img = await loadImg(r.dataUrl);
  const k = img.width / window.innerWidth;
  const x = Math.max(0, b.left * k), y = Math.max(0, b.top * k);
  const w = Math.min(img.width - x, b.width * k), h = Math.min(img.height - y, b.height * k);
  const c = document.createElement('canvas');
  c.width = Math.round(w); c.height = Math.round(h);
  c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, c.width, c.height);
  return c;
}

/** Chrome + advanced emulation: sharp capture of the frame's own content (viewport or full page). */
export async function captureDevice(deviceId, opts = {}) {
  const r = await cdp.screenshot(deviceId, opts);
  if (!r.ok) throw new Error(r.error);
  const img = await loadImg(r.dataUrl);
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  c.getContext('2d').drawImage(img, 0, 0);
  return c;
}

export const canvasToBlob = (canvas, format = 'png', quality = 90) =>
  new Promise((res) => canvas.toBlob(res, mime(format), quality / 100));

/** Lay several canvases side by side with captions. items: [{ canvas, label }] */
export function contactSheet(items, { dark = true } = {}) {
  const gap = 48, pad = 48, label = 54;
  const H = Math.max(...items.map((i) => i.canvas.height));
  const W = items.reduce((s, i) => s + i.canvas.width, 0) + gap * (items.length - 1) + pad * 2;
  const c = document.createElement('canvas');
  c.width = W; c.height = H + pad * 2 + label;
  const g = c.getContext('2d');
  g.fillStyle = dark ? '#0b0e15' : '#eef0f4';
  g.fillRect(0, 0, c.width, c.height);
  const fs = Math.max(18, Math.round(H / 60));
  let x = pad;
  for (const it of items) {
    g.drawImage(it.canvas, x, pad);
    g.fillStyle = dark ? '#e6e9ef' : '#1f2937';
    g.font = `600 ${fs}px system-ui, sans-serif`;
    g.fillText(it.label || '', x, pad + H + fs + 14);
    x += it.canvas.width + gap;
  }
  return c;
}

export async function copyCanvas(canvas) {
  const blob = await canvasToBlob(canvas, 'png');
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}
export async function downloadCanvas(canvas, filename, format = 'png', quality = 90) {
  const blob = await canvasToBlob(canvas, format, quality);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
