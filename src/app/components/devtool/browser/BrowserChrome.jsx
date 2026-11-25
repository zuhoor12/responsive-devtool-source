import AndroidChrome, { AndroidTabletChrome } from "@/components/devtool/browser/AndroidChrome";
import { IOSLandscapeBar, IOSSafariBar, IOSStatusBar, IPadSafariTop } from "@/components/devtool/browser/IOSSafari";
import { WindowsTaskbar, WindowsTop } from "@/components/devtool/browser/WindowsChrome";
import { MacDock, MacTop } from "@/components/devtool/browser/MacChrome";

/**
 * One part ("top" | "bottom") of the browser UI of a device. The page is placed between the two parts.
 * Desktop UIs are drawn at their base size and scaled up on very large screens (ui.scale).
 */
export default function BrowserChrome({ ui, part, width, host, secure, title, favicon, actions }) {
  const props = { host, secure, title: title || host, favicon, actions };
  let node = null;
  if (ui.kind === "android") node = part === "top" ? <AndroidChrome host={host} secure={secure} /> : null;
  else if (ui.kind === "android-tablet") node = part === "top" ? <AndroidTabletChrome {...props} /> : null;
  else if (ui.kind === "ipad") node = part === "top" ? <IPadSafariTop host={host} secure={secure} actions={actions} /> : null;
  else if (ui.kind === "ios-landscape") node = part === "top" ? <IOSLandscapeBar host={host} secure={secure} inset={ui.inset} actions={actions} /> : null;
  else if (ui.kind === "ios") {
    node = part === "top" ? <IOSStatusBar height={ui.top} /> : <IOSSafariBar host={host} secure={secure} homeIndicator={ui.homeIndicator} actions={actions} />;
  } else if (ui.kind === "windows") node = part === "top" ? <WindowsTop {...props} /> : <WindowsTaskbar />;
  else if (ui.kind === "mac") node = part === "top" ? <MacTop {...props} /> : <MacDock />;
  if (!node) return null;

  const scale = ui.scale || 1;
  if (scale === 1) return node;
  const height = part === "top" ? ui.top : ui.bottom;
  return (
    <div style={{ width, height, overflow: "hidden" }}>
      <div style={{ width: width / scale, transform: `scale(${scale})`, transformOrigin: "top left" }}>{node}</div>
    </div>
  );
}
