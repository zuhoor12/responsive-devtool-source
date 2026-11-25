import { Apple, ArrowLeft, ArrowRight, BatteryFull, Calendar, Chrome, Compass, EllipsisVertical, LayoutGrid, Mail, MessageCircle, Plus, RotateCw, Search, Settings, SlidersHorizontal, Smile, Star, Trash2, Wifi, X } from "lucide-react";
import { useEffect, useState } from "react";
import NavBtn from "@/components/devtool/browser/NavBtn";
import Favicon from "@/components/devtool/browser/Favicon";

// macOS menu bar + Chrome window + Dock. Base sizes: menu bar 25 + tab strip 36 + toolbar 40, dock area 76.
const FRAME = "#202124";
const TOOLBAR = "#35363a";
const OMNIBOX = "#202124";
const FG = "#e8eaed";
const MUTED = "#9aa0a6";
const WALLPAPER = "linear-gradient(135deg,#1e3a8a 0%,#4c1d95 55%,#0f172a 100%)";

export const MAC_TOP = 25 + 36 + 40;
export const MAC_BOTTOM = 76;

const MENUS = ["File", "Edit", "View", "History", "Bookmarks", "Profiles", "Tab", "Window", "Help"];

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(id); }, []);
  return now;
}

export function MacTop({ title, host, secure, favicon, actions }) {
  const now = useNow();
  return (
    <div className="select-none pointer-events-none" style={{ color: FG }}>
      {/* macOS menu bar */}
      <div className="flex items-center" style={{ height: 25, background: "rgba(15,23,42,0.92)", padding: "0 12px", fontSize: 12.5 }}>
        <Apple size={14} fill="currentColor" className="mr-[14px]" />
        <b className="mr-[14px]" style={{ fontWeight: 700 }}>Chrome</b>
        {MENUS.map((m) => <span key={m} className="mr-[14px]">{m}</span>)}
        <span className="flex-1" />
        <span className="flex items-center gap-[12px]">
          <BatteryFull size={15} /><Wifi size={14} /><Search size={13} />
          <span>{now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
        </span>
      </div>
      {/* Chrome tab strip with traffic lights */}
      <div className="flex items-end" style={{ height: 36, background: FRAME }}>
        <span className="flex items-center gap-[8px] self-center" style={{ padding: "0 14px 0 14px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
        </span>
        <div className="flex items-center gap-[8px]" style={{ width: 230, height: 30, padding: "0 10px", background: TOOLBAR, borderRadius: "8px 8px 0 0" }}>
          <Favicon src={favicon} />
          <span className="truncate flex-1" style={{ fontSize: 12 }}>{title}</span>
          <X size={13} className="shrink-0" />
        </div>
        <span className="flex items-center justify-center self-center" style={{ width: 28, height: 28 }}><Plus size={15} /></span>
      </div>
      {/* toolbar */}
      <div className="flex items-center gap-[2px]" style={{ height: 40, background: TOOLBAR, padding: "0 8px" }}>
        <NavBtn onClick={actions && actions.back} title="Back" className="flex items-center justify-center" style={{ width: 32, height: 32 }}><ArrowLeft size={17} /></NavBtn>
        <NavBtn onClick={actions && actions.forward} title="Forward" className="flex items-center justify-center" style={{ width: 32, height: 32, color: MUTED }}><ArrowRight size={17} /></NavBtn>
        <NavBtn onClick={actions && actions.reload} title="Reload" className="flex items-center justify-center" style={{ width: 32, height: 32 }}><RotateCw size={15} /></NavBtn>
        <div className="flex items-center flex-1 min-w-0 mx-[6px]" style={{ height: 30, borderRadius: 15, background: OMNIBOX, padding: "0 6px" }}>
          <span className="flex items-center justify-center shrink-0" style={{ width: 24, height: 24, borderRadius: 12, background: "#35363a" }}>
            <SlidersHorizontal size={13} style={{ color: secure ? FG : "#f28b82" }} />
          </span>
          <span className="truncate flex-1 ml-[8px]" style={{ fontSize: 13.5 }}>{host}</span>
          <Star size={15} className="mr-[6px] shrink-0" />
        </div>
        <span className="flex items-center justify-center shrink-0" style={{ width: 28, height: 28 }}>
          <span style={{ width: 22, height: 22, borderRadius: 11, background: "linear-gradient(135deg,#8ab4f8,#c58af9)" }} />
        </span>
        <span className="flex items-center justify-center" style={{ width: 28, height: 32 }}><EllipsisVertical size={17} /></span>
      </div>
    </div>
  );
}

const DOCK = [
  { bg: "linear-gradient(#5ac8fa,#0a84ff)", icon: Smile },
  { bg: "linear-gradient(#e5e5ea,#8e8e93)", icon: LayoutGrid },
  { bg: "linear-gradient(#5ac8fa,#0a84ff)", icon: Compass },
  { bg: "linear-gradient(#5cdc6c,#1fa83a)", icon: MessageCircle },
  { bg: "linear-gradient(#5ac8fa,#0a60ff)", icon: Mail },
  { bg: "linear-gradient(#ffffff,#d1d1d6)", icon: Calendar, dark: true },
  { bg: "linear-gradient(#a1a1a6,#636366)", icon: Settings },
  { bg: "conic-gradient(#ea4335 0 33%,#fbbc05 0 66%,#34a853 0)", icon: Chrome },
];

export function MacDock() {
  return (
    <div className="flex items-end justify-center select-none pointer-events-none" style={{ height: 76, background: WALLPAPER, paddingBottom: 8 }}>
      <div className="flex items-center gap-[9px]" style={{ height: 62, padding: "0 10px", borderRadius: 20, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)" }}>
        {DOCK.map(({ bg, icon: Icon, dark }, i) => (
          <span key={i} className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 11, background: bg, color: dark ? "#ff3b30" : "#fff" }}>
            <Icon size={23} strokeWidth={1.8} />
          </span>
        ))}
        <span style={{ width: 1, height: 38, background: "rgba(255,255,255,0.3)" }} />
        <span className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 11, background: "linear-gradient(#c7c7cc,#8e8e93)", color: "#fff" }}>
          <Trash2 size={22} strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}
