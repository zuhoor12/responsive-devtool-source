import { useDevTool } from "@/lib/DevToolContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  MonitorSmartphone, Layers, Crop, ZoomIn, MousePointerClick, Braces, Type, Move,
  Box, ListTree, Ruler, LayoutGrid, Crosshair, Pipette, Contrast, AlignLeft, Hand,
  Mouse, Keyboard, Activity, Moon, Globe, Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ToolsPanel() {
  const t = useDevTool();
  const { toast } = useToast();

  const dprSim = async () => {
    const ok = await t.ensureAdvanced();
    if (ok) toast({ title: "DPR Simulator", description: `Every device now renders at its own pixel ratio (${t.dpr}x for ${t.selectedDevice.name}).` });
  };
  const scrollSim = () => {
    t.setSyncScroll(!t.syncScroll);
    toast({ title: "Scroll Simulation", description: !t.syncScroll ? "Multi view: scrolling one device now scrolls the others too. Turn it off to scroll each device on its own." : "Each device scrolls on its own." });
  };

  const GROUPS = [
    {
      title: "Responsive", items: [
        { icon: MonitorSmartphone, label: "Device Simulator", active: true, run: () => { t.closeDialog("tools"); setTimeout(() => t.openDialog("deviceManager"), 220); } },
        { icon: Crop, label: "Custom Viewport", active: false, run: () => t.openDialog("customDevice") },
        { icon: Layers, label: "Multi View", active: t.viewMode === "multi", run: () => t.setViewMode("multi") },
        { icon: LayoutGrid, label: "Breakpoint Tester", active: false, run: () => t.setInspectorTab("layout") },
        { icon: ZoomIn, label: "Zoom", active: false, run: () => t.zoomBy(10) },
        { icon: Gauge, label: "DPR Simulator", active: t.cdp.active, run: dprSim },
      ],
    },
    {
      title: "Inspection", items: [
        { icon: MousePointerClick, label: "Element Inspector", active: t.inspectMode, run: () => t.setInspectMode(!t.inspectMode) },
        { icon: Braces, label: "CSS Inspector", active: false, run: () => t.setInspectorTab("css") },
        { icon: Type, label: "Typography Inspector", active: false, run: () => t.setInspectorTab("css") },
        { icon: Move, label: "Spacing Inspector", active: false, run: () => t.setInspectorTab("layout") },
        { icon: Box, label: "Box Model", active: false, run: () => t.setInspectorTab("layout") },
        { icon: ListTree, label: "DOM Tree", active: false, run: () => t.setInspectorTab("elements") },
        { icon: Braces, label: "Computed Styles", active: false, run: () => t.setInspectorTab("css") },
      ],
    },
    {
      title: "Visual Tools", items: [
        { icon: Ruler, label: "Ruler", active: t.showRuler, run: () => t.setShowRuler(!t.showRuler) },
        { icon: LayoutGrid, label: "Grid Overlay", active: t.showGrid, run: () => t.setShowGrid(!t.showGrid) },
        { icon: Crosshair, label: "Guides", active: false, run: () => t.setShowGrid(true) },
        { icon: Pipette, label: "Color Picker", active: t.dialogs.colorPicker, run: () => t.openDialog("colorPicker") },
        { icon: Pipette, label: "Pixel Inspector", active: t.inspectMode, run: () => t.setInspectMode(!t.inspectMode) },
        { icon: Contrast, label: "Contrast Checker", active: false, run: () => t.setInspectorTab("a11y") },
        { icon: AlignLeft, label: "Alignment Guides", active: false, run: () => t.setShowGrid(true) },
      ],
    },
    {
      title: "Testing", items: [
        { icon: Hand, label: "Touch Simulation", active: t.sims.touch, run: () => t.toggleSim("touch") },
        { icon: Mouse, label: "Scroll Simulation", active: t.syncScroll, run: scrollSim },
        { icon: MousePointerClick, label: "Hover Simulation", active: t.sims.hover, run: () => t.toggleSim("hover") },
        { icon: MousePointerClick, label: "Focus Simulation", active: t.sims.focus, run: () => t.toggleSim("focus") },
        { icon: Keyboard, label: "Keyboard Navigation", active: t.sims.keyboard, run: () => t.toggleSim("keyboard") },
        { icon: Activity, label: "Reduced Motion", active: t.sims.reducedMotion, run: () => t.toggleSim("reducedMotion") },
        { icon: Moon, label: "Dark Mode Simulation", active: t.sims.darkMode, run: () => t.toggleSim("darkMode") },
        { icon: Globe, label: "Slow Network", active: t.networkPreset === "Slow 3G", run: () => { t.setInspectorTab("network"); t.setNetworkPreset("Slow 3G"); } },
      ],
    },
  ];

  return (
    <Dialog open={t.dialogs.tools} onOpenChange={(v) => !v && t.closeDialog("tools")}>
      <DialogContent className="max-w-3xl rounded-md bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Developer Tools</DialogTitle>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-1">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-1.5">{g.title.toUpperCase()}</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {g.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.run}
                    className={cn(
                      "flex items-center gap-2 h-9 px-2.5 rounded-md border text-xs transition-colors",
                      item.active
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}