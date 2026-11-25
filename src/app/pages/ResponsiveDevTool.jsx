import { useEffect, useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import TopBar from "@/components/devtool/TopBar";
import DeviceLibrary from "@/components/devtool/DeviceLibrary";
import SidebarToggle from "@/components/devtool/SidebarToggle";
import PreviewToolbar from "@/components/devtool/PreviewToolbar";
import PreviewWorkspace from "@/components/devtool/PreviewWorkspace";
import BottomControlBar from "@/components/devtool/BottomControlBar";
import StatusBar from "@/components/devtool/StatusBar";
import InspectorPanel from "@/components/devtool/InspectorPanel";
import CommandPalette from "@/components/devtool/CommandPalette";
import SettingsDialog from "@/components/devtool/SettingsDialog";
import ScreenshotPanel from "@/components/devtool/ScreenshotPanel";
import CustomDeviceDialog from "@/components/devtool/CustomDeviceDialog";
import DeviceManager from "@/components/devtool/DeviceManager";
import ToolsPanel from "@/components/devtool/ToolsPanel";
import ColorPickerPanel from "@/components/devtool/ColorPickerPanel";
import ColorSampleBar from "@/components/devtool/ColorSampleBar";
import RealDeviceDialog from "@/components/devtool/RealDeviceDialog";

function DevToolShell() {
  const t = useDevTool();
  const [inspectorDrawer, setInspectorDrawer] = useState(false);

  // fit the first preview to the window (unless a shared link already carries a zoom)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("zoom")) return undefined;
    const id = setTimeout(() => t.fitToScreen(), 150);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const run = (fn) => { e.preventDefault(); fn(); };
      if (k === "k") run(() => t.openDialog("palette"));
      else if (k === "s") run(() => t.openDialog("screenshot"));
      else if (k === "g") run(() => t.setShowGrid((v) => !v));
      else if (k === "r") run(() => t.setShowRuler((v) => !v));
      else if (e.key === "ArrowRight") run(() => t.rotate());
      else if (k === "1") run(() => t.setZoom(100));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [t.openDialog, t.setShowGrid, t.setShowRuler, t.rotate, t.setZoom]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <TopBar />

      <div className="flex-1 flex min-h-0">
        {t.leftPanelOpen && <DeviceLibrary />}
        <SidebarToggle
          side="left"
          open={t.leftPanelOpen}
          onToggle={() => t.setLeftPanelOpen((o) => !o)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <PreviewToolbar onOpenInspector={() => setInspectorDrawer(true)} />
          <PreviewWorkspace />
          <BottomControlBar />
        </div>
        <SidebarToggle
          side="right"
          open={t.rightPanelOpen}
          onToggle={() => t.setRightPanelOpen((o) => !o)}
        />
        {t.rightPanelOpen && (
          <div className="hidden xl:flex">
            <InspectorPanel />
          </div>
        )}
      </div>

      <StatusBar />

      {/* Inspector drawer for < xl screens */}
      {inspectorDrawer && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setInspectorDrawer(false)} />
          <div className="absolute right-0 top-0 bottom-0 shadow-2xl">
            <InspectorPanel onClose={() => setInspectorDrawer(false)} />
          </div>
        </div>
      )}

      <CommandPalette />
      <SettingsDialog />
      <ScreenshotPanel />
      <CustomDeviceDialog
        open={t.dialogs.customDevice}
        onOpenChange={(v) => !v && t.closeDialog("customDevice")}
      />
      <DeviceManager />
      <ToolsPanel />
      <ColorPickerPanel />
      <ColorSampleBar />
      <RealDeviceDialog />
    </div>
  );
}

export default function ResponsiveDevTool() {
  return <DevToolShell />;
}