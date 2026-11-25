import { useDevTool } from "@/lib/DevToolContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SHORTCUTS } from "@/lib/devtoolMock";
import { cn } from "@/lib/utils";

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between h-9">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

const ACCENTS = ["#58A6FF", "#22D3EE", "#A78BFA", "#3FB950"];

export default function SettingsDialog() {
  const t = useDevTool();
  const { accent, compact, scale, experimental, performanceMode, debug } = t.prefs;
  const setAccent = (v) => t.setPref("accent", v);
  const setCompact = (v) => t.setPref("compact", v);
  const setScale = (v) => t.setPref("scale", v);
  const setExperimental = (v) => t.setPref("experimental", v);
  const setPerformanceMode = (v) => t.setPref("performanceMode", v);
  const setDebug = (v) => t.setPref("debug", v);

  return (
    <Dialog open={t.dialogs.settings} onOpenChange={(v) => !v && t.closeDialog("settings")}>
      <DialogContent className="max-w-2xl rounded-md bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5 mt-1">
          <div>
            <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-1">APPEARANCE</h4>
            <Row label="Theme">
              <Select value={t.theme} onValueChange={t.setTheme}>
                <SelectTrigger className="w-[130px] h-8 bg-background border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Accent Color">
              <div className="flex gap-1.5">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    className={cn("w-5 h-5 rounded-full border-2", accent === c ? "border-foreground" : "border-transparent")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Row>
            <Row label="Compact Mode">
              <Switch checked={compact} onCheckedChange={setCompact} />
            </Row>
            <Row label="Interface Scale">
              <Select value={scale} onValueChange={setScale}>
                <SelectTrigger className="w-[130px] h-8 bg-background border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="90%">90%</SelectItem>
                  <SelectItem value="100%">100%</SelectItem>
                  <SelectItem value="110%">110%</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-1">PREVIEW</h4>
            <Row label="Default Zoom">
              <Select value={`${t.zoom}`} onValueChange={(v) => t.setZoom(parseInt(v))}>
                <SelectTrigger className="w-[130px] h-8 bg-background border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                  <SelectItem value="125">125%</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Default Device">
              <Select value={t.selectedId} onValueChange={(id) => t.selectDevice(id)}>
                <SelectTrigger className="w-[130px] h-8 bg-background border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {t.devices.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Show Device Frame">
              <Switch checked={t.showFrame} onCheckedChange={t.setShowFrame} />
            </Row>
            <Row label="Show Grid">
              <Switch checked={t.showGrid} onCheckedChange={t.setShowGrid} />
            </Row>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-1">DEVELOPER</h4>
            <Row label="Enable Experimental Features">
              <Switch checked={experimental} onCheckedChange={setExperimental} />
            </Row>
            <Row label="Performance Mode">
              <Switch checked={performanceMode} onCheckedChange={setPerformanceMode} />
            </Row>
            <Row label="Debug Mode">
              <Switch checked={debug} onCheckedChange={setDebug} />
            </Row>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-1">SHORTCUTS</h4>
            {SHORTCUTS.map((s) => (
              <div key={s.keys} className="flex items-center justify-between h-8">
                <span className="text-xs text-muted-foreground">{s.action}</span>
                <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
                  {s.keys}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>Made by <span className="text-foreground">zuhoor12</span></span>
          <a href="https://github.com/zuhoor12" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Source code on GitHub
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}