import { BREAKPOINTS, breakpointFor } from "@/lib/devices";

export default function BreakpointTimeline({ width }) {
  const max = 1536;
  const pos = Math.min(width, max) / max * 100;
  const cur = breakpointFor(width);
  return (
    <div>
      <div className="relative h-7 rounded border border-border bg-secondary/50 overflow-visible">
        {BREAKPOINTS.slice(1).map((bp) => (
          <div
            key={bp.name}
            className="absolute top-0 bottom-0 w-px bg-border"
            style={{ left: `${(bp.min / max) * 100}%` }}
          />
        ))}
        <div className="absolute top-0 bottom-0 w-0.5 bg-info" style={{ left: `${pos}%` }}>
          <span className="absolute -top-0.5 left-1 text-[9px] font-mono text-info whitespace-nowrap">{width}px</span>
        </div>
      </div>
      <div className="flex justify-between text-[9px] font-mono text-muted-foreground mt-1">
        {BREAKPOINTS.map((bp) => <span key={bp.name}>{bp.name}</span>)}
      </div>
      <div className="mt-2 text-[11px]">
        Current breakpoint: <span className="font-mono text-primary">{cur.name}</span>
      </div>
    </div>
  );
}