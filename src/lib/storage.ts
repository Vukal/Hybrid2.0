import type { Store } from "../models/training";
import { DEFAULT_SESSIONS } from "../data/sessions";
export const STORAGE_KEY = "strengthlog-v1";
export const defaultStore = (): Store => ({
  version: 1,
  day: 0,
  sessions: structuredClone(DEFAULT_SESSIONS),
  workouts: [],
});
export const isValidStore = (v: unknown): v is Store => {
  if (!v || typeof v !== "object") return false;
  const s = v as Store;
  return (
    s.version === 1 &&
    Number.isInteger(s.day) &&
    s.day >= 0 &&
    s.day < 8 &&
    Array.isArray(s.sessions) &&
    s.sessions.length === 8 &&
    s.sessions.every(
      (x) =>
        typeof x.title === "string" &&
        Array.isArray(x.exercises) &&
        x.exercises.every(
          (e) =>
            typeof e.id === "string" &&
            typeof e.name === "string" &&
            Number.isInteger(e.sets) &&
            e.sets >= 1 &&
            e.sets <= 12 &&
            Number.isFinite(e.min) &&
            Number.isFinite(e.max) &&
            e.min <= e.max,
        ),
    ) &&
    Array.isArray(s.workouts)
  );
};
export function loadStore(): Store {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return isValidStore(v) ? v : defaultStore();
  } catch {
    return defaultStore();
  }
}

export function persistStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
