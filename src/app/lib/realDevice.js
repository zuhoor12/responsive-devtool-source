// Address logic for "Test on a real phone". A phone cannot reach "localhost" on the computer, so for local
// addresses the user gives their computer's address on the network (e.g. 192.168.1.20:5173).

export const isLocalAddress = (url) => {
  try {
    const h = new URL(url).hostname;
    return h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "[::1]" || h.endsWith(".local");
  } catch {
    return false;
  }
};

/** Replaces the host of a URL with the network address the user gave ("192.168.1.20:5173" or "192.168.1.20"). */
export function withNetworkHost(url, host) {
  const clean = (host || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  if (!clean) return url;
  try {
    const u = new URL(url);
    const [h, port] = clean.split(":");
    u.hostname = h;
    if (port) u.port = port;
    return u.toString();
  } catch {
    return url;
  }
}

export const looksLikeNetworkHost = (host) => /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/.test((host || "").trim());
