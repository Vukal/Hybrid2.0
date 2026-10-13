import { useEffect, useMemo, useRef, useState } from "react";
import type { Exercise, LoggedSet, Store, Workout } from "../models/training";
import { loadStore, persistStore, isValidStore } from "../lib/storage";
const blank = (): LoggedSet => ({ weight: "", reps: "", rpe: "", done: false });
export function useTraining() {
  const [store, setStore] = useState<Store>(loadStore),
    [tab, setTab] = useState<"train" | "progression" | "history" | "settings">(
      "train",
    ),
    [editing, setEditing] = useState<string | null>(null),
    [draft, setDraft] = useState<Record<string, LoggedSet[]>>({}),
    [notes, setNotes] = useState(""),
    [message, setMessage] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  useEffect(() => {
    persistStore(store);
  }, [store]);
  const day = store.day,
    session = store.sessions[day],
    isRest = session.exercises.length === 0;
  const previous = (id: string) => {
    for (let i = store.workouts.length - 1; i >= 0; i--) {
      const w = store.workouts[i];
      if (w.entries[id]?.some((s) => s.done))
        return w.entries[id].filter((s) => s.done);
    }
    return null;
  };
  const getSets = (e: Exercise) =>
    draft[e.id] ??
    Array.from({ length: e.sets }, (_, i) => {
      const prior = previous(e.id);
      return prior?.[i] ? { ...prior[i], done: false } : blank();
    });
  const setField = (
    e: Exercise,
    i: number,
    field: keyof LoggedSet,
    value: string | boolean,
  ) => {
    const sets = getSets(e).map((x) => ({ ...x }));
    sets[i] = { ...sets[i], [field]: value };
    setDraft((d) => ({ ...d, [e.id]: sets }));
  };
  const changeDay = (n: number) => {
    setStore((s) => ({ ...s, day: (n + 8) % 8 }));
    setDraft({});
    setNotes("");
    setMessage("");
  };
  const save = () => {
    const entries: Record<string, LoggedSet[]> = {};
    for (const e of session.exercises) {
      const sets = getSets(e);
      if (sets.some((s) => s.done))
        entries[e.id] = sets.filter((s) => s.done).map((s) => ({ ...s }));
    }
    if (!isRest && Object.keys(entries).length === 0) {
      setMessage("Mark at least one completed set before finishing.");
      return;
    }
    const workout: Workout = {
      id: crypto.randomUUID(),
      day,
      date: new Date().toISOString(),
      entries,
      notes,
    };
    setStore((s) => ({
      ...s,
      workouts: isRest ? s.workouts : [...s.workouts, workout],
      day: (s.day + 1) % 8,
    }));
    setDraft({});
    setNotes("");
    setMessage(
      isRest
        ? "Rest day completed."
        : "Workout saved. Next rotation day ready.",
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const updateExercise = (id: string, patch: Partial<Exercise>) =>
    setStore((s) => ({
      ...s,
      sessions: s.sessions.map((d, i) =>
        i === day
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === id ? { ...e, ...patch } : e,
              ),
            }
          : d,
      ),
    }));
  const removeExercise = (id: string) => {
    if (!confirm("Remove this exercise from the current day?")) return;
    setStore((s) => ({
      ...s,
      sessions: s.sessions.map((d, i) =>
        i === day
          ? { ...d, exercises: d.exercises.filter((e) => e.id !== id) }
          : d,
      ),
    }));
    setEditing(null);
  };
  const addExercise = () => {
    const id = `custom-${crypto.randomUUID()}`;
    const ex: Exercise = {
      id,
      name: "New exercise",
      sets: 3,
      min: 8,
      max: 12,
      kind: "accessory",
    };
    setStore((s) => ({
      ...s,
      sessions: s.sessions.map((d, i) =>
        i === day ? { ...d, exercises: [...d.exercises, ex] } : d,
      ),
    }));
    setEditing(id);
  };
  const exportData = () => {
    const b = new Blob([JSON.stringify(store, null, 2)], {
      type: "application/json",
    });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = `strengthlog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
  const importData = async (file?: File) => {
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      if (!isValidStore(json)) throw Error("Not a valid StrengthLog backup");
      if (!confirm("Replace all current training data with this backup?"))
        return;
      setStore(json);
      setDraft({});
      setMessage("Backup imported successfully.");
      setTab("train");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Import failed");
    }
    if (upload.current) upload.current.value = "";
  };
  const stats = useMemo(() => {
    const count = store.workouts.length;
    const completed = store.workouts.reduce(
      (n, w) =>
        n +
        Object.values(w.entries)
          .flat()
          .filter((s) => s.done).length,
      0,
    );
    return { count, completed };
  }, [store.workouts]);

  return {
    store,
    setStore,
    tab,
    setTab,
    editing,
    setEditing,
    draft,
    setDraft,
    notes,
    setNotes,
    message,
    setMessage,
    upload,
    day,
    session,
    isRest,
    previous,
    getSets,
    setField,
    changeDay,
    save,
    updateExercise,
    removeExercise,
    addExercise,
    exportData,
    importData,
    stats,
  };
}
export type TrainingModel = ReturnType<typeof useTraining>;
