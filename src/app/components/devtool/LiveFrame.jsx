import rdt from "@core/index.js";
import MockSite from "@/components/devtool/MockSite";
import BrowserChrome from "@/components/devtool/browser/BrowserChrome";
import { useDevTool } from "@/lib/DevToolContext";
import { getBrowserUi, hostOf, isSecure } from "@/lib/browserUi";

// The real page, rendered in an <iframe> inside the device's screen. Like the real browser, the
// page only gets the space left under the browser UI (status bar, address bar ...), which is
// drawn around it. Until a URL has been loaded, the design's sample page is shown instead so
// the tool never looks empty on first run.
export default function LiveFrame({ device, width, height, darkMode }) {
  const t = useDevTool();
  const ui = getBrowserUi(device, width, height);
  const top = ui ? ui.top : 0;
  const bottom = ui ? ui.bottom : 0;
  const pageHeight = Math.max(0, height - top - bottom);
  // each device shows ITS OWN page's address (in Multi view the devices can be on different pages)
  const live = t.activeUrl ? t.frameInfo[device.id] : null;
  const shownUrl = (live && live.url) || t.currentUrl || t.activeUrl || "http://localhost:5173";
  const favicon = live ? live.favicon : "";
  // back / forward / reload in the bars drive the page of THIS device
  const actions = t.activeUrl ? {
    back: () => rdt.agent.back(device.id),
    forward: () => rdt.agent.forward(device.id),
    reload: () => rdt.agent.reload(device.id),
  } : null;
  const title = t.activeUrl ? (live && live.title) || hostOf(shownUrl) : "Pixelworks";
  const failure = t.activeUrl ? t.docStatus[device.id]?.error : null;

  return (
    <div className="relative bg-white" style={{ width, height }}>
      {ui && ui.top > 0 && <BrowserChrome ui={ui} part="top" width={width} host={hostOf(shownUrl)} secure={isSecure(shownUrl)} title={title} favicon={favicon} actions={actions} />}
      <div className="relative" style={{ width, height: pageHeight }}>
        {t.activeUrl ? (
          <iframe
            key={`${device.id}-${t.reloadKey}`}
            ref={rdt.frames.ref(device.id)}
            {...rdt.frames.iframeProps(device.id)}
            src={t.activeUrl}
            title={`${device.name} preview`}
            style={{ width, height: pageHeight, border: 0, display: "block", background: "#fff" }}
          />
        ) : (
          <div style={{ width, height: pageHeight }}>
            <MockSite darkMode={darkMode} />
          </div>
        )}
        {failure && (
          <div className="absolute inset-x-0 top-0 z-20 px-3 py-2 text-[11px] font-mono bg-destructive text-destructive-foreground text-center">
            Couldn't load this page ({failure.replace(/^net::/, "")})
          </div>
        )}
      </div>
      {ui && ui.bottom > 0 && <BrowserChrome ui={ui} part="bottom" width={width} host={hostOf(shownUrl)} secure={isSecure(shownUrl)} title={title} favicon={favicon} actions={actions} />}
    </div>
  );
}
