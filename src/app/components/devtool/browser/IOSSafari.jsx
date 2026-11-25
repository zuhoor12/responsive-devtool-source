import { BookOpen, ChevronLeft, ChevronRight, Copy, Lock, PanelLeft, Plus, RotateCw, Share, TriangleAlert, Wifi } from "lucide-react";
import { useClock } from "@/components/devtool/browser/useClock";
import NavBtn from "@/components/devtool/browser/NavBtn";

// iOS status bar (top) and Safari's bottom bar (address capsule + toolbar + home indicator). Dark appearance.
const BG = "#1c1c1e";
const CAPSULE = "#2c2c2e";
const FG = "#ffffff";
const MUTED = "#6e6e73";

function Signal() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill={FG} aria-hidden="true">
      {[4, 6.5, 9, 12].map((h, i) => <rect key={i} x={i * 4.6} y={12 - h} width="3.2" height={h} rx="0.8" />)}
    </svg>
  );
}
function Battery() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke={FG} strokeOpacity="0.45" />
      <rect x="2" y="2" width="20" height="9" rx="2.3" fill={FG} />
      <path d="M25 4.5v4c.9-.3 1.5-1.2 1.5-2s-.6-1.7-1.5-2z" fill={FG} fillOpacity="0.5" />
    </svg>
  );
}

export function IOSStatusBar({ height }) {
  const time = useClock(false);
  const compact = height <= 20;
  return (
    <div className="flex items-end justify-between select-none pointer-events-none" style={{ height, background: BG, color: FG, padding: compact ? "0 12px 2px" : "0 34px 11px 40px" }}>
      <span style={{ fontSize: compact ? 12 : 16, fontWeight: 600, letterSpacing: -0.2 }}>{time}</span>
      <span className="flex items-center gap-[6px]">
        <Signal />
        <Wifi size={compact ? 13 : 16} strokeWidth={2.4} />
        <Battery />
      </span>
    </div>
  );
}

export function IOSSafariBar({ host, secure, homeIndicator, actions }) {
  return (
    <div className="select-none pointer-events-none" style={{ background: BG, color: FG }}>
      {/* address capsule */}
      <div className="flex items-center justify-center" style={{ height: 52, padding: "0 12px" }}>
        <div className="flex items-center w-full" style={{ height: 44, borderRadius: 22, background: CAPSULE, padding: "0 14px" }}>
          <span style={{ fontSize: 13, fontWeight: 500, width: 26 }}>
            <span style={{ fontSize: 11 }}>A</span>
            <span style={{ fontSize: 16 }}>A</span>
          </span>
          <span className="flex flex-1 items-center justify-center gap-[5px] min-w-0">
            {secure ? <Lock size={11} strokeWidth={2.6} className="shrink-0" /> : <TriangleAlert size={12} strokeWidth={2.4} className="shrink-0" />}
            <span className="truncate" style={{ fontSize: 16 }}>{host}</span>
          </span>
          <NavBtn onClick={actions && actions.reload} title="Reload" className="flex items-center justify-end" style={{ width: 26, height: 30 }}><RotateCw size={16} strokeWidth={2.2} /></NavBtn>
        </div>
      </div>
      {/* toolbar */}
      <div className="flex items-center justify-around" style={{ height: 44, padding: "0 10px" }}>
        <NavBtn onClick={actions && actions.back} title="Back" className="flex items-center justify-center" style={{ width: 44, height: 40 }}><ChevronLeft size={24} strokeWidth={2.2} /></NavBtn>
        <NavBtn onClick={actions && actions.forward} title="Forward" className="flex items-center justify-center" style={{ width: 44, height: 40, color: MUTED }}><ChevronRight size={24} strokeWidth={2.2} /></NavBtn>
        <Share size={21} strokeWidth={2} />
        <BookOpen size={21} strokeWidth={2} />
        <Copy size={20} strokeWidth={2} />
      </div>
      {homeIndicator && (
        <div className="flex items-center justify-center" style={{ height: 20 }}>
          <span style={{ width: 134, height: 5, borderRadius: 3, background: FG, opacity: 0.55 }} />
        </div>
      )}
    </div>
  );
}

