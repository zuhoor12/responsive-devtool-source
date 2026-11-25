// The browser UI that is drawn INSIDE a device frame (address bar, status bar, taskbar ...).
// It is purely visual, like the real thing: the page only gets the space that is left, so the
// iframe's height is the device height minus the bars (real viewport behaviour).

/** "https://www.kali.org/x" -> "kali.org", "http://localhost:5173/" -> "localhost:5173" */
export function hostOf(url) {
  try {
    const u = new URL(url);
    return u.host.replace(/^www\./, "");
  } catch {
    return String(url || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}
export const isSecure = (url) => /^https:/i.test(url || "");

// Foldables unfolded are tablet-sized, so they get Chrome's tablet layout
const UNFOLDED = ["z-fold-7", "tecno-phantom-v-fold"];

/**
 * Which browser UI a device shows and how much room it takes (CSS px of the device screen):
 * { kind, top, bottom, ... } or null for "no browser UI". Rotating a device re-evaluates it.
 */
export function getBrowserUi(device, width, height = 0) {
  if (!device) return null;
  const landscape = height > 0 && width > height;

  if (device.section === "Android") {
    if (device.category === "tablet" || UNFOLDED.includes(device.id)) {
      return { kind: "android-tablet", top: 28 + 40 + 52, bottom: 0 }; // status bar + tab strip + toolbar
    }
    if (device.category === "mobile") return { kind: "android", top: 28 + 56, bottom: 0 }; // phone, either orientation
  }

  if (device.section === "Apple" && device.category === "mobile") {
    const homeButton = device.id === "iphone-se";
    const notch = device.id === "iphone-14" || device.id === "iphone-16e";
    if (landscape) {
      // status bar is hidden in landscape; Safari shows one compact toolbar row (kept clear of the cut-out)
      return { kind: "ios-landscape", top: 44, bottom: 0, inset: homeButton ? 0 : notch ? 47 : 59 };
    }
    // status bar height depends on the cut-out; Safari's bottom bar = address capsule + toolbar (+ home indicator)
    return {
      kind: "ios",
      top: homeButton ? 20 : notch ? 47 : 54,
      bottom: homeButton ? 96 : 116,
      homeIndicator: !homeButton,
    };
  }

  if (device.section === "Apple" && device.category === "tablet") {
    return { kind: "ipad", top: 24 + 52, bottom: 0 }; // status bar + Safari toolbar
  }

  if (device.category === "desktop") {
    // Big screens get a bigger browser UI, like an OS with display scaling would (by the SHORTER side, so an
    // ultrawide 3440x1440 is treated like 2K): >= 1300 px -> x1.5, >= 2000 px -> x2
    const shorter = Math.min(width, height || width);
    const scale = shorter >= 2000 ? 2 : shorter >= 1300 ? 1.5 : 1;
    return device.section === "Apple"
      ? { kind: "mac", scale, top: Math.round(101 * scale), bottom: Math.round(76 * scale) }
      : { kind: "windows", scale, top: Math.round(74 * scale), bottom: Math.round(48 * scale) };
  }
  return null; // tablets are added in the next phase
}
