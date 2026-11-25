import rdt from "@core/index.js";

// UI preferences survive reloads through chrome.storage.local (localStorage outside the extension).
const KEY = "rdt-ui-v1";
let saved = {};
let timer = null;

export async function loadSaved() {
  const v = await rdt.storage.get(KEY, {});
  saved = v && typeof v === "object" ? v : {};
  return saved;
}
export const getSaved = () => saved;

export function save(state) {
  saved = { ...saved, ...state };
  clearTimeout(timer);
  timer = setTimeout(() => rdt.storage.set(KEY, saved), 400);
}