// shared address capsule ("aA", lock + host, reload)
function Capsule({ host, secure, height = 44, fontSize = 16, onReload }) {
  return (
    <div className="flex items-center w-full" style={{ height, borderRadius: height / 2, background: CAPSULE, padding: "0 12px" }}>
      <span style={{ width: 26, fontWeight: 500 }}><span style={{ fontSize: 11 }}>A</span><span style={{ fontSize: 15 }}>A</span></span>
      <span className="flex flex-1 items-center justify-center gap-[5px] min-w-0">
        {secure ? <Lock size={11} strokeWidth={2.6} className="shrink-0" /> : <TriangleAlert size={12} strokeWidth={2.4} className="shrink-0" />}
        <span className="truncate" style={{ fontSize }}>{host}</span>
      </span>
      <NavBtn onClick={onReload} title="Reload" className="flex items-center justify-end" style={{ width: 26, height: height - 6 }}><RotateCw size={15} strokeWidth={2.2} /></NavBtn>
    </div>
  );
}

/** iPhone in landscape: no status bar, one compact Safari toolbar row. `inset` keeps it clear of the cut-out. */
export function IOSLandscapeBar({ host, secure, inset, actions }) {
  return (
    <div className="flex items-center gap-[16px] select-none pointer-events-none" style={{ height: 44, background: BG, color: FG, padding: `0 ${Math.max(inset, 12)}px` }}>
      <NavBtn onClick={actions && actions.back} title="Back" className="flex items-center justify-center" style={{ width: 30, height: 36 }}><ChevronLeft size={22} strokeWidth={2.2} /></NavBtn>
      <NavBtn onClick={actions && actions.forward} title="Forward" className="flex items-center justify-center" style={{ width: 30, height: 36, color: MUTED }}><ChevronRight size={22} strokeWidth={2.2} /></NavBtn>
      <div className="flex-1 min-w-0"><Capsule host={host} secure={secure} height={32} fontSize={14} onReload={actions && actions.reload} /></div>
      <Share size={19} strokeWidth={2} />
      <BookOpen size={19} strokeWidth={2} />
      <Copy size={18} strokeWidth={2} />
    </div>
  );
}

/** iPad: small status bar (time and date on the left) + one Safari toolbar. */
export function IPadSafariTop({ host, secure, actions }) {
  const time = useClock(false);
  const date = new Date().toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="select-none pointer-events-none" style={{ background: BG, color: FG }}>
      <div className="flex items-center justify-between" style={{ height: 24, padding: "0 24px", fontSize: 12.5, fontWeight: 600 }}>
        <span>{time} <span style={{ fontWeight: 500, marginLeft: 6 }}>{date}</span></span>
        <span className="flex items-center gap-[6px]"><Wifi size={14} strokeWidth={2.4} /><span style={{ fontSize: 12 }}>100%</span><Battery /></span>
      </div>
      <div className="flex items-center" style={{ height: 52, padding: "0 16px", gap: 18 }}>
        <PanelLeft size={21} strokeWidth={1.9} />
        <NavBtn onClick={actions && actions.back} title="Back" className="flex items-center justify-center" style={{ width: 30, height: 38 }}><ChevronLeft size={23} strokeWidth={2.2} /></NavBtn>
        <NavBtn onClick={actions && actions.forward} title="Forward" className="flex items-center justify-center" style={{ width: 30, height: 38, color: MUTED }}><ChevronRight size={23} strokeWidth={2.2} /></NavBtn>
        <div className="flex flex-1 justify-center min-w-0"><div style={{ width: "100%", maxWidth: 460 }}><Capsule host={host} secure={secure} height={36} fontSize={15} onReload={actions && actions.reload} /></div></div>
        <Share size={20} strokeWidth={2} />
        <Plus size={22} strokeWidth={2} />
        <Copy size={20} strokeWidth={2} />
      </div>
    </div>
  );
}
