import { useEffect, useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import { Input } from "@/components/ui/input";
import { RotateCw, ZoomIn, ZoomOut, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const Divider = () => <div className="w-px h-6 bg-border shrink-0" />;

export default function BottomControlBar() {
  const t = useDevTool();
  const [isFull, setIsFull] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const on = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch { /* not allowed */ }
  };

  const numInput = (value, key) => (
    <Input
      type="number"
      value={value}
      onChange={(e) => t.setSize((s) => ({ ...s, [key]: Math.max(1, parseInt(e.target.value) || 0) }))}
      className="h-7 w-[74px] font-mono text-xs bg-background border-border text-center"
    />
  );

  const chip = (label, active, onClick) => (
    <button
      onClick={onClick}
      className={cn(
        "h-7 px-2.5 rounded text-[11px] border transition-colors shrink-0",
        active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="h-12 shrink-0 flex items-center gap-3 px-3 border-t bg-card/60 overflow-x-auto">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-muted-foreground">Device:</span>
        <span className="text-xs font-medium">{t.selectedDevice?.name}</span>
      </div>
      <Divider />
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-muted-foreground">W</span>
        {numInput(t.size.width, "width")}
        <span className="text-[10px] text-muted-foreground">H</span>
        {numInput(t.size.height, "height")}
      </div>
      <Divider />
      <div className="flex items-center gap-1 shrink-0">
        <button
          title="Rotate"
          onClick={t.rotate}
          className="h-7 px-2.5 flex items-center gap-1.5 rounded text-[11px] border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" /> Rotate
        </button>
      </div>
      <Divider />
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] text-muted-foreground">Zoom</span>
        <button onClick={() => t.zoomBy(-10)} className="h-7 w-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground">
          <ZoomOut className="w-3 h-3" />
        </button>
        <span className="w-10 text-center text-[10px] font-mono text-muted-foreground">{t.zoom}%</span>
        <button onClick={() => t.zoomBy(10)} className="h-7 w-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground">
          <ZoomIn className="w-3 h-3" />
        </button>
        <button
          onClick={() => { t.selectDevice(t.selectedId); t.setZoom(100); }}
          className="h-7 px-2 rounded text-[11px] border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          Reset
        </button>
      </div>
      <Divider />
      {chip("Touch", t.sims.touch, () => t.toggleSim("touch"))}
      {chip("Fullscreen", isFull, toggleFullscreen)}
      <button
        onClick={() => t.openDialog("screenshot")}
        className="h-7 px-2.5 flex items-center gap-1.5 rounded text-[11px] border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
      >
        <Camera className="w-3.5 h-3.5" /> Screenshot
      </button>

      <div className="ml-auto flex items-center gap-3 shrink-0 pl-3 text-[10px] font-mono text-muted-foreground">
        <span>DPR: <span className="text-foreground/80">{t.dpr}x</span></span>
        <span>Orientation: <span className="capitalize text-foreground/80">{t.orientation}</span></span>
      </div>
    </div>
  );
}