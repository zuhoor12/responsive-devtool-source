import { useMemo, useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Camera, LayoutGrid, Ruler, RotateCw, Plus, ScanSearch, Moon, Settings,
  Wrench, MonitorSmartphone, Pipette, Maximize2, Search, Smartphone,
} from "lucide-react";

export default function CommandPalette() {
  const t = useDevTool();
  const [query, setQuery] = useState("");

  const commands = useMemo(() => [
    { icon: MonitorSmartphone, label: "Open Device Simulator", shortcut: "", run: () => t.openDialog("deviceManager") },
    { icon: Camera, label: "Take Screenshot", shortcut: "Ctrl+S", run: () => t.openDialog("screenshot") },
    { icon: LayoutGrid, label: "Toggle Grid Overlay", shortcut: "Ctrl+G", run: () => t.setShowGrid(!t.showGrid) },
    { icon: Ruler, label: "Toggle Ruler", shortcut: "Ctrl+R", run: () => t.setShowRuler(!t.showRuler) },
    { icon: RotateCw, label: "Rotate Device", shortcut: "Ctrl+→", run: () => t.rotate() },
    { icon: Plus, label: "Add Custom Device", shortcut: "", run: () => t.openDialog("customDevice") },
    { icon: ScanSearch, label: "Open Inspector", shortcut: "", run: () => t.setInspectorTab("overview") },
    { icon: Moon, label: "Toggle Dark Mode Simulation", shortcut: "", run: () => t.toggleSim("darkMode") },
    { icon: Pipette, label: "Color Picker", shortcut: "", run: () => t.openDialog("colorPicker") },
    { icon: Wrench, label: "Open Tools", shortcut: "", run: () => t.openDialog("tools") },
    { icon: Settings, label: "Open Settings", shortcut: "", run: () => t.openDialog("settings") },
    { icon: Smartphone, label: "Test on a real phone (QR code)", shortcut: "", run: () => t.openDialog("realDevice") },
    { icon: Maximize2, label: "Fit to Screen", shortcut: "", run: () => t.fitToScreen() },
  ], [t]);

  const q = query.trim().toLowerCase();
  const filtered = commands.filter((c) => !q || c.label.toLowerCase().includes(q));

  const run = (cmd) => {
    setQuery("");
    t.closeDialog("palette");
    // Let the palette finish closing before the command runs: Radix cannot swap two dialogs in one tick
    // (the closing dialog's focus trap and body pointer-events lock would stay active).
    setTimeout(() => cmd.run(), 220);
  };

  return (
    <Dialog open={t.dialogs.palette} onOpenChange={(v) => !v && t.closeDialog("palette")}>
      <DialogContent className="top-[16%] translate-y-0 max-w-lg p-0 gap-0 rounded-md border-border bg-card">
        <div className="flex items-center gap-2 px-3 h-11 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && filtered[0] && run(filtered[0])}
            placeholder="Search commands..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <span className="text-[9px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</span>
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {filtered.map((c) => (
            <button
              key={c.label}
              onClick={() => run(c)}
              className="w-full flex items-center gap-2.5 px-2.5 h-9 rounded hover:bg-secondary text-left group"
            >
              <c.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              <span className="text-xs flex-1">{c.label}</span>
              {c.shortcut && (
                <span className="text-[9px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
                  {c.shortcut}
                </span>
              )}
            </button>
          ))}
          {!filtered.length && (
            <div className="text-xs text-muted-foreground text-center py-6">No commands found</div>
          )}
        </div>
        <div className="flex items-center gap-3 px-3 h-8 border-t border-border text-[10px] text-muted-foreground font-mono">
          <span>↑↓ navigate</span><span>↵ select</span><span className="ml-auto">esc close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}