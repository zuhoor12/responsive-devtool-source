import { ArrowLeft, ArrowRight, BatteryFull, CircleAlert, EllipsisVertical, House, Lock, Plus, RotateCw, Signal, Star, Wifi, X } from "lucide-react";
import { useClock } from "@/components/devtool/browser/useClock";
import NavBtn from "@/components/devtool/browser/NavBtn";
import Favicon from "@/components/devtool/browser/Favicon";

// Android status bar + Chrome (mobile) toolbar. Dark theme, like Chrome in dark mode.
const BG = "#1f2023";
const PILL = "#303134";
const FG = "#e8eaed";

export default function AndroidChrome({ host, secure }) {
  const time = useClock();
  return (
    <div style={{ background: BG, color: FG }} className="select-none pointer-events-none">
      {/* status bar (the camera cut-out sits in the middle of it) */}
      <div className="flex items-center justify-between px-[22px]" style={{ height: 28, fontSize: 12.5, fontWeight: 500 }}>
        <span>{time}</span>
        <span className="flex items-center gap-[6px]">
          <Wifi size={13} strokeWidth={2.2} />
          <Signal size={12} strokeWidth={2.2} />
          <span style={{ fontSize: 11.5 }}>100%</span>
          <BatteryFull size={14} strokeWidth={2} />
        </span>
      </div>
      {/* Chrome toolbar */}
      <div className="flex items-center gap-[4px] px-[6px]" style={{ height: 56 }}>
        <span className="flex items-center justify-center" style={{ width: 40, height: 40 }}>
          <House size={20} strokeWidth={1.9} />
        </span>
        <div className="flex items-center gap-[8px] flex-1 min-w-0 px-[14px]" style={{ height: 40, borderRadius: 20, background: PILL }}>
          {secure ? <Lock size={14} strokeWidth={2.2} className="shrink-0" /> : <CircleAlert size={14} strokeWidth={2.2} className="shrink-0" />}
          <span className="truncate" style={{ fontSize: 14.5 }}>{host}</span>
        </div>
        <span className="flex items-center justify-center" style={{ width: 40, height: 40 }}>
          <span className="flex items-center justify-center" style={{ width: 22, height: 22, border: `2px solid ${FG}`, borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>1</span>
        </span>
        <span className="flex items-center justify-center" style={{ width: 32, height: 40 }}>
          <EllipsisVertical size={20} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

/** Chrome on Android tablets / unfolded foldables: status bar + tab strip + toolbar. */
export function AndroidTabletChrome({ host, secure, title, favicon, actions }) {
  const time = useClock();
  const TOOLBAR = "#2d2e31";
  return (
    <div style={{ background: BG, color: FG }} className="select-none pointer-events-none">
      <div className="flex items-center justify-between px-[22px]" style={{ height: 28, fontSize: 12.5, fontWeight: 500 }}>
        <span>{time}</span>
        <span className="flex items-center gap-[6px]">
          <Wifi size={13} strokeWidth={2.2} /><Signal size={12} strokeWidth={2.2} />
          <span style={{ fontSize: 11.5 }}>100%</span><BatteryFull size={14} strokeWidth={2} />
        </span>
      </div>
      {/* tab strip */}
      <div className="flex items-end" style={{ height: 40, padding: "0 8px", background: "#17181a" }}>
        <div className="flex items-center gap-[8px]" style={{ width: 230, height: 34, padding: "0 12px", background: TOOLBAR, borderRadius: "10px 10px 0 0" }}>
          <Favicon src={favicon} />
          <span className="truncate flex-1" style={{ fontSize: 12.5 }}>{title || host}</span>
          <X size={14} className="shrink-0" />
        </div>
        <span className="flex items-center justify-center self-center" style={{ width: 32, height: 32 }}><Plus size={17} /></span>
      </div>
      {/* toolbar */}
      <div className="flex items-center gap-[4px]" style={{ height: 52, padding: "0 10px", background: TOOLBAR }}>
        <NavBtn onClick={actions && actions.back} title="Back" className="flex items-center justify-center" style={{ width: 38, height: 38 }}><ArrowLeft size={19} /></NavBtn>
        <NavBtn onClick={actions && actions.forward} title="Forward" className="flex items-center justify-center" style={{ width: 38, height: 38, color: "#9aa0a6" }}><ArrowRight size={19} /></NavBtn>
        <NavBtn onClick={actions && actions.reload} title="Reload" className="flex items-center justify-center" style={{ width: 38, height: 38 }}><RotateCw size={17} /></NavBtn>
        <div className="flex items-center gap-[8px] flex-1 min-w-0 px-[16px]" style={{ height: 38, borderRadius: 19, background: PILL }}>
          {secure ? <Lock size={14} strokeWidth={2.2} className="shrink-0" /> : <CircleAlert size={14} strokeWidth={2.2} className="shrink-0" />}
          <span className="truncate flex-1" style={{ fontSize: 14.5 }}>{host}</span>
          <Star size={16} className="shrink-0" />
        </div>
        <span className="flex items-center justify-center" style={{ width: 38, height: 38 }}>
          <span className="flex items-center justify-center" style={{ width: 22, height: 22, border: `2px solid ${FG}`, borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>1</span>
        </span>
        <span className="flex items-center justify-center" style={{ width: 32, height: 38 }}><EllipsisVertical size={20} /></span>
      </div>
    </div>
  );
}
