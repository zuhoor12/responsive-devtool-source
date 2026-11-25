import { useEffect, useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";

function useFps(slow) {
  const [fps, setFps] = useState(60);
  useEffect(() => {
    let frames = 0, last = performance.now(), raf;
    const windowMs = slow ? 2000 : 1000; // Performance Mode samples less often
    const loop = (now) => {
      frames++;
      if (now - last >= windowMs) { setFps(Math.min(60, Math.round((frames * 1000) / (now - last)))); frames = 0; last = now; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [slow]);
  return fps;
}

export default function StatusBar() {
  const t = useDevTool();
  const info = t.frameInfo[t.activeDeviceId];
  const fps = useFps(t.prefs.performanceMode);
  const shown = t.activeUrl ? (info ? info.host : t.activeUrl.replace(/^https?:\/\//, "")) : "localhost:5173";
  const framework = t.activeUrl ? (info && info.frameworks && info.frameworks.length ? info.frameworks[0] : "—") : "React";
  const mem = typeof performance !== "undefined" && performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1048576)} MB` : "—";
  return (
    <footer className="h-7 shrink-0 flex items-center justify-between px-3 border-t bg-card text-[10px] font-mono text-muted-foreground overflow-x-auto">
      <div className="flex items-center gap-3 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${t.bgConnected ? "bg-success" : "bg-destructive"}`} /> {t.bgConnected ? "Connected" : "Reconnecting…"}
        </span>
        <span>{framework}</span>
        <span>{shown}</span>
        {t.networkPreset !== "Online" && (
          <span className="text-warning">Network: {t.networkPreset}</span>
        )}
        {t.cdp.active && <span className="text-info">Advanced emulation</span>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span>Viewport: <span className="text-foreground/80">{t.size.width} × {t.size.height}</span></span>
        <span>DPR: <span className="text-foreground/80">{t.dpr}x</span></span>
        <span>Memory: {mem}</span>
        <span>FPS: <span className={fps >= 50 ? "text-success" : fps >= 30 ? "text-warning" : "text-destructive"}>{fps}</span></span>
      </div>
    </footer>
  );
}
