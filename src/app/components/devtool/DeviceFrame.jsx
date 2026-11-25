import LiveFrame from "@/components/devtool/LiveFrame";
import { getBrowserUi } from "@/lib/browserUi";
import { useDevTool } from "@/lib/DevToolContext";
import MockupFrame from "@/components/devtool/MockupFrame";
import { MOCKUPS } from "@/lib/mockups";
import { cn } from "@/lib/utils";

export default function DeviceFrame({ device, width, height, zoom, showFrame = true, darkMode = false, compact = false }) {
  const t = useDevTool();
  let host = "localhost:5173";
  try { host = new URL(t.currentUrl || t.activeUrl).host || host; } catch { /* keep sample host */ }
  const scale = zoom / 100;
  const isDesktop = device.category === "desktop";
  const mockup = showFrame ? MOCKUPS[device.id] : null;
  // A rotated laptop makes no physical sense — keep the CSS frame for that case.
  const useMockup = mockup && !(isDesktop && width < height);

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {!compact && (
        <div className="text-xs font-medium text-foreground text-center">{device.name}</div>
      )}
      {useMockup ? (
        <MockupFrame mockup={mockup} device={device} width={width} height={height} zoom={zoom} darkMode={darkMode} />
      ) : (
        <div style={{ width: Math.max(40, Math.round(width * scale)), height: Math.max(40, Math.round(height * scale)) }} className="relative shadow-2xl shadow-black/20 dark:shadow-black/50 rounded-sm">
          <div
            style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
            className={cn(
              "absolute top-0 left-0 overflow-hidden bg-card",
              device.category === "mobile" ? "rounded-[28px]" : device.category === "tablet" ? "rounded-[20px]" : "rounded-md",
              !showFrame && "ring-1 ring-border"
            )}
          >
            {isDesktop && !getBrowserUi(device, width, height) ? (
              <>
                <div className="h-7 flex items-center gap-2 px-2.5 bg-secondary border-b border-border shrink-0">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    <span className="w-2 h-2 rounded-full bg-success" />
                  </div>
                  <div className="flex-1 mx-2 h-4 rounded bg-background border border-border text-[9px] font-mono text-muted-foreground flex items-center justify-center">
                    {host}
                  </div>
                </div>
                <div style={{ height: height - 28 }} className="relative">
                  <LiveFrame device={device} width={width} height={height - 28} darkMode={darkMode} />
                </div>
              </>
            ) : (
              <>
                <LiveFrame device={device} width={width} height={height} darkMode={darkMode} />
                {showFrame && (
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-black z-10" />
                )}
              </>
            )}
            {showFrame && !isDesktop && (
              <div className={cn("absolute inset-0 pointer-events-none border-[6px] border-secondary z-10", device.category === "mobile" ? "rounded-[28px]" : "rounded-[20px]")} />
            )}
          </div>
        </div>
      )}
      <div className="text-[10px] font-mono text-muted-foreground">
        {width} × {height}
      </div>
    </div>
  );
}