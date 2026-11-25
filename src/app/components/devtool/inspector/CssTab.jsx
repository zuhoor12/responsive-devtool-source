import { CSS_SECTIONS } from "@/lib/devtoolMock";
import { useDevTool } from "@/lib/DevToolContext";
import { fmtSize, useActiveElement } from "@/lib/inspect";
import Section from "./Section";

function CssDemo() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-2 py-1.5 rounded-md border border-border bg-secondary/40 text-[10px] font-mono text-muted-foreground">
        <span className="text-info">section.hero</span>
        <span>styles.css:128</span>
      </div>
      {CSS_SECTIONS.map((sec) => (
        <Section key={sec.title} title={sec.title.toUpperCase()}>
          <div className="rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 font-mono text-[11px] space-y-0.5">
            {sec.rows.map(([prop, val]) => (
              <div key={prop} className="flex justify-between gap-3">
                <span className="text-info">{prop}</span>
                <span className="text-foreground/90 truncate">{val}</span>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

function CssLive() {
  const el = useActiveElement();
  if (!el) return <div className="text-[11px] text-muted-foreground px-1 py-3">Reading computed styles…</div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-2 py-1.5 rounded-md border border-border bg-secondary/40 text-[10px] font-mono text-muted-foreground">
        <span className="text-info truncate">{el.label}</span>
        <span className="shrink-0 pl-2">{fmtSize(el.size)}</span>
      </div>
      {Object.entries(el.css).map(([title, rows]) => (
        <Section key={title} title={title.toUpperCase()}>
          <div className="rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 font-mono text-[11px] space-y-0.5">
            {rows.map(([prop, val]) => (
              <div key={prop} className="flex justify-between gap-3">
                <span className="text-info">{prop}</span>
                <span className="text-foreground/90 truncate" title={val}>{val || "—"}</span>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

export default function CssTab() {
  const t = useDevTool();
  return t.activeUrl ? <CssLive /> : <CssDemo />;
}
