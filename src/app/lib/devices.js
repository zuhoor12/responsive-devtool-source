export const DEVICES = [
  // Apple — iPhone
  { id: "iphone-se", name: "iPhone SE", section: "Apple", category: "mobile", width: 375, height: 667, dpr: 2 },
  { id: "iphone-14", name: "iPhone 14", section: "Apple", category: "mobile", width: 390, height: 844, dpr: 2 },
  { id: "iphone-15", name: "iPhone 15", section: "Apple", category: "mobile", width: 393, height: 852, dpr: 2 },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", section: "Apple", category: "mobile", width: 393, height: 852, dpr: 3 },
  { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", section: "Apple", category: "mobile", width: 430, height: 932, dpr: 3 },
  { id: "iphone-16e", name: "iPhone 16e", section: "Apple", category: "mobile", width: 390, height: 844, dpr: 3 },
  { id: "iphone-16", name: "iPhone 16", section: "Apple", category: "mobile", width: 393, height: 852, dpr: 3 },
  { id: "iphone-16-pro", name: "iPhone 16 Pro", section: "Apple", category: "mobile", width: 402, height: 874, dpr: 3 },
  { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", section: "Apple", category: "mobile", width: 440, height: 956, dpr: 3 },
  { id: "iphone-17", name: "iPhone 17", section: "Apple", category: "mobile", width: 402, height: 874, dpr: 3 },
  { id: "iphone-17-air", name: "iPhone 17 Air", section: "Apple", category: "mobile", width: 420, height: 912, dpr: 3 },
  { id: "iphone-17-pro", name: "iPhone 17 Pro", section: "Apple", category: "mobile", width: 440, height: 956, dpr: 3 },
  { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", section: "Apple", category: "mobile", width: 440, height: 956, dpr: 3 },
  { id: "iphone-18", name: "iPhone 18", section: "Apple", category: "mobile", width: 402, height: 874, dpr: 3 },
  { id: "iphone-18-air", name: "iPhone 18 Air", section: "Apple", category: "mobile", width: 420, height: 912, dpr: 3 },
  { id: "iphone-18-pro", name: "iPhone 18 Pro", section: "Apple", category: "mobile", width: 440, height: 956, dpr: 3 },
  { id: "iphone-18-pro-max", name: "iPhone 18 Pro Max", section: "Apple", category: "mobile", width: 440, height: 956, dpr: 3 },
  // Apple — iPad / Mac
  { id: "ipad-mini-7", name: "iPad mini (7th gen)", section: "Apple", category: "tablet", width: 744, height: 1133, dpr: 2 },
  { id: "ipad", name: "iPad", section: "Apple", category: "tablet", width: 768, height: 1024, dpr: 2 },
  { id: "ipad-air", name: "iPad Air", section: "Apple", category: "tablet", width: 820, height: 1180, dpr: 2 },
  { id: "ipad-pro", name: "iPad Pro 11″", section: "Apple", category: "tablet", width: 834, height: 1194, dpr: 2 },
  { id: "ipad-pro-13-m5", name: "iPad Pro 13″ (M5)", section: "Apple", category: "tablet", width: 1032, height: 1376, dpr: 2 },
  { id: "macbook-air", name: "MacBook Air 13″", section: "Apple", category: "desktop", width: 1280, height: 800, dpr: 2 },
  { id: "macbook-pro", name: "MacBook Pro 14″", section: "Apple", category: "desktop", width: 1512, height: 982, dpr: 2 },
  { id: "macbook-pro-16", name: "MacBook Pro 16″", section: "Apple", category: "desktop", width: 1728, height: 1117, dpr: 2 },
  // Android — Galaxy / Pixel / others
  { id: "galaxy-s24", name: "Galaxy S24", section: "Android", category: "mobile", width: 360, height: 800, dpr: 3 },
  { id: "galaxy-s25", name: "Galaxy S25", section: "Android", category: "mobile", width: 360, height: 800, dpr: 3 },
  { id: "galaxy-s25-ultra", name: "Galaxy S25 Ultra", section: "Android", category: "mobile", width: 384, height: 824, dpr: 3.5 },
  { id: "galaxy-s26", name: "Galaxy S26", section: "Android", category: "mobile", width: 360, height: 800, dpr: 3 },
  { id: "galaxy-s26-edge", name: "Galaxy S26 Edge", section: "Android", category: "mobile", width: 392, height: 880, dpr: 3 },
  { id: "galaxy-s26-ultra", name: "Galaxy S26 Ultra", section: "Android", category: "mobile", width: 384, height: 824, dpr: 3.5 },
  { id: "z-flip-7", name: "Galaxy Z Flip 7", section: "Android", category: "mobile", width: 373, height: 891, dpr: 3 },
  { id: "z-fold-7", name: "Galaxy Z Fold 7 (unfolded)", section: "Android", category: "mobile", width: 673, height: 841, dpr: 2.25 },
  { id: "tecno-phantom-v-fold", name: "TECNO Phantom V Fold (unfolded)", section: "Android", category: "mobile", width: 768, height: 880, dpr: 2.6 },
  { id: "tecno-phantom-v-fold-cover", name: "TECNO Phantom V Fold (cover)", section: "Android", category: "mobile", width: 409, height: 892, dpr: 2.6 },
  { id: "pixel-8", name: "Pixel 8", section: "Android", category: "mobile", width: 412, height: 915, dpr: 2.6 },
  { id: "pixel-9", name: "Pixel 9", section: "Android", category: "mobile", width: 412, height: 915, dpr: 2.6 },
  { id: "pixel-9-pro", name: "Pixel 9 Pro", section: "Android", category: "mobile", width: 412, height: 921, dpr: 2.6 },
  { id: "pixel-10", name: "Pixel 10", section: "Android", category: "mobile", width: 412, height: 922, dpr: 2.6 },
  { id: "pixel-10-pro", name: "Pixel 10 Pro", section: "Android", category: "mobile", width: 416, height: 926, dpr: 2.6 },
  { id: "oneplus-12", name: "OnePlus 12", section: "Android", category: "mobile", width: 412, height: 915, dpr: 3 },
  { id: "oneplus-13", name: "OnePlus 13", section: "Android", category: "mobile", width: 412, height: 904, dpr: 3 },
  { id: "xiaomi-14", name: "Xiaomi 14", section: "Android", category: "mobile", width: 412, height: 915, dpr: 3 },
  { id: "xiaomi-15", name: "Xiaomi 15", section: "Android", category: "mobile", width: 412, height: 915, dpr: 3 },
  { id: "xiaomi-15-ultra", name: "Xiaomi 15 Ultra", section: "Android", category: "mobile", width: 412, height: 915, dpr: 3 },
  { id: "oppo-find-x8", name: "Oppo Find X8", section: "Android", category: "mobile", width: 412, height: 915, dpr: 3 },
  { id: "nothing-3", name: "Nothing Phone (3)", section: "Android", category: "mobile", width: 412, height: 921, dpr: 3 },
  { id: "redmi-note-14-pro", name: "Redmi Note 14 Pro", section: "Android", category: "mobile", width: 393, height: 874, dpr: 3 },
  // Android — tablets
  { id: "galaxy-tab-s9", name: "Galaxy Tab S9", section: "Android", category: "tablet", width: 800, height: 1280, dpr: 2 },
  { id: "galaxy-tab-s10", name: "Galaxy Tab S10", section: "Android", category: "tablet", width: 800, height: 1280, dpr: 2 },
  { id: "pixel-tablet", name: "Pixel Tablet", section: "Android", category: "tablet", width: 960, height: 1280, dpr: 2 },
  // Desktop
  { id: "laptop-1280", name: "Laptop", section: "Desktop", category: "desktop", width: 1280, height: 800, dpr: 1 },
  { id: "hd-1366", name: "HD Desktop", section: "Desktop", category: "desktop", width: 1366, height: 768, dpr: 1 },
  { id: "full-hd", name: "Full HD", section: "Desktop", category: "desktop", width: 1920, height: 1080, dpr: 1 },
  { id: "qhd-2k", name: "2K", section: "Desktop", category: "desktop", width: 2560, height: 1440, dpr: 1 },
  { id: "uhd-4k", name: "4K", section: "Desktop", category: "desktop", width: 3840, height: 2160, dpr: 1 },
  { id: "surface-pro-11", name: "Surface Pro 11", section: "Desktop", category: "desktop", width: 1536, height: 1024, dpr: 2 },
  { id: "ultrawide-34", name: "Ultrawide 34″", section: "Desktop", category: "desktop", width: 3440, height: 1440, dpr: 1 },
];

export const DEFAULT_MULTI_IDS = ["iphone-15-pro", "ipad-pro", "full-hd"];

export const BREAKPOINTS = [
  { name: "xs", min: 0 },
  { name: "sm", min: 640 },
  { name: "md", min: 768 },
  { name: "lg", min: 1024 },
  { name: "xl", min: 1280 },
  { name: "2xl", min: 1536 },
];

export function breakpointFor(width) {
  let cur = BREAKPOINTS[0];
  for (const bp of BREAKPOINTS) if (width >= bp.min) cur = bp;
  return cur;
}

// User-agent strings used by "advanced emulation" (Chrome) so servers return the mobile / tablet site.
const UA_IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const UA_IPAD = "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const UA_ANDROID = "Mozilla/5.0 (Linux; Android 15; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const UA_ANDROID_TABLET = "Mozilla/5.0 (Linux; Android 15; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export function getUserAgent(device) {
  if (!device || device.category === "desktop") return "";
  if (device.section === "Apple") return device.category === "tablet" ? UA_IPAD : UA_IPHONE;
  return device.category === "tablet" ? UA_ANDROID_TABLET : UA_ANDROID;
}
