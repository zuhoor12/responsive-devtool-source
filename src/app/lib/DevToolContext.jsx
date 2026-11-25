import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import rdt from "@core/index.js";
import { DEVICES, DEFAULT_MULTI_IDS, getUserAgent } from "@/lib/devices";
import { parseShareParams } from "@/lib/shareLink";
import { getSaved, save } from "@/lib/persist";
import { useToast } from "@/components/ui/use-toast";

const DevToolContext = createContext(null);

export function useDevTool() {
  const ctx = useContext(DevToolContext);
  if (!ctx) throw new Error("useDevTool must be used inside DevToolProvider");
  return ctx;
}

/** Throttling values behind each network preset (null = no throttling). Mbps / ms / %. */
export const NETWORK_CFG = {
  Online: null,
  "Fast 3G": { down: 1.6, up: 0.75, latency: 150, loss: 0 },
  "Slow 3G": { down: 0.4, up: 0.4, latency: 400, loss: 2 },
  "4G": { down: 20, up: 10, latency: 50, loss: 0 },
  Offline: { offline: true, down: 0, up: 0, latency: 0, loss: 0 },
  Custom: { down: 8, up: 4, latency: 100, loss: 1 },
};

// Values really applied for a preset. "Custom" uses the user's own numbers (customNet). 0 = unlimited.
export const DEFAULT_CUSTOM_NET = { down: 8, up: 4, latency: 100, loss: 1 };
export const netCfgFor = (name, custom) => (name === "Custom" ? custom : NETWORK_CFG[name] || null);

export const DEFAULT_PREFS = {
  accent: "#58A6FF", compact: false, scale: "100%",
  experimental: false, performanceMode: true, debug: false,
};
export const DEFAULT_SHOT = { scope: "viewport", format: "PNG", quality: 80, scale: "native" };

function getDeviceSize(device, orientation = device?.orientation) {
  if (orientation === "landscape") {
    return { width: device.height, height: device.width };
  }
  return { width: device?.width ?? 393, height: device?.height ?? 852 };
}

