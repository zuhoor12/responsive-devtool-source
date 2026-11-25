import { useCallback, useEffect, useRef, useState } from "react";

// Screen recording via getDisplayMedia + MediaRecorder (WebM output).
// Pause / Resume map straight onto MediaRecorder's native pause/resume.
export function useRecorder() {
  const [state, setState] = useState("idle"); // idle | recording | paused
  const [elapsed, setElapsed] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (state !== "recording") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const start = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
      const mime =
        (typeof MediaRecorder !== "undefined" &&
          ["video/webm;codecs=vp9", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m))) ||
        "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || "video/webm" });
        setResultUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((tr) => tr.stop());
      };
      // user stops sharing from the browser UI
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        try { rec.stop(); } catch { /* already stopped */ }
        setState("idle");
      });
      rec.start(250);
      recRef.current = rec;
      setElapsed(0);
      setResultUrl(null);
      setState("recording");
      return null;
    } catch {
      return "Screen recording isn't available — permission denied or unsupported browser.";
    }
  }, []);

  const pause = useCallback(() => {
    if (recRef.current?.state === "recording") recRef.current.pause();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    if (recRef.current?.state === "paused") recRef.current.resume();
    setState("recording");
  }, []);

  const stop = useCallback(() => {
    if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
    setState("idle");
  }, []);

  const dismiss = useCallback(() => {
    setResultUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  }, []);

  return { state, elapsed, resultUrl, start, pause, resume, stop, dismiss };
}