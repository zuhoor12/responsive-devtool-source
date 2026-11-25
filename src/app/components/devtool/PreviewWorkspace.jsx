import { useEffect, useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import DeviceFrame from "@/components/devtool/DeviceFrame";
import DraggableFrame from "@/components/devtool/DraggableFrame";
import { X, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

function Ruler() {
  const ticks = Array.from({ length: 80 }, (_, i) => i * 50);
  return (
    <div className="absolute top-0 left-0 right-0 h-6 z-20 border-b border-border bg-card/80 overflow-hidden pointer-events-none">
      {ticks.map((px) => (
        <div key={px} className="absolute top-0 h-full" style={{ left: px }}>
          <div className="w-px h-2 bg-muted-foreground/40" />
          {px % 100 === 0 && (
            <span className="absolute left-1 top-1 text-[8px] font-mono text-muted-foreground">{px}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function MultiDeviceCard({ device, onRemove }) {
  const t = useDevTool();
  const [rotated, setRotated] = useState(false);
  const w = rotated ? device.height : device.width;
  const h = rotated ? device.width : device.height;
  return (
    <div className="flex flex-col items-center gap-1.5" onPointerDownCapture={() => t.setFocusId(device.id)}>
      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-card border border-border rounded-md px-2 h-6">
        <span className="text-[11px] font-sans text-foreground">{device.name}</span>
        <span>{device.width}×{device.height}</span>
        <span className="text-primary">{t.zoom}%</span>
        <button title="Rotate" onClick={() => setRotated((r) => !r)} className="hover:text-primary">
          <RotateCw className="w-3 h-3" />
        </button>
        <button title="Close viewport" onClick={onRemove} className="hover:text-destructive">
          <X className="w-3 h-3" />
        </button>
      </div>
      <DeviceFrame device={device} width={w} height={h} zoom={t.zoom} showFrame={t.showFrame} darkMode={t.sims.darkMode} compact />
    </div>
  );
}

export default function PreviewWorkspace() {
  const t = useDevTool();
  const multiDevices = t.multiDeviceIds
    .map((id) => t.devices.find((d) => d.id === id))
    .filter(Boolean);

  // A click inside a live <iframe> never reaches React: the window just loses focus and the
  // iframe becomes document.activeElement. Use that to know which device the user is working in.
  const { setFocusId } = t;
  useEffect(() => {
    const onBlur = () => setTimeout(() => {
      const el = document.activeElement;
      if (el && el.tagName === "IFRAME" && el.name && el.name.startsWith("rdt-")) setFocusId(el.name.slice(4));
    }, 0);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [setFocusId]);

  return (
    <div
      ref={t.workspaceRef}
      className={cn("relative flex-1 min-h-0 overflow-auto workspace-bg", t.inspectMode && "inspect-on")}
    >
      {t.showRuler && <Ruler />}

      {t.viewMode === "single" ? (
        <div className="min-h-full min-w-full">
          <DraggableFrame
            workspaceRef={t.workspaceRef}
            storageKey={t.selectedDevice?.id ?? "device"}
            layoutKey={`${t.viewMode}:${t.zoom}:${t.size.width}x${t.size.height}:${t.showFrame}`}
          >
            <DeviceFrame
              device={t.selectedDevice}
              width={t.size.width}
              height={t.size.height}
              zoom={t.zoom}
              showFrame={t.showFrame}
              darkMode={t.sims.darkMode}
            />
          </DraggableFrame>
        </div>
      ) : (
        <div className="min-h-full min-w-full">
          {multiDevices.map((d, i) => (
            <DraggableFrame
              key={d.id}
              workspaceRef={t.workspaceRef}
              storageKey={d.id}
              layoutKey={`${t.viewMode}:${t.zoom}:${d.width}x${d.height}:${t.showFrame}:${i}:${multiDevices.length}`}
              index={i}
              count={multiDevices.length}
            >
              <MultiDeviceCard
                device={d}
                onRemove={() => t.setMultiDeviceIds((ids) => ids.filter((x) => x !== d.id))}
              />
            </DraggableFrame>
          ))}
          {!multiDevices.length && (
            <div className="min-h-full flex items-center justify-center">
              <div className="text-xs text-muted-foreground">
                No active viewports — select devices from the library.
              </div>
            </div>
          )}
        </div>
      )}

      {t.showGrid && (
        <div className="absolute inset-0 pointer-events-none grid-overlay opacity-60 z-10" />
      )}

      {t.inspectMode && (
        <div className="absolute bottom-3 left-3 z-20 px-2.5 h-7 flex items-center rounded-md border border-info/40 bg-card/90 text-[10px] font-mono text-info">
          Inspect mode — hover elements in the preview
        </div>
      )}

      {t.showRuler && (
        <div className="absolute bottom-3 right-3 z-20 px-2.5 h-7 flex items-center gap-3 rounded-md border border-border bg-card/90 text-[10px] font-mono text-muted-foreground">
          <span>Width: {t.size.width}px</span>
          <span>Height: {t.size.height}px</span>
          <span>DPR: {t.dpr}x</span>
        </div>
      )}
    </div>
  );
}