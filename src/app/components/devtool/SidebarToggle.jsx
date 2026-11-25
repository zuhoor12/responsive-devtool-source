import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Slim edge button that collapses / expands the side panels, so the preview
// workspace can use the full width when needed.
export default function SidebarToggle({ side, open, onToggle }) {
  const isLeft = side === "left";
  const Icon = open
    ? isLeft
      ? ChevronLeft
      : ChevronRight
    : isLeft
      ? ChevronRight
      : ChevronLeft;
  return (
    <button
      onClick={onToggle}
      title={open ? `Collapse ${isLeft ? "device library" : "inspector"}` : `Show ${isLeft ? "device library" : "inspector"}`}
      className={cn(
        "shrink-0 w-5 border-border bg-card hover:bg-accent transition-colors",
        isLeft ? "border-r" : "border-l",
        isLeft ? "flex" : "hidden xl:flex",
        "flex-col items-center justify-center py-2"
      )}
    >
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
  );
}