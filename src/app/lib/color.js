// Colour conversions used by the Color Picker. Inputs are [r, g, b] with 0..255 integers.
export const isHex = (v) => /^#[0-9a-fA-F]{6}$/.test(v);

export const toHex = ([r, g, b]) => "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("").toUpperCase();

export const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const toRgbString = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;

export function toHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

// OKLCH as CSS: oklch(62.3% 0.188 259.8) (Björn Ottosson's OKLab matrices)
export function toOklch([r, g, b]) {
  const R = lin(r / 255), G = lin(g / 255), B = lin(b / 255);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${h.toFixed(1)})`;
}
