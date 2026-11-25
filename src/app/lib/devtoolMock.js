export const DOM_TREE = {
  tag: "body",
  attrs: 'class="app"',
  children: [
    { tag: "header", attrs: 'class="site-header"', children: [
      { tag: "nav", attrs: 'class="main-nav"', children: [
        { tag: "a", attrs: 'class="logo"', children: [] },
        { tag: "ul", attrs: 'class="nav-links"', children: [
          { tag: "li", children: [{ tag: "a", attrs: 'href="#work"', children: [] }] },
          { tag: "li", children: [{ tag: "a", attrs: 'href="#about"', children: [] }] },
        ] },
      ] },
      { tag: "button", attrs: 'class="cta btn-primary"', children: [] },
    ] },
    { tag: "main", attrs: 'class="page-main"', children: [
      { tag: "section", attrs: 'class="hero"', children: [
        { tag: "h1", children: [] },
        { tag: "p", attrs: 'class="hero-sub"', children: [] },
        { tag: "button", attrs: 'class="btn-primary"', children: [] },
      ] },
      { tag: "section", attrs: 'class="features"', children: [
        { tag: "article", attrs: 'class="card"', children: [] },
        { tag: "article", attrs: 'class="card"', children: [] },
        { tag: "article", attrs: 'class="card"', children: [] },
      ] },
    ] },
    { tag: "footer", attrs: 'class="site-footer"', children: [{ tag: "p", children: [] }] },
  ],
};

export const ELEMENT_DETAILS = {
  body: { element: "body", classes: "app", dimensions: "393 × 852", margin: "0", padding: "0", display: "block", position: "static", color: "#1f2937", font: "Inter · 16px/1.5" },
  header: { element: "header.site-header", classes: "site-header", dimensions: "393 × 56", margin: "0", padding: "0 20px", display: "flex", position: "sticky · top 0", color: "#111827", font: "Inter · 13px" },
  nav: { element: "nav.main-nav", classes: "main-nav", dimensions: "auto × 32", margin: "0 auto", padding: "0", display: "flex", position: "relative", color: "#374151", font: "Inter · 12px" },
  button: { element: "button.btn-primary", classes: "cta btn-primary", dimensions: "96 × 34", margin: "0", padding: "8px 14px", display: "inline-flex", position: "relative", color: "#ffffff", font: "Inter · 12px/600" },
  main: { element: "main.page-main", classes: "page-main", dimensions: "393 × 1024", margin: "0", padding: "24px 20px", display: "block", position: "relative", color: "#1f2937", font: "Inter · 16px/1.5" },
  section: { element: "section.hero", classes: "hero", dimensions: "353 × 320", margin: "0 auto 48px", padding: "48px 0", display: "block", position: "relative", color: "#111827", font: "Inter · 16px/1.5" },
  article: { element: "article.card", classes: "card", dimensions: "104 × 180", margin: "0", padding: "16px", display: "block", position: "relative", color: "#374151", font: "Inter · 12px/1.5" },
  h1: { element: "h1", classes: "hero-title", dimensions: "353 × 88", margin: "0 0 12px", padding: "0", display: "block", position: "static", color: "#111827", font: "Inter · 22px/800" },
  p: { element: "p.hero-sub", classes: "hero-sub", dimensions: "320 × 54", margin: "0 auto", padding: "0", display: "block", position: "static", color: "#6b7280", font: "Inter · 12px/1.6" },
  a: { element: "a", classes: "nav-link", dimensions: "48 × 18", margin: "0 12px", padding: "0", display: "inline", position: "static", color: "#2563eb", font: "Inter · 12px/500" },
  ul: { element: "ul.nav-links", classes: "nav-links", dimensions: "200 × 18", margin: "0", padding: "0", display: "flex", position: "relative", color: "inherit", font: "inherit" },
  li: { element: "li", classes: "—", dimensions: "48 × 18", margin: "0 12px", padding: "0", display: "list-item", position: "static", color: "inherit", font: "inherit" },
  footer: { element: "footer.site-footer", classes: "site-footer", dimensions: "393 × 44", margin: "0", padding: "14px 20px", display: "block", position: "static", color: "#9ca3af", font: "Inter · 10px" },
};

