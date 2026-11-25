import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

/** The site's real icon (reported by the page), or a globe while unknown / when it fails to load. */
export default function Favicon({ src, size = 14 }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  if (!src || broken) return <Globe size={size} className="shrink-0" />;
  return <img src={src} alt="" width={size} height={size} className="shrink-0" style={{ borderRadius: 3 }} onError={() => setBroken(true)} />;
}
