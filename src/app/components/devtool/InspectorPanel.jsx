import { useDevTool } from "@/lib/DevToolContext";
import OverviewTab from "./inspector/OverviewTab";
import ElementsTab from "./inspector/ElementsTab";
import CssTab from "./inspector/CssTab";
import LayoutTab from "./inspector/LayoutTab";
import NetworkTab from "./inspector/NetworkTab";
import AccessibilityTab from "./inspector/AccessibilityTab";
import { X } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", component: OverviewTab },
  { id: "elements", label: "Elements", component: ElementsTab },
  { id: "css", label: "CSS", component: CssTab },
  { id: "layout", label: "Layout", component: LayoutTab },
  { id: "network", label: "Network", component: NetworkTab },
  { id: "a11y", label: "Accessibility", component: AccessibilityTab },
];

export default function InspectorPanel({ onClose }) {
  const t = useDevTool();
  const Active = TABS.find((tab) => tab.id === t.inspectorTab)?.component || OverviewTab;
  return (
    <aside className="w-[300px] shrink-0 h-full border-l bg-card flex flex-col">
      <div className="h-10 px-3 flex items-center justify-between border-b shrink-0">
        <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">INSPECTOR</span>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex border-b overflow-x-auto shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => t.setInspectorTab(tab.id)}
            className={
              "px-2.5 h-8 text-[11px] whitespace-nowrap border-b-2 transition-colors " +
              (t.inspectorTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <Active />
      </div>
    </aside>
  );
}