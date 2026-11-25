import { useState, useEffect } from "react";
import { useDevTool } from "@/lib/DevToolContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function CustomDeviceDialog({ open, onOpenChange, editDevice = null }) {
  const t = useDevTool();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", category: "mobile", width: 390, height: 844, dpr: 2,
    orientation: "portrait", frame: true, ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(editDevice
      ? {
          name: editDevice.name, category: editDevice.category, width: editDevice.width,
          height: editDevice.height, dpr: editDevice.dpr,
          orientation: editDevice.orientation || "portrait",
          frame: t.showFrame, ua: editDevice.ua || "",
        }
      : { name: "", category: "mobile", width: 390, height: 844, dpr: 2, orientation: "portrait", frame: true, ua: "" });
  }, [open, editDevice, t.showFrame]);

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return setError("Device name is required");
    const width = Number(form.width);
    const height = Number(form.height);
    const dpr = Number(form.dpr);
    if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1) {
      return setError("Width and height must be positive whole numbers");
    }
    if (!Number.isFinite(dpr) || dpr <= 0) return setError("DPR must be greater than zero");
    const data = {
      name: form.name.trim(), category: form.category, width, height, dpr,
      orientation: form.orientation, ua: form.ua,
    };
    if (editDevice) {
      t.updateDevice(editDevice.id, data);
      toast({ title: "Device updated", description: data.name });
    } else {
      t.addDevice({ ...data, section: "Custom" });
      toast({ title: "Device created", description: `${data.name} · ${data.width}×${data.height}` });
    }
    t.setShowFrame(form.frame);
    onOpenChange(false);
  };

  const field = (key, type = "text", id = key, min, step) => {
    const invalid =
      (key === "name" && error === "Device name is required") ||
      (["width", "height"].includes(key) && error.startsWith("Width and height")) ||
      (key === "dpr" && error.startsWith("DPR"));
    return (
      <Input
        id={id}
        type={type}
        value={form[key]}
        min={min}
        step={step}
        required={["name", "width", "height", "dpr"].includes(key)}
        aria-invalid={invalid}
        aria-describedby={invalid ? "custom-device-error" : undefined}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="h-8 bg-background border-border text-xs font-mono"
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {editDevice ? "Edit Custom Device" : "Create Custom Device"}
          </DialogTitle>
        </DialogHeader>

        <form noValidate onSubmit={submit} className="grid grid-cols-2 gap-3 mt-1">
          <div className="col-span-2">
            <Label htmlFor="custom-device-name" className="text-[11px] text-muted-foreground">Device Name *</Label>
            {field("name", "text", "custom-device-name")}
          </div>
          <div>
            <Label htmlFor="custom-device-category" className="text-[11px] text-muted-foreground">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger id="custom-device-category" className="h-8 bg-background border-border text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="custom-device-orientation" className="text-[11px] text-muted-foreground">Orientation</Label>
            <Select value={form.orientation} onValueChange={(v) => setForm((f) => ({ ...f, orientation: v }))}>
              <SelectTrigger id="custom-device-orientation" className="h-8 bg-background border-border text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="custom-device-width" className="text-[11px] text-muted-foreground">Width (px)</Label>
            {field("width", "number", "custom-device-width", 1, 1)}
          </div>
          <div>
            <Label htmlFor="custom-device-height" className="text-[11px] text-muted-foreground">Height (px)</Label>
            {field("height", "number", "custom-device-height", 1, 1)}
          </div>
          <div>
            <Label htmlFor="custom-device-dpr" className="text-[11px] text-muted-foreground">DPR</Label>
            {field("dpr", "number", "custom-device-dpr", 0.1, 0.1)}
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2 pb-1.5">
              <Switch checked={form.frame} onCheckedChange={(v) => setForm((f) => ({ ...f, frame: v }))} />
              <span className="text-[11px] text-muted-foreground">Device Frame</span>
            </div>
          </div>
          <div className="col-span-2">
            <Label htmlFor="custom-device-ua" className="text-[11px] text-muted-foreground">User Agent</Label>
            {field("ua", "text", "custom-device-ua")}
          </div>
          {error && <p id="custom-device-error" role="alert" className="col-span-2 text-[11px] text-destructive">{error}</p>}

          <div className="col-span-2 flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="h-8 text-xs">
              {editDevice ? "Save Changes" : "Create Device"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}