export function DevToolProvider({ children }) {
  const { toast } = useToast();
  const saved = getSaved();
  const share = parseShareParams();

  const [devices, setDevices] = useState(() => [...DEVICES, ...(Array.isArray(saved.customDevices) ? saved.customDevices : [])]);
  const allInitial = [...DEVICES, ...(Array.isArray(saved.customDevices) ? saved.customDevices : [])];
  const initialId = (() => {
    const pick = share.device || saved.selectedId;
    return pick && allInitial.some((d) => d.id === pick) ? pick : "iphone-15-pro";
  })();
  const initialDevice = allInitial.find((d) => d.id === initialId);
  const initialOrientation =
    share.orientation === "landscape" || (!share.orientation && initialDevice?.orientation === "landscape")
      ? "landscape"
      : "portrait";

  const [selectedId, setSelectedId] = useState(initialId);
  const [favorites, setFavorites] = useState(saved.favorites || ["iphone-18-pro-max", "galaxy-s26-ultra", "pixel-10-pro", "iphone-15-pro", "galaxy-s24", "ipad-pro", "macbook-air"]);
  const [size, setSize] = useState({
    width: share.w ?? getDeviceSize(initialDevice, initialOrientation).width,
    height: share.h ?? getDeviceSize(initialDevice, initialOrientation).height,
  });
  const [orientation, setOrientation] = useState(initialOrientation);
  const [zoom, setZoom] = useState(share.zoom ?? 100);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [viewMode, setViewMode] = useState(saved.viewMode === "multi" ? "multi" : "single");
  const [multiDeviceIds, setMultiDeviceIds] = useState(saved.multiDeviceIds || DEFAULT_MULTI_IDS);
  const [inspectorTab, setInspectorTab] = useState(saved.inspectorTab || "overview");
  const [networkPreset, setNetworkPresetState] = useState("Online");
  const [sims, setSims] = useState({ touch: true, hover: true, keyboard: true, ...(saved.sims || {}), focus: false, reducedMotion: false, darkMode: false });
  const [showFrame, setShowFrame] = useState(saved.showFrame ?? true);
  const [dialogs, setDialogs] = useState({ palette: false, settings: false, screenshot: false, customDevice: false, deviceManager: false, tools: false, colorPicker: false });
  const [leftPanelOpen, setLeftPanelOpen] = useState(saved.leftPanelOpen ?? true);
  const [rightPanelOpen, setRightPanelOpen] = useState(saved.rightPanelOpen ?? true);
  const workspaceRef = useRef(null);
  const [theme, setTheme] = useState(share.theme === "light" ? "light" : share.theme === "dark" ? "dark" : saved.theme === "light" ? "light" : "dark");
  const [prefs, setPrefs] = useState({ ...DEFAULT_PREFS, ...(saved.prefs || {}) });
  // settings saved before version 2 had scale "1x" as the default: those are replaced by the new default
  const [shot, setShot] = useState({ ...DEFAULT_SHOT, ...(saved.shotVersion === 2 ? saved.shot || {} : {}) });
  const [syncScroll, setSyncScroll] = useState(saved.syncScrollVersion === 2 ? !!saved.syncScroll : false);
  const [customNet, setCustomNetState] = useState({ ...DEFAULT_CUSTOM_NET, ...(saved.customNet || {}) });
  const setCustomNet = useCallback((patch) => setCustomNetState((c) => ({ ...c, ...patch })), []);

  // ---- page loading -------------------------------------------------------
  // Opened from the toolbar button on an http(s) tab -> that URL (?url=); otherwise the last used URL.
  const [activeUrl, setActiveUrl] = useState(share.url || saved.activeUrl || "");
  const [currentUrl, setCurrentUrl] = useState(share.url || saved.activeUrl || "");
  const [reloadKey, setReloadKey] = useState(0);

  // ---- live data coming from the extension core ----------------------------
  const [frameInfo, setFrameInfo] = useState({});
  const [docStatus, setDocStatus] = useState({});
  const [selectedEl, setSelectedEl] = useState(null); // { deviceId, element }
  const [focusId, setFocusId] = useState(null);
  const [netTick, setNetTick] = useState(0);
  const [domTick, setDomTick] = useState(0);
  const [cdp, setCdp] = useState({ supported: rdt.env.cdpSupported, active: false, busy: false });
  const [bgConnected, setBgConnected] = useState(!rdt.env.extension);
  // colour sampling: hover shows the colour under the pointer (colorSample); a click picks it (pickedColor)
  const [colorSampling, setColorSamplingState] = useState(false);
  const [colorSample, setColorSample] = useState(null);
  const [pickedColor, setPickedColor] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const selectedDevice = useMemo(() => devices.find((d) => d.id === selectedId) || devices[0], [devices, selectedId]);

  const visibleDevices = useMemo(() => {
    if (viewMode === "single") return [selectedDevice];
    return multiDeviceIds.map((id) => devices.find((d) => d.id === id)).filter(Boolean);
  }, [viewMode, selectedDevice, multiDeviceIds, devices]);

  const activeDeviceId = useMemo(() => {
    if (viewMode !== "multi") return selectedId;
    return visibleDevices.some((d) => d.id === focusId) ? focusId : (visibleDevices[0] ? visibleDevices[0].id : selectedId);
  }, [viewMode, selectedId, focusId, visibleDevices]);

  // Always-fresh view of state for event handlers that live outside React's render cycle.
  const latest = useRef({});
  latest.current = { sims, prefs, devices, viewMode, syncScroll, activeDeviceId, cdp, activeUrl, inspectMode };

  const openDialog = useCallback((k) => setDialogs((d) => ({ ...d, [k]: true })), []);
  const closeDialog = useCallback((k) => setDialogs((d) => ({ ...d, [k]: false })), []);

  const selectDevice = useCallback((id) => {
    setSelectedId(id);
    const d = devices.find((x) => x.id === id);
    if (d) setSize(getDeviceSize(d));
    setOrientation(d?.orientation === "landscape" ? "landscape" : "portrait");
  }, [devices]);

  const toggleFavorite = useCallback((id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])), []);

  const addDevice = useCallback((dev) => {
    const id = `custom-${Date.now()}`;
    setDevices((ds) => [...ds, { ...dev, id, custom: true }]);
    setSelectedId(id);
    setSize(getDeviceSize(dev));
    setOrientation(dev.orientation === "landscape" ? "landscape" : "portrait");
    return id;
  }, []);

  const updateDevice = useCallback((id, patch) => {
    setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    if (selectedId === id) {
      const currentDevice = devices.find((d) => d.id === id);
      if (currentDevice) {
        const updatedDevice = { ...currentDevice, ...patch };
        setSize(getDeviceSize(updatedDevice));
        setOrientation(updatedDevice.orientation === "landscape" ? "landscape" : "portrait");
      }
    }
  }, [devices, selectedId]);

  const deleteDevice = useCallback((id) => {
    setDevices((ds) => ds.filter((d) => d.id !== id));
    setFavorites((f) => f.filter((x) => x !== id));
    setMultiDeviceIds((m) => m.filter((x) => x !== id));
    if (selectedId === id) {
      setSelectedId("iphone-15-pro");
      setSize({ width: 393, height: 852 });
      setOrientation("portrait");
    }
  }, [selectedId]);

  const duplicateDevice = useCallback((id) => {
    setDevices((ds) => {
      const d = ds.find((x) => x.id === id);
      if (!d) return ds;
      return [...ds, { ...d, id: `custom-${Date.now()}`, name: `${d.name} (Copy)`, custom: true }];
    });
  }, []);

  const rotate = useCallback(() => {
    setSize((s) => ({ width: s.height, height: s.width }));
    setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"));
  }, []);

  const zoomBy = useCallback((delta) => setZoom((z) => Math.min(400, Math.max(10, Math.round((z + delta) / 5) * 5))), []);

  const fitToScreen = useCallback(() => {
    const el = workspaceRef.current;
    if (!el) { setZoom(50); return; }
    let availW, availH, needW, needH;
    if (viewMode === "multi") {
      // every device of the comparison must fit side by side (gaps between them are not scaled)
      const ds = multiDeviceIds.map((id) => devices.find((d) => d.id === id)).filter(Boolean);
      if (!ds.length) return;
      needW = ds.reduce((n, d) => n + d.width, 0);
      needH = Math.max(...ds.map((d) => d.height));
      availW = (el.clientWidth - 100 - (ds.length - 1) * 48) * 0.92;
      availH = el.clientHeight - 190;
    } else {
      needW = size.width;
      needH = size.height;
      availW = el.clientWidth - 120;
      availH = el.clientHeight - 160;
    }
    if (availW <= 0 || availH <= 0) return;
    const scale = Math.min(availW / needW, availH / needH, 1);
    setZoom(Math.max(10, Math.round((scale * 100) / 5) * 5));
  }, [size, viewMode, multiDeviceIds, devices]);

  // switching between Single and Multi re-fits the preview to the window
  const firstMode = useRef(true);
  useEffect(() => {
    if (firstMode.current) { firstMode.current = false; return undefined; }
    const id = setTimeout(() => fitToScreen(), 150);
    return () => clearTimeout(id);
  }, [viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const setPref = useCallback((k, v) => setPrefs((p) => ({ ...p, [k]: v })), []);

  // ---- loading & navigation -------------------------------------------------
  const loadUrl = useCallback((raw) => {
    const url = rdt.normalizeUrl(raw);
    if (!url) return null;
    setActiveUrl(url);
    setCurrentUrl(url);
    setReloadKey((k) => k + 1);
    setSelectedEl(null);
    setDocStatus({});
    return url;
  }, []);
  const reload = useCallback(() => { setReloadKey((k) => k + 1); setSelectedEl(null); }, []);
  const goBack = useCallback(() => rdt.agent.back(), []);
  const goForward = useCallback(() => rdt.agent.forward(), []);

  // ---- advanced emulation (Chrome) ------------------------------------------
  const ensureAdvanced = useCallback(async () => {
    if (latest.current.cdp.active) return true;
    if (!rdt.env.extension) {
      toast({ title: "Extension only", description: "Advanced emulation is available when this page runs as the browser extension." });
      return false;
    }
    if (!rdt.cdp.supported) {
      toast({ title: "Chrome only", description: "This feature uses the DevTools protocol, which Firefox does not expose to extensions." });
      return false;
    }
    setCdp((c) => ({ ...c, busy: true }));
    const r = await rdt.cdp.enable(); // must be the first await after the click (permission prompt)
    setCdp((c) => ({ ...c, busy: false, active: r.ok }));
    if (!r.ok) toast({ title: "Advanced emulation unavailable", description: r.error, variant: "destructive" });
    else toast({ title: "Advanced emulation on", description: "Chrome shows a \u201cdebugging this browser\u201d bar while it runs." });
    return r.ok;
  }, [toast]);

  const disableAdvanced = useCallback(async () => {
    await rdt.cdp.disable();
    setCdp((c) => ({ ...c, active: false }));
    setNetworkPresetState("Online");
    setSims((s) => ({ ...s, darkMode: false, reducedMotion: false, focus: false }));
  }, []);

  // The choice is always recorded (so the panel shows what was picked). Applying it needs Advanced emulation:
  // that is started from this click (the browser only asks for permission inside a user gesture); if it cannot
  // start, the panel says why and the choice stays, so it applies as soon as emulation is on.
  const setNetworkPreset = useCallback((name) => {
    setNetworkPresetState(name);
    if (name !== "Online" && !latest.current.cdp.active) ensureAdvanced();
  }, [ensureAdvanced]);

  const toggleSim = useCallback(async (k) => {
    const needsCdp = (k === "darkMode" || k === "reducedMotion" || k === "focus") && latest.current.activeUrl;
    if (needsCdp && !latest.current.cdp.active) {
      const ok = await ensureAdvanced();
      if (!ok) return;
    }
    setSims((s) => ({ ...s, [k]: !s[k] }));
  }, [ensureAdvanced]);

  // ---- colour sampling ---------------------------------------------------------
  const startSampling = useCallback(() => {
    if (!rdt.env.extension || !latest.current.activeUrl) {
      toast({ title: "Load a page first", description: "Colour sampling reads the live page in the device frame." });
      return;
    }
    closeDialog("colorPicker");
    setColorSample(null);
    setColorSamplingState(true);
    rdt.agent.sample(latest.current.activeDeviceId, true);
  }, [toast, closeDialog]);

  const stopSampling = useCallback(() => {
    setColorSamplingState(false);
    setColorSample(null);
    for (const id of rdt.frames.ids()) rdt.agent.sample(id, false);
  }, []);

  // ---- inspect mode -----------------------------------------------------------
  useEffect(() => {
    for (const id of rdt.frames.ids()) rdt.agent.inspect(id, inspectMode && id === activeDeviceId);
  }, [inspectMode, activeDeviceId]);

  // ---- events from the core ---------------------------------------------------
  useEffect(() => {
    const off = rdt.connect();
    // connect() reports "connected" synchronously, before the listeners below exist, so read the state directly
    setBgConnected(rdt.isConnected());
    let netTimer = null;
    const bumpNet = () => { if (!netTimer) netTimer = setTimeout(() => { netTimer = null; setNetTick((n) => n + 1); }, 150); };
    const dbg = (...a) => { if (latest.current.prefs.debug) console.debug("[rdt]", ...a); };

    const subs = [
      rdt.on("bg:connected", ({ connected }) => setBgConnected(connected)),
      rdt.on("bg:hello", ({ cdpSupported, cdpActive }) => setCdp((c) => ({ ...c, supported: cdpSupported, active: cdpActive }))),
      rdt.on("cdp:status", ({ active, reason }) => {
        setCdp((c) => ({ ...c, active }));
        if (!active) {
          setNetworkPresetState("Online");
          setSims((s) => ({ ...s, darkMode: false, reducedMotion: false, focus: false }));
          if (reason && reason !== "target_closed") toast({ title: "Advanced emulation stopped", description: `Detached: ${reason}` });
        }
      }),
      rdt.on("frame:ready", ({ deviceId, info }) => {
        dbg("ready", deviceId, info);
        setFrameInfo((f) => ({ ...f, [deviceId]: info }));
        const { sims: s, prefs: p, devices: ds } = latest.current;
        const dev = ds.find((d) => d.id === deviceId);
        rdt.agent.config(deviceId, { touch: !!s.touch && !(dev && dev.category === "desktop"), mutations: !!p.experimental });
        if (latest.current.inspectMode) rdt.agent.inspect(deviceId, deviceId === latest.current.activeDeviceId);
      }),
      rdt.on("frame:info", ({ deviceId, info }) => setFrameInfo((f) => ({ ...f, [deviceId]: info }))),
      rdt.on("frame:navigated", ({ deviceId, info }) => {
        dbg("navigated", deviceId, info.url);
        setFrameInfo((f) => ({ ...f, [deviceId]: info }));
        setDomTick((n) => n + 1);
        setSelectedEl((s) => (s && s.deviceId === deviceId ? null : s));
        if (deviceId === latest.current.activeDeviceId) setCurrentUrl(info.url);
      }),
      rdt.on("element:selected", ({ deviceId, element, picked }) => {
        setSelectedEl({ deviceId, element });
        setFocusId(deviceId);
        if (picked) {
          setInspectMode(false);
          setRightPanelOpen(true);
          setInspectorTab((t) => (t === "overview" || t === "network" || t === "a11y" ? "elements" : t));
        }
      }),
      rdt.on("inspect:changed", ({ on }) => { if (!on) setInspectMode(false); }),
      rdt.on("sample:state", ({ on }) => setColorSamplingState(on)),
      rdt.on("sample:hover", ({ deviceId, info }) => setColorSample({ deviceId, info })),
      rdt.on("sample:pick", ({ deviceId, info }) => {
        setPickedColor((p) => ({ deviceId, info, seq: (p ? p.seq : 0) + 1 }));
        setColorSample(null);
        setColorSamplingState(false);
        openDialog("colorPicker");
      }),
      rdt.on("net:document", ({ deviceId, status, error }) => { setDocStatus((d) => ({ ...d, [deviceId]: { status, error } })); bumpNet(); }),
      rdt.on("net:request", bumpNet),
      rdt.on("net:cleared", bumpNet),
      rdt.on("dom:mutated", () => { if (latest.current.prefs.experimental) setDomTick((n) => n + 1); }),
      rdt.on("scroll", ({ deviceId, ratio }) => {
        const l = latest.current;
        if (l.viewMode !== "multi" || !l.syncScroll) return;
        for (const id of rdt.frames.ids()) if (id !== deviceId) rdt.agent.scrollTo(id, ratio);
      }),
    ];
    return () => { off(); subs.forEach((u) => u()); clearTimeout(netTimer); };
  }, [toast]);

  // ---- push emulation settings to the frames -----------------------------------
  useEffect(() => {
    rdt.setAgentConfig({ mutations: !!prefs.experimental });
    for (const d of visibleDevices) rdt.agent.config(d.id, { touch: !!sims.touch && d.category !== "desktop", mutations: !!prefs.experimental });
  }, [sims.touch, prefs.experimental, visibleDevices]);

  useEffect(() => {
    if (!cdp.active) return;
    const devs = {};
    for (const d of visibleDevices) devs[d.id] = { dpr: d.dpr, touch: !!sims.touch && d.category !== "desktop", ua: getUserAgent(d) };
    rdt.cdp.configure({
      devices: devs,
      network: netCfgFor(networkPreset, customNet),
      media: { dark: sims.darkMode, reducedMotion: sims.reducedMotion, focus: sims.focus },
    });
  }, [cdp.active, visibleDevices, sims.touch, sims.darkMode, sims.reducedMotion, sims.focus, networkPreset, customNet, reloadKey]);

  // ---- appearance preferences ---------------------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("compact", !!prefs.compact);
    root.style.fontSize = `${(16 * parseInt(prefs.scale, 10)) / 100}px`;
    if (prefs.accent && prefs.accent.toLowerCase() !== DEFAULT_PREFS.accent.toLowerCase()) {
      const hsl = hexToHslVar(prefs.accent);
      root.style.setProperty("--primary", hsl);
      root.style.setProperty("--ring", hsl);
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
    }
  }, [prefs.accent, prefs.compact, prefs.scale]);

  // ---- persistence ----------------------------------------------------------------
  useEffect(() => {
    save({
      selectedId, favorites, customDevices: devices.filter((d) => d.custom), theme, viewMode, multiDeviceIds,
      leftPanelOpen, rightPanelOpen, activeUrl, inspectorTab, showFrame, prefs, shot, shotVersion: 2, syncScroll, syncScrollVersion: 2, customNet,
      sims: { touch: sims.touch, hover: sims.hover, keyboard: sims.keyboard },
    });
  }, [selectedId, favorites, devices, theme, viewMode, multiDeviceIds, leftPanelOpen, rightPanelOpen, activeUrl, inspectorTab, showFrame, prefs, shot, syncScroll, customNet, sims]);

  const value = {
    devices, setDevices, selectedId, selectedDevice, favorites, toggleFavorite,
    size, setSize, orientation, zoom, setZoom, zoomBy, fitToScreen, workspaceRef,
    showGrid, setShowGrid, showRuler, setShowRuler, inspectMode, setInspectMode,
    viewMode, setViewMode, multiDeviceIds, setMultiDeviceIds,
    inspectorTab, setInspectorTab, networkPreset, setNetworkPreset,
    sims, toggleSim, showFrame, setShowFrame,
    activeUrl, setActiveUrl, dialogs, openDialog, closeDialog,
    leftPanelOpen, setLeftPanelOpen, rightPanelOpen, setRightPanelOpen,
    selectDevice, addDevice, updateDevice, deleteDevice, duplicateDevice, rotate,
    theme, setTheme, toggleTheme: useCallback(() => setTheme((x) => (x === "dark" ? "light" : "dark")), []),
    dpr: selectedDevice?.dpr ?? 1,
    // --- live engine ---
    currentUrl, setCurrentUrl, reloadKey, loadUrl, reload, goBack, goForward,
    visibleDevices, activeDeviceId, frameInfo, docStatus, selectedEl, setSelectedEl, focusId, setFocusId,
    netTick, domTick, cdp, ensureAdvanced, disableAdvanced, bgConnected,
    prefs, setPref, shot, setShot, syncScroll, setSyncScroll, customNet, setCustomNet, networkCfg: netCfgFor(networkPreset, customNet), env: rdt.env,
    colorSampling, colorSample, pickedColor, startSampling, stopSampling,
  };

  return <DevToolContext.Provider value={value}>{children}</DevToolContext.Provider>;
}

function hexToHslVar(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "213 94% 42%";
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
