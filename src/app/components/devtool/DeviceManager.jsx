import { useState } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import DeviceIcon from "@/components/devtool/DeviceIcon";
import CustomDeviceDialog from "@/components/devtool/CustomDeviceDialog";
import { Search, Star, Copy, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "My Devices" },
  { id: "favorites", label: "Favorites" },
  { id: "builtin", label: "Built-in" },
  { id: "custom", label: "Custom" },
];

export default function DeviceManager() {
  const t = useDevTool();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("name");
  const [editing, setEditing] = useState(null);

  const q = query.trim().toLowerCase();
  let list = t.devices.filter((d) => {
    const matchesTab =
      tab === "all" ||
      (tab === "favorites" && t.favorites.includes(d.id)) ||
      (tab === "builtin" && !d.custom) ||
      (tab === "custom" && d.custom);
    return matchesTab && (!q || d.name.toLowerCase().includes(q));
  });
  list = [...list].sort((a, b) =>
    sort === "name" ? a.name.localeCompare(b.name) : a.width - b.width
  );

  const act = (icon, label, onClick, extraClass) => (
    <button
      title={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn("p-1 rounded text-muted-foreground/60 hover:bg-secondary transition-colors", extraClass)}
    >
      {icon}
    </button>
  );

  return (
    <>
      <Dialog open={t.dialogs.deviceManager} onOpenChange={(v) => !v && t.closeDialog("deviceManager")}>
        <DialogContent className="max-w-3xl rounded-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Device Manager</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search devices..." className="h-8 pl-8 text-xs bg-background border-border" />
            </div>
            <div className="flex rounded border border-border overflow-hidden">
              {TABS.map((x) => (
                <button
                  key={x.id}
                  onClick={() => setTab(x.id)}
                  className={cn("px-2.5 h-8 text-[11px]", tab === x.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}
                >
                  {x.label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-8 rounded border border-border bg-background text-[11px] px-2 text-muted-foreground outline-none"
            >
              <option value="name">Sort: Name</option>
              <option value="width">Sort: Width</option>
            </select>
          </div>

          <div className="border border-border rounded-md overflow-hidden max-h-[50vh] overflow-y-auto mt-1">
            {list.map((d, i) => (
              <div key={d.id} className={cn("flex items-center gap-3 px-3 h-10", i % 2 === 0 ? "bg-secondary/40" : "")}>
                <DeviceIcon category={d.category} className={cn("w-4 h-4", t.selectedId === d.id ? "text-primary" : "text-muted-foreground")} />
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button onClick={() => t.selectDevice(d.id)} className="text-xs truncate hover:text-primary">
                    {d.name}
                  </button>
                  {d.custom && <span className="text-[9px] font-mono text-info">custom</span>}
                  {t.selectedId === d.id && <span className="text-[9px] font-mono text-primary">selected</span>}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-24 text-right hidden sm:block">
                  {d.width}×{d.height} @{d.dpr}x
                </span>
                {act(<Star className={cn("w-3.5 h-3.5", t.favorites.includes(d.id) && "fill-current")} />, t.favorites.includes(d.id) ? "Unfavorite" : "Favorite", () => t.toggleFavorite(d.id), t.favorites.includes(d.id) && "text-warning")}
                {act(<Copy className="w-3.5 h-3.5" />, "Duplicate", () => { t.duplicateDevice(d.id); toast({ title: "Device duplicated" }); })}
                {d.custom && act(<Pencil className="w-3.5 h-3.5" />, "Edit", () => setEditing(d))}
                {d.custom && act(<Trash2 className="w-3.5 h-3.5" />, "Delete", () => { t.deleteDevice(d.id); toast({ title: "Device deleted", description: d.name }); }, "hover:text-destructive")}
              </div>
            ))}
            {!list.length && <div className="text-xs text-muted-foreground text-center py-8">No devices found</div>}
          </div>
        </DialogContent>
      </Dialog>

      <CustomDeviceDialog
        open={!!editing}
        editDevice={editing}
        onOpenChange={(v) => !v && setEditing(null)}
      />
    </>
  );
}