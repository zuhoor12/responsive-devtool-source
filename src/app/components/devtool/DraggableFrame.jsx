import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Wraps a device frame so it can be dragged freely around the workspace.
// Double-click re-centers it. Position is clamped so the frame always stays
// inside the visible workspace area.
export default function DraggableFrame({ workspaceRef, storageKey, layoutKey, index = 0, count = 1, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null); // null => auto-center on next layout
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);

  // Re-center when the device or the layout inputs that affect its fit change.
  useLayoutEffect(() => {
    setPos(null);
  }, [storageKey, layoutKey]);

  // The available workspace can change when panels are toggled or the window resizes.
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace || typeof ResizeObserver === "undefined") return undefined;
    const frame = ref.current;

    let workspaceSize = [workspace.clientWidth, workspace.clientHeight];
    let frameSize = frame ? [frame.offsetWidth, frame.offsetHeight] : null;
    const observer = new ResizeObserver(() => {
      const nextWorkspaceSize = [workspace.clientWidth, workspace.clientHeight];
      const nextFrameSize = frame ? [frame.offsetWidth, frame.offsetHeight] : null;
      const workspaceChanged = nextWorkspaceSize.some((value, i) => value !== workspaceSize[i]);
      const frameChanged = nextFrameSize?.some((value, i) => value !== frameSize?.[i]) ?? false;
      if (!workspaceChanged && !frameChanged) return;
      workspaceSize = nextWorkspaceSize;
      frameSize = nextFrameSize;
      setPos(null);
    });
    observer.observe(workspace);
    if (frame) observer.observe(frame);
    return () => observer.disconnect();
  }, [workspaceRef]);

  const clamp = useCallback(
    (x, y) => {
      const ws = workspaceRef.current;
      const el = ref.current;
      if (!ws || !el) return { x, y };
      // keep at least 80px of the frame visible on each axis, so even frames
      // larger than the workspace can still be moved around freely
      const minX = Math.min(80 - el.offsetWidth, (ws.clientWidth - el.offsetWidth) / 2);
      const minY = Math.min(80 - el.offsetHeight, (ws.clientHeight - el.offsetHeight) / 2);
      const maxX = Math.max(ws.clientWidth - 80, minX);
      const maxY = Math.max(ws.clientHeight - 80, minY);
      return { x: Math.min(Math.max(x, minX), maxX), y: Math.min(Math.max(y, minY), maxY) };
    },
    [workspaceRef]
  );

  // Compute the initial centered position (multi-view spreads cards side by side)
  useLayoutEffect(() => {
    if (pos !== null) return;
    const ws = workspaceRef.current;
    const el = ref.current;
    if (!ws || !el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const spread = (index - (count - 1) / 2) * (w + 48);
    setPos(clamp((ws.clientWidth - w) / 2 + spread, (ws.clientHeight - h) / 2));
  });

  const onPointerDown = (e) => {
    if (e.target.closest("button, a, input")) return; // keep controls clickable
    if (pos === null) return;
    drag.current = { startX: e.clientX, startY: e.clientY, x: pos.x, y: pos.y, id: e.pointerId };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    setPos(clamp(d.x + (e.clientX - d.startX), d.y + (e.clientY - d.startY)));
  };

  const endDrag = (e) => {
    if (drag.current && drag.current.id === e.pointerId) {
      drag.current = null;
      setDragging(false);
    }
  };

  return (
    <div
      ref={ref}
      className="absolute select-none z-10"
      style={{ left: pos?.x, top: pos?.y, cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => setPos(null)}
      title="Drag to move — double-click to recenter"
    >
      {children}
    </div>
  );
}