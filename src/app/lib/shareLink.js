// Shareable preview links: the current preview setup (url, device, size, zoom,
// orientation, theme) is encoded in the query of the extension page URL, so
// opening the link in the same extension restores exactly this view.

export function buildShareUrl({ activeUrl, selectedId, size, zoom, orientation, theme }) {
  const p = new URLSearchParams();
  if (activeUrl) p.set("url", activeUrl);
  p.set("device", selectedId);
  p.set("w", size.width);
  p.set("h", size.height);
  p.set("zoom", zoom);
  p.set("orientation", orientation);
  if (theme === "light") p.set("theme", "light");
  return `${window.location.origin}${window.location.pathname}?${p.toString()}#/`;
}

export function parseShareParams() {
  const p = new URLSearchParams(window.location.search);
  const num = (v, min, max, fallback) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
  };
  const url = p.get("url");
  return {
    url: url && /^https?:\/\//i.test(url) ? url : null,
    device: p.get("device"),
    w: num(p.get("w"), 40, 7680, null),
    h: num(p.get("h"), 40, 4320, null),
    zoom: num(p.get("zoom"), 25, 400, null),
    orientation: p.get("orientation"),
    theme: p.get("theme"),
  };
}
