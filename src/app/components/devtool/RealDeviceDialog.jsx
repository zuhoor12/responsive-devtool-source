import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Smartphone, TriangleAlert } from "lucide-react";
import { useDevTool } from "@/lib/DevToolContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isLocalAddress, looksLikeNetworkHost, withNetworkHost } from "@/lib/realDevice";

// Shows a QR code for the page in the preview, so the same page can be opened on a real phone.
export default function RealDeviceDialog() {
  const t = useDevTool();
  const { toast } = useToast();
  const open = !!t.dialogs.realDevice;
  const base = t.currentUrl || t.activeUrl || "";
  const local = isLocalAddress(base);
  const [host, setHost] = useState("");
  const [qr, setQr] = useState("");
  const target = local && looksLikeNetworkHost(host) ? withNetworkHost(base, host) : base;

  useEffect(() => { if (open) setHost(""); }, [open]);

  useEffect(() => {
    if (!open || !target) { setQr(""); return undefined; }
    let dead = false;
    QRCode.toDataURL(target, { margin: 1, width: 240, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } })
      .then((url) => { if (!dead) setQr(url); })
      .catch(() => { if (!dead) setQr(""); });
    return () => { dead = true; };
  }, [open, target]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(target); toast({ title: "Copied", description: target }); }
    catch { toast({ title: "Could not copy", description: target, variant: "destructive" }); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && t.closeDialog("realDevice")}>
      <DialogContent className="max-w-[360px] rounded-xl border-border bg-card p-5">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold"><Smartphone className="h-4 w-4 text-primary" /> Test on a real phone</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Scan the code with your phone's camera. The phone opens the page itself, at its real size and with its real touch behaviour.
          </DialogDescription>
        </DialogHeader>

        {!base ? (
          <p className="mt-4 text-xs text-muted-foreground">Load a page first. The QR code shows the page that is loaded.</p>
        ) : (
          <>
            {local && (
              <div className="mt-3 rounded-md border border-warning/40 bg-warning/10 p-2.5 text-[11px] leading-relaxed">
                <div className="mb-1 flex items-center gap-1.5 font-medium"><TriangleAlert className="h-3.5 w-3.5" /> This is a local address</div>
                Your phone cannot reach <span className="font-mono">localhost</span> on this computer. Enter this computer's address on your network (for example <span className="font-mono">192.168.1.20:5173</span>). Your phone and computer must be on the same Wi-Fi, and the dev server must listen on the network.
                <input
                  value={host} onChange={(e) => setHost(e.target.value)} spellCheck={false} placeholder="192.168.1.20:5173" aria-label="Network address of this computer"
                  className="mt-2 h-8 w-full rounded-md border border-border bg-background px-2.5 font-mono text-xs outline-none focus:border-primary/60"
                />
              </div>
            )}

            <div className="mt-4 flex justify-center">
              {qr ? (
                <img src={qr} alt={`QR code for ${target}`} width={240} height={240} className="rounded-md bg-white p-2" />
              ) : (
                <div className="flex h-[256px] w-[256px] items-center justify-center text-xs text-muted-foreground">
                  {local && !looksLikeNetworkHost(host) ? "Enter the network address above" : "Creating code…"}
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-2.5 py-2">
              <span className="min-w-0 flex-1 truncate font-mono text-[11px]" title={target}>{target}</span>
              <button type="button" onClick={copy} aria-label="Copy address" className="shrink-0 rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
