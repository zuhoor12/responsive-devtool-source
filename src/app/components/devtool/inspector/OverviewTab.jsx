import { useDevTool } from "@/lib/DevToolContext";
import Section, { Row } from "./Section";
import BreakpointTimeline from "@/components/devtool/BreakpointTimeline";
import { useActiveViewport } from "@/lib/inspect";

function OverviewDemo() {
  const t = useDevTool();
  const host = "localhost:5173";
  return (
    <div>
      <Section title="VIEWPORT">
        <div className="rounded-md border border-border bg-secondary/40">
          <div className="px-2.5 py-1">
            <Row label="Width" value={`${t.size.width}px`} />
            <Row label="Height" value={`${t.size.height}px`} />
            <Row label="DPR" value={`${t.dpr}x`} />
            <Row label="Orientation" value={t.orientation} />
            <Row label="Device" value={t.selectedDevice?.name || "—"} />
          </div>
        </div>
      </Section>

      <Section title="BREAKPOINT">
        <BreakpointTimeline width={t.size.width} />
      </Section>

      <Section title="PAGE INFORMATION">
        <div className="rounded-md border border-border bg-secondary/40">
          <div className="px-2.5 py-1">
            <Row label="URL" value={host} />
            <Row label="Protocol" value="HTTP" />
            <Row label="Host" value={host} />
            <Row label="Framework" value="React" />
            <Row label="Status" value="Online" valueClass="text-success" />
            <Row label="Connection" value={t.networkPreset} />
          </div>
        </div>
      </Section>
    </div>
  );
}

function OverviewLive() {
  const t = useDevTool();
  const vp = useActiveViewport();
  const info = t.frameInfo[t.activeDeviceId];
  const device = t.visibleDevices.find((d) => d.id === t.activeDeviceId) || t.selectedDevice;
  const offline = t.networkPreset === "Offline";
  const status = offline ? "Offline" : info ? (info.ready === "complete" ? "Online" : "Loading…") : "Waiting…";
  const statusClass = offline ? "text-destructive" : info && info.ready === "complete" ? "text-success" : "text-muted-foreground";
  const frameworks = info && info.frameworks && info.frameworks.length ? info.frameworks.slice(0, 2).join(" + ") : info ? "None detected" : "—";
  return (
    <div>
      <Section title="VIEWPORT">
        <div className="rounded-md border border-border bg-secondary/40">
          <div className="px-2.5 py-1">
            <Row label="Width" value={`${vp.width}px`} />
            <Row label="Height" value={`${vp.height}px`} />
            <Row label="DPR" value={`${device?.dpr ?? t.dpr}x`} />
            <Row label="Orientation" value={vp.width > vp.height ? "landscape" : "portrait"} />
            <Row label="Device" value={device?.name || "—"} />
            {info && info.hScroll && <Row label="Horizontal scroll" value="detected" valueClass="text-warning" />}
          </div>
        </div>
      </Section>

      <Section title="BREAKPOINT">
        <BreakpointTimeline width={vp.width} />
      </Section>

      <Section title="PAGE INFORMATION">
        <div className="rounded-md border border-border bg-secondary/40">
          <div className="px-2.5 py-1">
            <Row label="URL" value={info ? info.host : "—"} />
            <Row label="Protocol" value={info ? info.protocol : "—"} />
            <Row label="Host" value={info ? info.host : "—"} />
            <Row label="Framework" value={frameworks} mono={false} />
            <Row label="Status" value={status} valueClass={statusClass} />
            <Row label="Connection" value={t.networkPreset} />
          </div>
        </div>
      </Section>
    </div>
  );
}

export default function OverviewTab() {
  const t = useDevTool();
  return t.activeUrl ? <OverviewLive /> : <OverviewDemo />;
}
