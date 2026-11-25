import { useEffect, useState } from "react";
import rdt from "@core/index.js";
import { useDevTool } from "@/lib/DevToolContext";

const px = (v) => (!v ? "0" : `${Math.round(v * 100) / 100}px`);

/** [top,right,bottom,left] in px -> "0", "24px", "0 24px" or "1px 2px 3px 4px" */
export function fmtBox(box) {
  const a = (box || [0, 0, 0, 0]).map(px);
  if (a[0] === a[1] && a[1] === a[2] && a[2] === a[3]) return a[0];
  if (a[0] === a[2] && a[1] === a[3]) return `${a[0]} ${a[1]}`;
  return a.join(" ");
}

export function rgbToHex(c) {
  const m = /^rgba?\(([^)]+)\)$/.exec(c || "");
  if (!m) return c || "—";
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (p.length < 3 || p.some(Number.isNaN)) return c;
  const a = p.length > 3 ? p[3] : 1;
  if (a === 0) return "transparent";
  if (a < 1) return `rgba(${p[0]}, ${p[1]}, ${p[2]}, ${a})`;
  return `#${p.slice(0, 3).map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;
}

/** { family, size, line } -> "Inter · 16px/1.5" */
export function fmtFont(fp) {
  if (!fp) return "—";
  const size = parseFloat(fp.size);
  const line = parseFloat(fp.line);
  const ratio = Number.isFinite(line) && size ? `${Math.round((line / size) * 100) / 100}` : "normal";
  return `${fp.family} · ${fp.size}/${ratio}`;
}

export const fmtSize = (s) => (s ? `${Math.round(s.w)} × ${Math.round(s.h)}` : "—");

export function fmtBytes(n) {
  if (n == null) return "—";
  if (n < 1000) return `${n} B`;
  if (n < 1e6) return `${(n / 1000).toFixed(1)} kB`;
  return `${(n / 1e6).toFixed(2)} MB`;
}
export const fmtMs = (n) => (n == null ? "—" : n >= 1000 ? `${(n / 1000).toFixed(2)} s` : `${n} ms`);

export function requestName(url) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : u.host;
  } catch { return url; }
}

/**
 * The element the inspector shows: the one the user selected in the active device, otherwise <body>
 * (fetched without highlighting it). Returns null until the page has answered.
 */
export function useActiveElement() {
  const t = useDevTool();
  const id = t.activeDeviceId;
  const selected = t.selectedEl && t.selectedEl.deviceId === id ? t.selectedEl.element : null;
  const pageUrl = t.frameInfo[id] ? t.frameInfo[id].url : "";
  const [body, setBody] = useState(null);

  useEffect(() => {
    let dead = false;
    setBody(null);
    if (!t.activeUrl) return undefined;
    (async () => {
      const kids = await rdt.agent.children(id, []);
      const node = kids && kids.find((k) => k.t === "body");
      if (!node || dead) return;
      const el = await rdt.agent.element(id, node.p);
      if (!dead && el) setBody(el);
    })();
    return () => { dead = true; };
  }, [id, t.activeUrl, t.domTick, t.reloadKey, pageUrl]);

  return selected || body;
}

/** Width/height the inspector reports for the active device (real iframe viewport when a page is loaded). */
export function useActiveViewport() {
  const t = useDevTool();
  const info = t.frameInfo[t.activeDeviceId];
  if (t.activeUrl && info && info.viewport) return { width: info.viewport.w, height: info.viewport.h };
  if (t.viewMode === "multi") {
    const d = t.visibleDevices.find((x) => x.id === t.activeDeviceId);
    if (d) return { width: d.width, height: d.height };
  }
  return t.size;
}
