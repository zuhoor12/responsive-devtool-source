import { useEffect, useRef, useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, ArrowRight, RotateCw, Command, HelpCircle, Settings,
  Moon, Sun, MonitorSmartphone, Share2, Smartphone,
} from "lucide-react";
import { buildShareUrl } from "@/lib/shareLink";
import { cn } from "@/lib/utils";

function TopBtn({ icon: Icon, label, onClick }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export default function TopBar() {
  const t = useDevTool();
  const { toast } = useToast();
  const [urlInput, setUrlInput] = useState(t.currentUrl || t.activeUrl || "http://localhost:5173");
  const focused = useRef(false);

  // follow navigation that happens inside the page (links, SPA routes, back/forward)
  useEffect(() => {
    if (!focused.current && t.currentUrl) setUrlInput(t.currentUrl);
  }, [t.currentUrl]);

  const load = () => {
    const url = t.loadUrl(urlInput);
    if (!url) return;
    setUrlInput(url);
    toast({ title: "Loaded", description: url });
  };

  const doc = t.docStatus[t.activeDeviceId];
  const code = !t.activeUrl ? 200 : doc ? (doc.error ? "ERR" : doc.status) : null;
  const codeBad = code === "ERR" || (typeof code === "number" && (code >= 400 || code === 0));

  const copyShare = async () => {
    const link = buildShareUrl(t);
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copied", description: "Anyone opening it sees this exact preview setup." });
    } catch {
      toast({ title: "Couldn't copy automatically", description: link });
    }
  };

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-3 border-b bg-card">
      {/* Left: brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-sm">
          <MonitorSmartphone className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold font-heading">Responsive DevTool</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border border-success/40 text-success">FREE</span>
          <span className="text-[10px] font-mono text-muted-foreground/60">v2.4.1</span>
        </div>
      </div>

      {/* Center: URL bar */}
      <div className="flex-1 max-w-2xl mx-auto flex items-center gap-1">
        <TopBtn icon={ArrowLeft} label="Back" onClick={t.goBack} />
        <TopBtn icon={ArrowRight} label="Forward" onClick={t.goForward} />
        <TopBtn
          icon={RotateCw}
          label="Refresh"
          onClick={t.reload}
        />
        <div className="relative flex-1">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            onFocus={(e) => { focused.current = true; e.target.select(); }}
            onBlur={() => { focused.current = false; setUrlInput(t.currentUrl || t.activeUrl || urlInput); }}
            spellCheck={false}
            aria-label="Page URL"
            className="h-8 bg-background border-border font-mono text-xs pr-14 focus-visible:border-primary/50"
          />
          {code !== null && (
            <span className={cn("absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono", codeBad ? "text-destructive" : "text-success")}>● {code === 0 ? "ERR" : code}</span>
          )}
        </div>
        <button
          onClick={load}
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          Load
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          title="Command palette (Ctrl+K)"
          onClick={() => t.openDialog("palette")}
          className="h-8 px-2 flex items-center gap-1.5 rounded-md border border-border text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Command className="w-3 h-3" /> Ctrl K
        </button>
        <TopBtn icon={Smartphone} label="Test on a real phone (QR code)" onClick={() => t.openDialog("realDevice")} />
        <TopBtn icon={Share2} label="Copy shareable link" onClick={copyShare} />
        <TopBtn icon={HelpCircle} label="Help" onClick={() => toast({ title: "Quick help", description: "Ctrl+K opens the command palette. Use the pointer tool, then click any element to inspect it. All shortcuts are listed in Settings." })} />
        <TopBtn icon={Settings} label="Settings" onClick={() => t.openDialog("settings")} />
        <TopBtn
          icon={t.theme === "dark" ? Moon : Sun}
          label={t.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={t.toggleTheme}
        />
      </div>
    </header>
  );
}