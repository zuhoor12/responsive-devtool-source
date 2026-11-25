import { useEffect, useState } from "react";
import rdt from "@core/index.js";
import { useDevTool } from "@/lib/DevToolContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Pipette } from "lucide-react";
import { cn } from "@/lib/utils";
import { hexToRgb, isHex, toHex, toHsl, toOklch, toRgbString } from "@/lib/color";

const SECTION = "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";

export default function ColorPickerPanel() {
  const t = useDevTool();
  const { toast } = useToast();
  const [hex, setHex] = useState("#3B82F6");
  const [draft, setDraft] = useState("#3B82F6");
  const [origin, setOrigin] = useState("");
  const [palette, setPalette] = useState(null); // null = not read yet
  const open = t.dialogs.colorPicker;

  const setColor = (value) => { setHex(value); setDraft(value); };

  // a colour picked from the page: the text colour for a text element, otherwise the visible background
  useEffect(() => {
    if (!t.pickedColor) return;
    const info = t.pickedColor.info;
    setColor(toHex(info.primary || info.bg));
    setOrigin(`${info.tag} · ${info.kind === "text" ? "text colour" : "background"}`);
  }, [t.pickedColor]); // eslint-disable-line react-hooks/exhaustive-deps

  // the colours of the page, read when the dialog opens
  useEffect(() => {
    if (!open) return;
    setOrigin("");
    if (!rdt.env.extension || !t.activeUrl) { setPalette([]); return; }
    setPalette(null);
    let dead = false;
    rdt.agent.palette(t.activeDeviceId).then((list) => { if (!dead) setPalette(list || []); });
    return () => { dead = true; };
  }, [open, t.activeDeviceId, t.reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const rgb = hexToRgb(hex);
  const copy = async (value, label) => {
    try { await navigator.clipboard.writeText(value); toast({ title: "Copied", description: `${label}: ${value}` }); }
    catch { toast({ title: "Could not copy", description: value, variant: "destructive" }); }
  };
  const pickFromPage = () => t.startSampling();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && t.closeDialog("colorPicker")}>
      <DialogContent className="max-w-[420px] rounded-xl border-border bg-card p-5">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold"><Pipette className="h-4 w-4 text-primary" /> Color Picker</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Sample the real colors used inside the preview, by element or from anywhere on screen.
          </DialogDescription>
        </DialogHeader>

        {/* preview */}
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <div className="h-24" style={{ background: hex }} />
          <div className="flex items-center justify-between bg-secondary/60 px-3 py-2">
            <span className="font-mono text-xs">{hex}</span>
            <button type="button" onClick={() => copy(hex, "HEX")} aria-label="Copy HEX" className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {origin && <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">From: {origin}</p>}

        {/* sampling */}
        <div className="mt-3">
          <button
            type="button" onClick={pickFromPage} disabled={!t.activeUrl}
            title={t.activeUrl ? "Hover an element in the preview, then click it" : "Load a page first"}
            className="h-9 w-full rounded-md bg-primary text-xs font-medium text-primary-foreground hover:brightness-110 disabled:opacity-40"
          >
            Pick from page
          </button>
        </div>

        {/* hex field */}
        <div className="mt-3 flex items-center gap-2">
          <span className="h-8 w-8 shrink-0 rounded-md border border-border" style={{ background: hex }} />
          <input
            value={draft} spellCheck={false} aria-label="HEX value"
            onChange={(e) => { const v = e.target.value.toUpperCase(); setDraft(v); if (isHex(v)) setHex(v); }}
            onBlur={() => setDraft(hex)}
            className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 font-mono text-xs outline-none focus:border-primary/60"
          />
        </div>

        {/* colours on this page */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className={SECTION}>Colors on this page</span>
            {palette && palette.length > 0 && <span className="font-mono text-[10px] text-muted-foreground">{palette.length}</span>}
          </div>
          {palette && palette.length > 0 ? (
            <div className="grid grid-cols-8 gap-1.5">
              {palette.map((p) => {
                const h = toHex(p.rgb);
                return (
                  <button key={h} type="button" onClick={() => setColor(h)} title={`${h} · used ${p.n}×`}
                    className={cn("h-7 rounded-md border", hex === h ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : "border-border")}
                    style={{ background: h }} aria-label={`Use ${h}`} />
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              {!rdt.env.extension ? "Open this tool as the extension to read the page's colors."
                : !t.activeUrl ? "Load a page to see its colors."
                : palette === null ? "Reading the page…" : "No colors found yet."}
            </p>
          )}
        </div>

        {/* values */}
        <div className="mt-4 divide-y divide-border rounded-md border border-border font-mono text-[11px]">
          {[["HEX", hex], ["RGB", rgb.join(", ")], ["HSL", toHsl(rgb)], ["OKLCH", toOklch(rgb)]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-3 py-1.5">
              <span className="text-muted-foreground">{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>

        {/* copy */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => copy(hex, "HEX")} className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-medium text-primary-foreground hover:brightness-110">
            <Copy className="h-3.5 w-3.5" /> Copy HEX
          </button>
          <button type="button" onClick={() => copy(toRgbString(rgb), "RGB")} className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-border text-xs hover:bg-secondary">
            <Copy className="h-3.5 w-3.5" /> Copy RGB
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