export const CSS_SECTIONS = [
  { title: "Layout", rows: [["display", "flex"], ["flex-direction", "column"], ["align-items", "center"], ["justify-content", "space-between"], ["gap", "16px"]] },
  { title: "Position", rows: [["position", "relative"], ["top", "0"], ["z-index", "auto"]] },
  { title: "Box Model", rows: [["width", "100%"], ["height", "auto"], ["padding", "24px"], ["margin", "0"], ["border-radius", "8px"]] },
  { title: "Typography", rows: [["font-family", "Inter, sans-serif"], ["font-size", "16px"], ["line-height", "1.5"], ["font-weight", "500"], ["letter-spacing", "0.01em"]] },
  { title: "Background", rows: [["background-color", "#0d1117"], ["background-image", "linear-gradient(...)"], ["background-size", "cover"]] },
  { title: "Border", rows: [["border", "1px solid #202a36"], ["border-top", "none"]] },
  { title: "Effects", rows: [["box-shadow", "0 4px 12px rgba(0,0,0,.4)"], ["opacity", "1"], ["filter", "none"], ["backdrop-filter", "blur(8px)"]] },
  { title: "Animation", rows: [["transition", "all .2s ease"], ["animation", "fade-in .3s ease-out"]] },
];

export const NETWORK_PRESETS = {
  Online: { download: "—", upload: "—", latency: "0 ms", loss: "0%" },
  "Fast 3G": { download: "1.6 Mbps", upload: "0.75 Mbps", latency: "150 ms", loss: "0%" },
  "Slow 3G": { download: "0.4 Mbps", upload: "0.4 Mbps", latency: "400 ms", loss: "2%" },
  "4G": { download: "20 Mbps", upload: "10 Mbps", latency: "50 ms", loss: "0%" },
  Offline: { download: "0 Mbps", upload: "0 Mbps", latency: "—", loss: "100%" },
  Custom: { download: "8 Mbps", upload: "4 Mbps", latency: "100 ms", loss: "1%" },
};

export const NETWORK_REQUESTS = [
  { name: "index.html", type: "document", status: 200, size: "2.4 kB", time: "42 ms" },
  { name: "styles.css", type: "stylesheet", status: 200, size: "18.2 kB", time: "31 ms" },
  { name: "bundle.js", type: "script", status: 200, size: "142 kB", time: "86 ms" },
  { name: "inter-var.woff2", type: "font", status: 200, size: "96 kB", time: "22 ms" },
  { name: "hero.webp", type: "image", status: 200, size: "240 kB", time: "64 ms" },
  { name: "api/projects", type: "fetch", status: 304, size: "1.1 kB", time: "58 ms" },
  { name: "analytics.js", type: "script", status: 404, size: "0 kB", time: "12 ms" },
];

export const A11Y_CHECKS = [
  { label: "Color Contrast", status: "pass", note: "Body text meets WCAG AA (7.2:1)" },
  { label: "Heading Structure", status: "pass", note: "Single h1, ordered h2–h3" },
  { label: "Image Alt Text", status: "pass", note: "All 4 images have alt attributes" },
  { label: "Keyboard Navigation", status: "pass", note: "Tab order follows visual order" },
  { label: "Focus Visibility", status: "pass", note: "Focus ring visible on all controls" },
  { label: "Button Label", status: "warn", note: "1 icon-only button has no aria-label" },
  { label: "Form Label", status: "warn", note: "Search input is missing a label" },
];

export const SHORTCUTS = [
  { keys: "Ctrl K", action: "Command palette" },
  { keys: "Ctrl S", action: "Screenshot" },
  { keys: "Ctrl G", action: "Toggle grid overlay" },
  { keys: "Ctrl R", action: "Toggle ruler" },
  { keys: "Ctrl →", action: "Rotate device" },
  { keys: "Ctrl 1", action: "Actual size" },
];