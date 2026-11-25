import { ArrowLeft, ArrowRight, Battery, Bell, ChevronDown, ChevronUp, EllipsisVertical, Folder, Minus, Puzzle, RotateCw, Search, ShoppingBag, SlidersHorizontal, Square, Star, Volume2, Wifi, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import NavBtn from "@/components/devtool/browser/NavBtn";
import Favicon from "@/components/devtool/browser/Favicon";

// Chrome (desktop, dark) window and the Windows 11 taskbar. Base sizes: tab strip 34 + toolbar 40, taskbar 48.
const FRAME = "#202124";
const TOOLBAR = "#35363a";
const OMNIBOX = "#202124";
const FG = "#e8eaed";
const MUTED = "#9aa0a6";

export const WINDOWS_TOP = 74;
export const WINDOWS_BOTTOM = 48;

const Btn = ({ children, w = 32, onClick, title }) => (
  <NavBtn onClick={onClick} title={title} className="flex items-center justify-center shrink-0" style={{ width: w, height: 32, color: FG }}>{children}</NavBtn>
);

export function WindowsTop({ title, host, secure, favicon, actions }) {
  return (
    <div className="select-none pointer-events-none" style={{ color: FG }}>
      {/* tab strip */}
      <div className="flex items-end" style={{ height: 34, background: FRAME }}>
        <span className="flex items-center justify-center self-center" style={{ width: 30, height: 24, margin: "0 6px 0 8px", borderRadius: 12, background: "#303134" }}>
          <ChevronDown size={14} />
        </span>
        <div className="flex items-center gap-[8px]" style={{ width: 230, height: 28, padding: "0 10px", background: TOOLBAR, borderRadius: "8px 8px 0 0" }}>
          <Favicon src={favicon} />
          <span className="truncate flex-1" style={{ fontSize: 12 }}>{title}</span>
          <X size={13} className="shrink-0" />
        </div>
        <span className="flex items-center justify-center self-center" style={{ width: 28, height: 28 }}><Plus size={15} /></span>
        <span className="flex-1" />
        <span className="flex self-stretch">
          {[Minus, Square, X].map((Icon, i) => (
            <span key={i} className="flex items-center justify-center" style={{ width: 46, height: 34 }}><Icon size={i === 1 ? 11 : 14} strokeWidth={1.6} /></span>
          ))}
        </span>
      </div>
      {/* toolbar */}
      <div className="flex items-center gap-[2px]" style={{ height: 40, background: TOOLBAR, padding: "0 8px" }}>
        <Btn onClick={actions && actions.back} title="Back"><ArrowLeft size={17} /></Btn>
        <Btn onClick={actions && actions.forward} title="Forward"><ArrowRight size={17} style={{ color: MUTED }} /></Btn>
        <Btn onClick={actions && actions.reload} title="Reload"><RotateCw size={15} /></Btn>
        <div className="flex items-center flex-1 min-w-0 mx-[6px]" style={{ height: 30, borderRadius: 15, background: OMNIBOX, padding: "0 6px" }}>
          <span className="flex items-center justify-center shrink-0" style={{ width: 24, height: 24, borderRadius: 12, background: "#35363a" }}>
            <SlidersHorizontal size={13} style={{ color: secure ? FG : "#f28b82" }} />
          </span>
          <span className="truncate flex-1 ml-[8px]" style={{ fontSize: 13.5 }}>{host}</span>
          <Star size={15} style={{ color: FG }} className="mr-[6px] shrink-0" />
        </div>
        <Btn><Puzzle size={16} /></Btn>
        <span className="flex items-center justify-center shrink-0" style={{ width: 28, height: 28 }}>
          <span style={{ width: 22, height: 22, borderRadius: 11, background: "linear-gradient(135deg,#8ab4f8,#c58af9)" }} />
        </span>
        <Btn w={28}><EllipsisVertical size={17} /></Btn>
      </div>
    </div>
  );
}

const APPS = [
  { bg: "#f4b400", icon: <Folder size={16} color="#1f1f1f" fill="#1f1f1f" /> },
  { bg: "linear-gradient(135deg,#35c1f1,#1b8e5a)", icon: <span style={{ width: 14, height: 14, borderRadius: 7, border: "3px solid #fff" }} /> },
  { bg: "#0a84ff", icon: <ShoppingBag size={15} color="#fff" /> },
  { bg: "conic-gradient(#ea4335 0 33%,#fbbc05 0 66%,#34a853 0)", icon: <span style={{ width: 11, height: 11, borderRadius: 6, background: "#4285f4", border: "2px solid #fff" }} /> },
];

export function WindowsTaskbar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(id); }, []);
  return (
    <div className="relative flex items-center select-none pointer-events-none" style={{ height: 48, background: "#1c1c1e", color: FG, borderTop: "1px solid #2f2f33" }}>
      <div className="absolute inset-0 flex items-center justify-center gap-[8px]">
        <span className="grid grid-cols-2 gap-[2px]" style={{ width: 20, height: 20 }}>
          {[0, 1, 2, 3].map((i) => <span key={i} style={{ background: "#4cc2ff", borderRadius: 1.5 }} />)}
        </span>
        <span className="flex items-center gap-[8px]" style={{ width: 170, height: 32, borderRadius: 16, background: "#2b2b2f", padding: "0 12px", fontSize: 12.5, color: MUTED }}>
          <Search size={14} /> Search
        </span>
        {APPS.map((a, i) => (
          <span key={i} className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 8, background: a.bg }}>{a.icon}</span>
        ))}
      </div>
      <div className="flex items-center gap-[10px] ml-auto pr-[12px]" style={{ fontSize: 11.5 }}>
        <ChevronUp size={13} />
        <span>ENG</span>
        <Wifi size={14} /><Volume2 size={14} /><Battery size={15} />
        <span className="text-right leading-[14px]">
          <div>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
          <div>{now.toLocaleDateString()}</div>
        </span>
        <Bell size={14} />
      </div>
    </div>
  );
}
