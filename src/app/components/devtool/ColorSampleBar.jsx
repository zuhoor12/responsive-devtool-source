import { useEffect } from "react";
import { X } from "lucide-react";
import { useDevTool } from "@/lib/DevToolContext";
import { toHex } from "@/lib/color";

// Bottom bar shown while colour sampling is on: the colour under the pointer, which element it is from,
// and how to pick it. Escape or the X leaves the mode.
export default function ColorSampleBar() {
  const t = useDevTool();
  const active = t.colorSampling;

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => { if (e.key === "Escape") t.stopSampling(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, t.stopSampling]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;
  const s = t.colorSample && t.colorSample.info;
  const hex = s ? toHex(s.primary) : null;
  const what = !s ? "" : s.kind === "text" ? "text colour" : s.bgSource === "element" ? "background" : s.bgSource === "ancestor" ? "background of a parent" : "page background";
  const from = s ? `${s.label} · ${what}` : "";

  return (
    <div role="status" className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <span className="h-8 w-8 shrink-0 rounded-md border border-border" style={{ background: hex || "transparent" }} />
      <div className="min-w-[200px] leading-tight">
        <div className="font-mono text-xs">{hex || "—"}</div>
        <div className="truncate font-mono text-[10px] text-muted-foreground max-w-[260px]">{s ? from : "Hover an element in the preview to sample its colour"}</div>
      </div>
      {s && <span className="text-[10px] text-primary">Click to pick</span>}
      <button type="button" onClick={t.stopSampling} aria-label="Stop colour sampling" className="ml-1 rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
