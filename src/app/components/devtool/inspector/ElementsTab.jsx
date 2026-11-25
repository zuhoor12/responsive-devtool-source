import { useCallback, useEffect, useState } from "react";
import rdt from "@core/index.js";
import { useDevTool } from "@/lib/DevToolContext";
import { fmtBox, fmtFont, fmtSize, rgbToHex, useActiveElement } from "@/lib/inspect";
import { DOM_TREE, ELEMENT_DETAILS } from "@/lib/devtoolMock";
import Section from "./Section";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function TreeNode({ node, depth, selected, onSelect }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length;
  const isSelected = selected === node.tag;
  return (
    <div>
      <div
        onClick={() => onSelect(node.tag)}
        className={cn(
          "flex items-center gap-1 h-6 pr-1 cursor-pointer rounded-sm text-[11px] font-mono hover:bg-secondary",
          isSelected && "bg-primary/15 text-primary",
          !isSelected && "text-foreground/80"
        )}
        style={{ paddingLeft: depth * 12 + 2 }}
      >
        {hasChildren ? (
          <span onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} className="text-muted-foreground">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        ) : (
          <span className="w-3" />
        )}
        <span className="text-info">&lt;{node.tag}&gt;</span>
        {node.attrs && <span className="text-warning/80 truncate">{node.attrs}</span>}
      </div>
      {open && hasChildren && node.children.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

function ElementsDemo() {
  const [selected, setSelected] = useState("body");
  const details = ELEMENT_DETAILS[selected] || ELEMENT_DETAILS.body;
  return (
    <div>
      <Section title="DOM">
        <div className="rounded-md border border-border bg-secondary/40 p-1">
          <TreeNode node={DOM_TREE} depth={0} selected={selected} onSelect={setSelected} />
        </div>
      </Section>

      <Section title={`SELECTED — ${details.element}`}>
        <div className="rounded-md border border-border bg-secondary/40 px-2.5 py-1 font-mono text-[11px] space-y-1">
          {[
            ["Element", details.element], ["Classes", details.classes], ["Dimensions", details.dimensions],
            ["Margin", details.margin], ["Padding", details.padding], ["Display", details.display],
            ["Position", details.position], ["Color", details.color], ["Font", details.font],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span className="text-muted-foreground shrink-0">{k}</span>
              <span className="text-info truncate">{v}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ---------------------------------------------------------------- live page */
const keyOf = (p) => (p || []).join(".");
const attrsOf = (n) => `${n.id ? ` id="${n.id}"` : ""}${n.c && n.c.length ? ` class="${n.c.join(" ")}"` : ""}`.trim();

function LiveNode({ node, depth, deviceId, selectedKey }) {
  const [open, setOpen] = useState(depth < 2);
  const [kids, setKids] = useState(null);
  const hasChildren = node.n > 0;

  const load = useCallback(async () => {
    const r = await rdt.agent.children(deviceId, node.p);
    if (r) setKids(r);
  }, [deviceId, node.p]);

  useEffect(() => { if (open && hasChildren && kids === null) load(); }, [open, hasChildren, kids, load]);

  const isSelected = selectedKey === keyOf(node.p);
  const attrs = attrsOf(node);
  return (
    <div>
      <div
        onClick={() => rdt.agent.select(deviceId, node.p)}
        onMouseEnter={() => rdt.agent.highlight(deviceId, node.p)}
        onMouseLeave={() => rdt.agent.unhighlight(deviceId)}
        className={cn(
          "flex items-center gap-1 h-6 pr-1 cursor-pointer rounded-sm text-[11px] font-mono hover:bg-secondary",
          isSelected && "bg-primary/15 text-primary",
          !isSelected && "text-foreground/80"
        )}
        style={{ paddingLeft: depth * 12 + 2 }}
      >
        {hasChildren ? (
          <span onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} className="text-muted-foreground">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        ) : (
          <span className="w-3" />
        )}
        <span className="text-info">&lt;{node.t}&gt;</span>
        {attrs && <span className="text-warning/80 truncate">{attrs}</span>}
        {!hasChildren && node.txt && <span className="text-muted-foreground truncate">{node.txt}</span>}
      </div>
      {open && kids && kids.map((c) => (
        <LiveNode key={keyOf(c.p)} node={c} depth={depth + 1} deviceId={deviceId} selectedKey={selectedKey} />
      ))}
    </div>
  );
}

function ElementsLive() {
  const t = useDevTool();
  const id = t.activeDeviceId;
  const el = useActiveElement();
  const [root, setRoot] = useState(undefined); // undefined = loading, null = not available

  useEffect(() => {
    let dead = false;
    setRoot(undefined);
    (async () => {
      const kids = await rdt.agent.children(id, []);
      if (dead) return;
      const body = kids && kids.find((k) => k.t === "body");
      setRoot(body || null);
    })();
    return () => { dead = true; };
  }, [id, t.activeUrl, t.reloadKey, t.domTick]);

  const selectedKey = t.selectedEl && t.selectedEl.deviceId === id ? keyOf(t.selectedEl.element.p) : keyOf(root && root.p);
  const rows = el ? [
    ["Element", el.label], ["Classes", el.classes.length ? el.classes.join(" ") : "—"], ["Dimensions", fmtSize(el.size)],
    ["Margin", fmtBox(el.box.margin)], ["Padding", fmtBox(el.box.padding)], ["Display", el.display],
    ["Position", el.position], ["Color", rgbToHex(el.color)], ["Font", fmtFont(el.fontParts)],
  ] : [];

  return (
    <div>
      <Section title="DOM">
        <div className="rounded-md border border-border bg-secondary/40 p-1 max-h-[300px] overflow-auto">
          {root ? (
            <LiveNode key={`${id}-${t.reloadKey}-${t.domTick}`} node={root} depth={0} deviceId={id} selectedKey={selectedKey} />
          ) : (
            <div className="text-[11px] text-muted-foreground px-2 py-3">{root === undefined ? "Reading the page…" : "The page isn’t ready yet — wait for it to finish loading."}</div>
          )}
        </div>
      </Section>

      <Section title={`SELECTED — ${el ? el.label : "…"}`}>
        <div className="rounded-md border border-border bg-secondary/40 px-2.5 py-1 font-mono text-[11px] space-y-1">
          {rows.length ? rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span className="text-muted-foreground shrink-0">{k}</span>
              <span className="text-info truncate" title={String(v)}>{v}</span>
            </div>
          )) : <div className="text-muted-foreground py-1">Nothing selected</div>}
        </div>
      </Section>
    </div>
  );
}

export default function ElementsTab() {
  const t = useDevTool();
  return t.activeUrl ? <ElementsLive /> : <ElementsDemo />;
}
