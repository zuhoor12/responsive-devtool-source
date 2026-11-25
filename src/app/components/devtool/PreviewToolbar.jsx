import { useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import {
  ArrowLeft, ArrowRight, RotateCw, LayoutGrid, Ruler, MousePointerClick,
  Pipette, Camera, Maximize2, Maximize, ZoomIn, ZoomOut, PanelRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Divider = () => <div className="w-px h-5 bg-border shrink-0" />;

function TBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={cn(
        "h-7 w-7 shrink-0 flex items-center justify-center rounded border transition-colors",
        active
          ? "bg-primary/15 border-primary/40 text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

export default function PreviewToolbar({ onOpenInspector }) {
  const t = useDevTool();
  const [spinning, setSpinning] = useState(false);

  const reload = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    t.reload();
  };

  const fullscreen = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch { /* sandboxed — ignore */ }
  };

  return (
    <div className="h-10 shrink-0 flex items-center gap-1.5 px-2 border-b bg-card/60 overflow-x-auto">
      <TBtn icon={ArrowLeft} label="Back" onClick={t.goBack} />
      <TBtn icon={ArrowRight} label="Forward" onClick={t.goForward} />
      <TBtn icon={RotateCw} label="Reload preview" onClick={reload} active={spinning} />
      <Divider />

      <div className="flex rounded border border-border overflow-hidden shrink-0">
        {["Single", "Multi"].map((m) => (
          <button
            key={m}
            onClick={() => t.setViewMode(m.toLowerCase())}
            className={cn(
              "h-7 px-2.5 text-[11px] transition-colors",
              t.viewMode === m.toLowerCase()
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {m}
          </button>
        ))}
      </div>
      <Divider />

      <TBtn icon={Ruler} label="Toggle ruler" active={t.showRuler} onClick={() => t.setShowRuler(!t.showRuler)} />
      <TBtn icon={LayoutGrid} label="Toggle grid overlay" active={t.showGrid} onClick={() => t.setShowGrid(!t.showGrid)} />
      <TBtn icon={MousePointerClick} label="Inspect elements" active={t.inspectMode} onClick={() => t.setInspectMode(!t.inspectMode)} />
      <TBtn icon={Pipette} label="Color picker" active={t.dialogs.colorPicker} onClick={() => t.openDialog("colorPicker")} />
      <button
        onClick={() => t.openDialog("screenshot")}
        className="h-7 px-2 shrink-0 flex items-center gap-1.5 rounded border border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <Camera className="w-3.5 h-3.5" /> Screenshot
      </button>
      <Divider />

      <TBtn icon={Maximize2} label="Fit to screen" onClick={t.fitToScreen} />
      <button
        title="Actual size"
        onClick={() => t.setZoom(100)}
        className="h-7 px-1.5 shrink-0 rounded text-[10px] font-mono border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        1:1
      </button>
      <TBtn icon={ZoomOut} label="Zoom out" onClick={() => t.zoomBy(-10)} />
      <span className="w-11 text-center text-[10px] font-mono text-muted-foreground shrink-0">{t.zoom}%</span>
      <TBtn icon={ZoomIn} label="Zoom in" onClick={() => t.zoomBy(10)} />
      <TBtn icon={Maximize} label="Fullscreen" onClick={fullscreen} />

      <div className="ml-auto xl:hidden flex items-center shrink-0 pl-2">
        <button
          onClick={onOpenInspector}
          className="h-7 px-2 flex items-center gap-1.5 rounded border border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <PanelRight className="w-3.5 h-3.5" /> Inspector
        </button>
      </div>
    </div>
  );
}