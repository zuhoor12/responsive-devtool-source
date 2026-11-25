import rdt from "@core/index.js";

const FORMAT = { PNG: "png", JPEG: "jpeg", WebP: "webp" };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const screenEl = (id) => document.querySelector(`[data-rdt-screen="${id}"]`) || document.querySelector(`iframe[name="rdt-${id}"]`);

/** Bounding box of a device screen plus its frame artwork (the PNG bezel overflows the screen box). */
function frameRect(id) {
  const screen = screenEl(id);
  if (!screen) return null;
  const host = screen.parentElement || screen;
  let { left, top, right, bottom } = host.getBoundingClientRect();
  host.querySelectorAll("img").forEach((img) => {
    const r = img.getBoundingClientRect();
    left = Math.min(left, r.left); top = Math.min(top, r.top); right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
  });
  const s = screen.getBoundingClientRect();
  left = Math.min(left, s.left); top = Math.min(top, s.top); right = Math.max(right, s.right); bottom = Math.max(bottom, s.bottom);
  return { left, top, width: right - left, height: bottom - top };
}

/**
 * t = useDevTool() value. Returns { canvas, name }.
 * Chrome + advanced emulation gives sharp, DPR-correct captures (also full page). Everywhere else the visible
 * tab is captured and cropped at 100 % zoom, which is what you see on screen.
 */
export async function takeScreenshot(opts, t) {
  // "native" = the device's own pixel ratio (3x for an iPhone): the sharp default. 1x/2x/3x = fixed multipliers.
  const scale = opts.scale === "native" ? (t.selectedDevice?.dpr || 1) : (parseInt(opts.scale, 10) || 1);
  const format = FORMAT[opts.format] || "png";
  const quality = opts.quality;
  const id = t.activeDeviceId;
  const dev = t.visibleDevices.find((d) => d.id === id) || t.selectedDevice;
  const live = !!t.activeUrl;
  const multi = t.viewMode === "multi";

  // In Chrome the page is captured through the DevTools protocol at the device's real size, whatever the zoom
  // is. That needs Advanced emulation, started from this click (first await = permission-free attach).
  let useCdp = t.cdp.active;
  if (live && !useCdp && t.cdp.supported) useCdp = await t.ensureAdvanced();
  if (live && opts.scope === "full" && !useCdp) throw new Error("Full-page capture needs Chrome with advanced emulation enabled.");
  if (live && scale > 1 && !useCdp) throw new Error(`${scale}x capture needs Chrome with advanced emulation enabled. Use 1x, or switch to Chrome.`);

  const sizeName = `${t.size.width}x${t.size.height}`;
  const base = `screenshot-${sizeName}`;
  const ext = format === "jpeg" ? "jpg" : format;
  const dark = t.theme !== "light";

  if (live && useCdp && (opts.scope === "viewport" || opts.scope === "full")) {
    const canvas = await rdt.capture.captureDevice(id, { fullPage: opts.scope === "full", scale, format, quality });
    return { canvas, name: `${base}${opts.scope === "full" ? "-full" : ""}.${ext}` };
  }
  if (live && useCdp && opts.scope === "all" && multi) {
    const items = [];
    for (const d of t.visibleDevices) {
      const c = await rdt.capture.captureDevice(d.id, { scale: Math.min(scale, 2), format, quality });
      items.push({ canvas: c, label: `${d.name}  ${d.width}×${d.height}` });
    }
    return { canvas: rdt.capture.contactSheet(items, { dark }), name: `screenshots-all-devices.${ext}` };
  }

  // ---- tab capture: hide dialogs/toasts first so they are not part of the picture ----
  t.closeDialog("screenshot");
  document.body.classList.add("rdt-capturing");
  const oldZoom = t.zoom;
  try {
    // the fallback copies what is drawn on screen: at 100 % the device is captured at its real size, not shrunk
    if (opts.scope === "viewport") t.setZoom(100);
    await wait(350);
    if (opts.scope === "frame" || opts.scope === "all") {
      t.fitToScreen();
      await wait(450);
    }
    let canvas;
    if (opts.scope === "all") {
      const ws = t.workspaceRef.current;
      if (!ws) throw new Error("Nothing to capture.");
      canvas = await rdt.capture.captureElement(ws);
      return { canvas, name: `screenshots-all-devices.${ext}` };
    }
    if (opts.scope === "frame") {
      const r = frameRect(id);
      if (!r) throw new Error("Nothing to capture.");
      canvas = await rdt.capture.captureRect(r);
      return { canvas, name: `${base}-frame.${ext}` };
    }
    const el = screenEl(id);
    if (!el) throw new Error("Nothing to capture.");
    canvas = await rdt.capture.captureElement(el);
    return { canvas, name: `${base}.${ext}` };
  } finally {
    document.body.classList.remove("rdt-capturing");
    if (opts.scope === "frame" || opts.scope === "all" || opts.scope === "viewport") t.setZoom(oldZoom);
    void dev;
  }
}

export const copyShot = (r) => rdt.capture.copyCanvas(r.canvas);
export const downloadShot = (r, format, quality) => rdt.capture.downloadCanvas(r.canvas, r.name, FORMAT[format] || "png", quality);
