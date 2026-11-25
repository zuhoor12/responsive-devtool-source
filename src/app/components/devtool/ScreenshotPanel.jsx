import { useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { copyShot, downloadShot, takeScreenshot } from "@/lib/screenshot";

const SCOPES = [
  { id: "viewport", label: "Current Viewport" },
  { id: "full", label: "Full Page" },
  { id: "frame", label: "Device Frame" },
  { id: "all", label: "All Devices" },
];
const FORMATS = ["PNG", "JPEG", "WebP"];
const SCALES = ["native", "1x", "2x", "3x"];
const SCALE_LABEL = { native: "Native", "1x": "1x", "2x": "2x", "3x": "3x" };

export default function ScreenshotPanel() {
  const t = useDevTool();
  const { toast } = useToast();
  // Starts from the saved preset (Save Preset stores the current choice as the new default).
  const [scope, setScope] = useState(t.shot.scope);
  const [format, setFormat] = useState(t.shot.format);
  const [quality, setQuality] = useState(t.shot.quality);
  const [scale, setScale] = useState(t.shot.scale);
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    try {
      const result = await takeScreenshot({ scope, format, quality, scale }, t); // first await = user gesture still valid
      if (action === "copy") {
        await copyShot(result);
        toast({ title: "Screenshot", description: "Copied to clipboard" });
      } else {
        await downloadShot(result, format, quality / 100);
        toast({ title: "Screenshot", description: `${result.name} downloaded` });
      }
      t.closeDialog("screenshot");
    } catch (e) {
      document.body.classList.remove("rdt-capturing");
      toast({ title: "Screenshot failed", description: String((e && e.message) || e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={t.dialogs.screenshot} onOpenChange={(v) => !v && t.closeDialog("screenshot")}>
      <DialogContent className="max-w-sm rounded-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Screenshot</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          <div>
            <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-1.5">CAPTURE</h4>
            <div className="space-y-1">
              {SCOPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScope(s.id)}
                  className="w-full flex items-center gap-2.5 h-8 px-2 rounded-md border border-transparent hover:bg-secondary text-left"
                >
                  <span className={cn("w-3.5 h-3.5 rounded-full border flex items-center justify-center", scope === s.id ? "border-primary" : "border-muted-foreground/50")}>
                    {scope === s.id && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </span>
                  <span className="text-xs">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-1.5">FORMAT</h4>
              <div className="flex gap-1">
                {FORMATS.map((f) => (
                  <button key={f} onClick={() => setFormat(f)} className={cn("h-7 flex-1 rounded text-[10px] border", format === f ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-1.5">SCALE</h4>
              <div className="flex gap-1">
                {SCALES.map((s) => (
                  <button key={s} onClick={() => setScale(s)} className={cn("h-7 flex-1 rounded text-[10px] border", scale === s ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                    {SCALE_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-1.5">
              QUALITY · <span className="font-mono text-primary">{quality}%</span>
            </h4>
            <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={10} max={100} step={5} />
            <div className="h-1.5 rounded-full bg-secondary mt-1 overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full" style={{ width: `${quality}%` }} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1 h-8 text-xs" disabled={busy} onClick={() => run("copy")}>{busy ? "Capturing…" : "Copy"}</Button>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" disabled={busy} onClick={() => run("download")}>Download</Button>
            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" disabled={busy} onClick={() => { t.setShot({ scope, format, quality, scale }); toast({ title: "Screenshot", description: "Preset saved — it is used as the default next time" }); }}>Save Preset</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}