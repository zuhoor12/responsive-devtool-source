export function createEmitter() {
  const map = new Map();
  return {
    on(event, fn) {
      if (!map.has(event)) map.set(event, new Set());
      map.get(event).add(fn);
      return () => map.get(event).delete(fn);
    },
    emit(event, data) {
      const set = map.get(event);
      if (set) for (const fn of [...set]) { try { fn(data); } catch (e) { console.error('[rdt] listener error', e); } }
    }
  };
}
