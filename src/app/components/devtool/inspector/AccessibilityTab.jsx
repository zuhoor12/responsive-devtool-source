import { useEffect, useState } from "react";
import rdt from "@core/index.js";
import { A11Y_CHECKS } from "@/lib/devtoolMock";
import { useDevTool } from "@/lib/DevToolContext";
import Section from "./Section";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function AccessibilityTab() {
  const t = useDevTool();
  const live = !!t.activeUrl;
  const [checks, setChecks] = useState(null); // null = running

  // Real audit, run inside the page whenever this tab opens or the page changes.
  const pageKey = t.frameInfo[t.activeDeviceId] ? t.frameInfo[t.activeDeviceId].url : "";
  useEffect(() => {
    if (!live) return undefined;
    let dead = false;
    setChecks(null);
    rdt.agent.a11y(t.activeDeviceId).then((r) => { if (!dead) setChecks(r || []); });
    return () => { dead = true; };
  }, [live, t.activeDeviceId, t.reloadKey, pageKey]);

  const list = live ? checks || [] : A11Y_CHECKS;
  const passed = list.filter((c) => c.status === "pass").length;
  const warned = list.filter((c) => c.status === "warn").length;
  return (
    <div>
      <Section title="AUDIT" right={
        <span className="text-[9px] font-mono text-muted-foreground">
          <span className="text-success">{passed} passed</span> · <span className="text-warning">{warned} warnings</span>
        </span>
      }>
        {live && checks === null && <div className="text-[11px] text-muted-foreground px-1 py-3">Running the audit…</div>}
        {live && checks && !checks.length && (
          <div className="text-[11px] text-muted-foreground px-1 py-3">The page didn't answer. Wait for it to finish loading, then reopen this tab.</div>
        )}
        <div className="rounded-md border border-border overflow-hidden">
          {list.map((c, i) => (
            <div key={c.label} className={i % 2 === 0 ? "flex items-start gap-2.5 px-2.5 py-2 bg-secondary/40" : "flex items-start gap-2.5 px-2.5 py-2"}>
              {c.status === "pass"
                ? <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                : <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />}
              <div>
                <div className="text-[11px] text-foreground/90">{c.label}</div>
                <div className="text-[10px] text-muted-foreground">{c.note}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}