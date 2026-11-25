import rdt from "@core/index.js";
import { useDevTool } from "@/lib/DevToolContext";
import { fmtBytes, fmtMs, requestName } from "@/lib/inspect";
import { NETWORK_REQUESTS } from "@/lib/devtoolMock";
import Section, { Row } from "./Section";
import { cn } from "@/lib/utils";

const PRESETS = ["Online", "Fast 3G", "Slow 3G", "4G", "Offline", "Custom"];

export default function NetworkTab() {
  const t = useDevTool();
  const cfg = t.networkCfg; // the values that are really applied (null = unthrottled)
  const offline = !!(cfg && cfg.offline);
  const custom = t.networkPreset === "Custom";
  const adv = !t.env.extension ? "web" : !t.cdp.supported ? "chrome" : t.cdp.active ? "on" : t.cdp.busy ? "busy" : "off";
  const advText = {
    on: "On: the network limits apply to every device frame.",
    busy: "Waiting for Chrome's permission prompt…",
    off: "Off. Pick a preset, or press Enable. Chrome asks for permission once.",
    chrome: "Throttling needs Chrome or Edge. Firefox does not expose the DevTools protocol to extensions.",
    web: "Throttling works when this page runs as the extension.",
  }[adv];
  const fmtMbps = (v) => (v > 0 ? `${v} Mbps` : "unlimited");
  const values = offline
    ? { download: "0 Mbps", upload: "0 Mbps", latency: "—", loss: "100%" }
    : cfg
      ? { download: fmtMbps(cfg.down), upload: fmtMbps(cfg.up), latency: `${cfg.latency} ms`, loss: `${cfg.loss}%` }
      : { download: "unlimited", upload: "unlimited", latency: "0 ms", loss: "0%" };
  // Real log from the extension (re-read whenever netTick changes); the design's sample list before a page is loaded.
  void t.netTick;
  const requests = t.activeUrl
    ? rdt.net.get(t.activeDeviceId).map((r) => ({
        key: `${r.id}-${r.url}`, name: requestName(r.url), type: r.kind, status: r.status,
        size: r.cached ? "cache" : fmtBytes(r.size), time: fmtMs(r.time), url: r.url,
      }))
    : NETWORK_REQUESTS.map((r) => ({ ...r, key: r.name }));

  return (
    <div>
      <Section title="NETWORK PRESET">
        <div className="grid grid-cols-3 gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => t.setNetworkPreset(p)}
              className={cn(
                "h-7 rounded text-[10px] border transition-colors",
                t.networkPreset === p
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </Section>

      <Section title="THROTTLING">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px]">
          <span className={cn("leading-snug", adv === "on" ? "text-success" : "text-muted-foreground")}>{advText}</span>
          {adv === "off" && (
            <button onClick={() => t.ensureAdvanced()} className="shrink-0 h-6 px-2 rounded border border-primary/40 text-primary hover:bg-primary/10">Enable</button>
          )}
        </div>
        <div className="rounded-md border border-border bg-secondary/40 px-2.5 py-1">
          {custom ? (
            <>
              <NumRow label="Download" unit="Mbps" value={t.customNet.down} onChange={(v) => t.setCustomNet({ down: v })} />
              <NumRow label="Upload" unit="Mbps" value={t.customNet.up} onChange={(v) => t.setCustomNet({ up: v })} />
              <NumRow label="Latency" unit="ms" value={t.customNet.latency} onChange={(v) => t.setCustomNet({ latency: v })} />
              <NumRow label="Packet loss" unit="%" value={t.customNet.loss} onChange={(v) => t.setCustomNet({ loss: v })} />
            </>
          ) : (
            <>
              <Row label="Download" value={values.download} />
              <Row label="Upload" value={values.upload} />
              <Row label="Latency" value={values.latency} />
              <Row label="Packet loss" value={values.loss} valueClass={offline ? "text-destructive" : ""} />
            </>
          )}
        </div>
        {custom && <p className="mt-1 text-[10px] text-muted-foreground">0 means unlimited. Changes apply right away.</p>}
      </Section>

      <Section title={`REQUESTS (${requests.length})`}>
        {t.activeUrl && !requests.length && (
          <div className="rounded-md border border-border bg-secondary/40 px-2.5 py-3 text-[11px] text-muted-foreground">
            No requests recorded yet for this device. They appear here as the page loads.
          </div>
        )}
        <div className="rounded-md border border-border overflow-hidden">
          {requests.map((r, i) => (
            <div
              key={r.key}
              className={cn(
                "flex items-center gap-2 px-2 h-7 text-[10px] font-mono",
                i % 2 === 0 ? "bg-secondary/40" : "bg-transparent",
                offline && "opacity-40"
              )}
            >
              <span className="w-1 h-1 rounded-full bg-info shrink-0" />
              <span title={`${r.url || r.name} (${r.type})`} className="flex-1 min-w-0 truncate text-foreground/90">{r.name}</span>
              <span className={cn("w-7 text-right shrink-0", r.status === 0 || r.status >= 400 ? "text-destructive" : "text-success")}>{r.status === 0 ? "ERR" : r.status}</span>
              <span className="w-12 text-right text-muted-foreground shrink-0">{r.size}</span>
              <span className="w-11 text-right text-muted-foreground shrink-0">{r.time}</span>
            </div>
          ))}
        </div>
        {offline && (
          <p className="mt-2 text-[10px] font-mono text-warning">⚠ Throttled: Offline — requests are blocked</p>
        )}
      </Section>
    </div>
  );
}

// Editable number row for the Custom throttling values.
function NumRow({ label, unit, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5">
        <input
          type="number" min={0} step="any" value={value}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="h-6 w-20 rounded border border-border bg-background px-2 text-right font-mono text-[11px] outline-none focus:border-primary/60"
        />
        <span className="w-8 text-[10px] text-muted-foreground">{unit}</span>
      </span>
    </label>
  );
}
