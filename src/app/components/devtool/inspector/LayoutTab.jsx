import { useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import Section from "./Section";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtBox, fmtSize, useActiveElement, useActiveViewport } from "@/lib/inspect";

const BASE_MARKS = [640, 768, 1024, 1280, 1536];
const MARK_LABELS = { 640: "Mobile", 768: "Tablet", 1024: "Tablet", 1280: "Laptop", 1536: "Desktop" };
const MAX = 1600;

export default function LayoutTab() {
  const t = useDevTool();
  const [customBps, setCustomBps] = useState([1440]);
  const [newBp, setNewBp] = useState("");
  const live = !!t.activeUrl;
  const vp = useActiveViewport();
  const el = useActiveElement();
  const width = live ? vp.width : t.size.width;
  const pos = Math.min(width, MAX) / MAX * 100;
  const marks = [...BASE_MARKS, ...customBps].sort((a, b) => a - b);

  const addBp = () => {
    const v = parseInt(newBp);
    if (v > 0 && v <= MAX) setCustomBps((b) => [...new Set([...b, v])]);
    setNewBp("");
  };

  return (
    <div>
      <Section title="BOX MODEL">
        <div className="rounded-md border border-warning/50 bg-warning/5 p-2 font-mono text-[9px] text-warning mb-1">
          margin: {live ? (el ? fmtBox(el.box.margin) : "…") : "0 24px"}
        </div>
        <div className="rounded-md border border-primary/50 bg-primary/5 p-2 font-mono text-[9px] text-primary mb-1">
          padding: {live ? (el ? fmtBox(el.box.padding) : "…") : "24px"}
        </div>
        <div className="rounded-md border border-border bg-secondary p-3 text-center">
          <span className="text-[11px] font-mono text-foreground">
            {live ? (el ? fmtSize(el.size) : `${width} × ${vp.height}`) : `${width} × ${t.size.height}`}
          </span>
        </div>
        {live && el && <p className="mt-1 text-[9px] font-mono text-muted-foreground truncate">{el.label}</p>}
      </Section>

      <Section title="BREAKPOINT TESTER">
        <div className="rounded-md border border-border bg-secondary/40 p-3">
          <div className="relative h-14">
            {/* segment band */}
            <div className="absolute top-0 left-0 right-0 h-6 flex rounded-sm overflow-hidden border border-border">
              {marks.map((m, i) => {
                const prev = i === 0 ? 0 : marks[i - 1];
                const pct = ((m - prev) / MAX) * 100;
                return (
                  <div
                    key={m}
                    style={{ width: `${pct}%` }}
                    className={cn(
                      "border-r border-border last:border-r-0",
                      width >= prev && width < m ? "bg-primary/30" : width >= m ? "bg-primary/15" : "bg-secondary"
                    )}
                  />
                );
              })}
              <div style={{ width: `${100 - (marks[marks.length - 1] / MAX) * 100}%` }} className={cn(width >= marks[marks.length - 1] ? "bg-primary/15" : "bg-secondary")} />
            </div>
            {/* markers */}
            {marks.map((m) => (
              <div key={m} className="absolute top-0 h-9 w-px bg-muted-foreground/50" style={{ left: `${(m / MAX) * 100}%` }}>
                <span className="absolute top-7 -translate-x-1/2 left-0 text-[8px] font-mono text-muted-foreground whitespace-nowrap">{m}</span>
                <span className="absolute top-[26px] -translate-x-1/2 left-0 text-[8px] text-muted-foreground/70 whitespace-nowrap">{MARK_LABELS[m] || "custom"}</span>
              </div>
            ))}
            {/* current viewport */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-info" style={{ left: `${pos}%` }}>
              <span className="absolute -top-0 left-1 text-[9px] font-mono text-info whitespace-nowrap">{width}px</span>
            </div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground/60 mt-2">
            <span>0</span><span>{MAX}</span>
          </div>

          <div className="flex gap-1.5 mt-3">
            <input
              type="number"
              placeholder="px"
              value={newBp}
              onChange={(e) => setNewBp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBp()}
              className="h-7 w-20 rounded border border-border bg-background px-2 font-mono text-[11px] outline-none focus:border-primary/50"
            />
            <button onClick={addBp} className="h-7 px-2 flex items-center gap-1 rounded border border-border text-[10px] text-muted-foreground hover:text-primary hover:border-primary/50">
              <Plus className="w-3 h-3" /> Add breakpoint
            </button>
          </div>
          {customBps.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {customBps.map((b) => (
                <span key={b} className="flex items-center gap-1 px-1.5 h-5 rounded border border-info/40 bg-info/10 text-[9px] font-mono text-info">
                  {b}px
                  <button onClick={() => setCustomBps((list) => list.filter((x) => x !== b))}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}