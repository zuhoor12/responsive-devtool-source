import { useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DeviceIcon from "@/components/devtool/DeviceIcon";
import { Search, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Mobile", "Tablet", "Desktop", "Custom"];

function DeviceRow({ device }) {
  const t = useDevTool();
  const selected = t.selectedId === device.id;
  const fav = t.favorites.includes(device.id);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => t.selectDevice(device.id)}
      onKeyDown={(e) => e.key === "Enter" && t.selectDevice(device.id)}
      className={cn(
        "group w-full flex items-center gap-2 px-2 h-9 rounded-md border cursor-pointer transition-colors",
        selected ? "bg-primary/10 border-primary/40" : "border-transparent hover:bg-secondary"
      )}
    >
      <DeviceIcon category={device.category} className={cn("w-3.5 h-3.5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-xs truncate", selected ? "text-foreground" : "text-foreground/80")}>
        {device.name}
      </span>
      {device.custom && <span className="text-[9px] font-mono text-info shrink-0">custom</span>}
      <span className="ml-auto text-[10px] font-mono text-muted-foreground shrink-0">{device.width}×{device.height}</span>
      <span className="text-[9px] font-mono text-muted-foreground/60 shrink-0">@{device.dpr}x</span>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); t.toggleFavorite(device.id); }}
        title={fav ? "Remove from favorites" : "Add to favorites"}
        className={cn("shrink-0 p-0.5", fav ? "text-warning" : "text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-warning")}
      >
        <Star className={cn("w-3 h-3", fav && "fill-current")} />
      </span>
    </div>
  );
}

function Section({ title, items }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-widest text-muted-foreground/70 px-2 mb-1">{title.toUpperCase()}</div>
      <div className="space-y-0.5">{items.map((d) => <DeviceRow key={d.id} device={d} />)}</div>
    </div>
  );
}

export default function DeviceLibrary() {
  const t = useDevTool();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const q = query.trim().toLowerCase();
  const visible = t.devices.filter((d) => {
    const matchesQuery = !q || d.name.toLowerCase().includes(q);
    const matchesFilter =
      filter === "All" ||
      (filter === "Custom" ? d.custom : d.category === filter.toLowerCase());
    return matchesQuery && matchesFilter;
  });

  const sections = filter === "All"
    ? [
        { title: "Favorites", items: visible.filter((d) => t.favorites.includes(d.id)) },
        { title: "Apple", items: visible.filter((d) => d.section === "Apple" && !d.custom) },
        { title: "Android", items: visible.filter((d) => d.section === "Android") },
        { title: "Desktop", items: visible.filter((d) => d.section === "Desktop" && !d.custom) },
        { title: "Custom", items: visible.filter((d) => d.custom) },
      ]
    : [{ title: filter, items: visible }];

  return (
    <aside className="hidden md:flex w-[280px] shrink-0 flex-col border-r bg-card">
      <div className="h-10 px-3 flex items-center justify-between border-b">
        <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">DEVICES</span>
        <span className="text-[10px] font-mono text-muted-foreground/60">{visible.length}</span>
      </div>

      <div className="p-2 border-b space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search devices..."
            className="h-8 pl-8 text-xs bg-background border-border"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2 h-6 rounded text-[10px] border transition-colors",
                filter === f
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {sections.map((s) => <Section key={s.title} title={s.title} items={s.items} />)}
        {!visible.length && (
          <div className="text-center text-[11px] text-muted-foreground py-8">No devices match your search</div>
        )}
      </div>

      <div className="p-2 border-t space-y-1.5">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs justify-center gap-1.5 border-dashed"
          onClick={() => t.openDialog("customDevice")}
        >
          <Plus className="w-3.5 h-3.5" /> Add Custom Device
        </Button>
      </div>
    </aside>
  );
}