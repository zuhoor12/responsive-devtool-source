import { useEffect, useState } from "react";

const format = (ampm) => {
  const t = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return ampm ? t : t.replace(/\s?[AP]M$/i, ""); // iOS shows "9:41" without AM/PM
};

/** "11:49 AM" (or "11:49" with ampm=false) in the user's locale, refreshed every 20 s. */
export function useClock(ampm = true) {
  const [time, setTime] = useState(() => format(ampm));
  useEffect(() => {
    const id = setInterval(() => setTime(format(ampm)), 20000);
    return () => clearInterval(id);
  }, [ampm]);
  return time;
}
