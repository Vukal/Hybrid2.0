import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Dumbbell,
  FileUp,
  History,
  Minus,
  Plus,
  RotateCcw,
  Settings2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  DEFAULT_SESSIONS,
  defaultStore,
  nextTarget,
  type Exercise,
  type LoggedSet,
  type Session,
  type Store,
  type Workout,
} from "./data";
import "./style.css";
const KEY = "strengthlog-v1";
const blank = (): LoggedSet => ({ weight: "", reps: "", rpe: "", done: false });
const valid = (v: unknown): v is Store => {
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
function load(): Store {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return valid(v) ? v : defaultStore();
  } catch {
    return defaultStore();
  }
}
function App() {
  const [store, setStore] = useState<Store>(load),
    [tab, setTab] = useState<"train" | "history" | "settings">("train"),
    [editing, setEditing] = useState<string | null>(null),
    [draft, setDraft] = useState<Record<string, LoggedSet[]>>({}),
    [notes, setNotes] = useState(""),
    [message, setMessage] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(store));
  }, [store]);
  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD)
      navigator.serviceWorker.register("./sw.js").catch(() => {});
  }, []);
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
      if (!valid(json)) throw Error("Not a valid StrengthLog backup");
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
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brandmark">
            <Dumbbell size={21} />
          </div>
          <div>
            <strong>StrengthLog</strong>
            <span>8-DAY TRAINING ROTATION</span>
          </div>
        </div>
        <div className="headerpill">
          <span className="pulse" /> LOCAL-FIRST
        </div>
      </header>
      <main>
        <div className="hero">
          <div className="eyebrow">
            YOUR TRAINING SYSTEM <span className="dotsep">/</span> ASYNCHRONOUS
            SPLIT
          </div>
          <h1>
            Build strength.
            <br />
            <em>Track progress.</em>
          </h1>
          <p>
            Five training sessions, three recovery days. No fixed weekdays—just
            your next session.
          </p>
          <div className="summary">
            <div>
              <strong>08</strong>
              <span>DAY ROTATION</span>
            </div>
            <div>
              <strong>05</strong>
              <span>TRAINING DAYS</span>
            </div>
            <div>
              <strong>{String(stats.count).padStart(2, "0")}</strong>
              <span>WORKOUTS LOGGED</span>
            </div>
          </div>
        </div>
        <nav className="tabs" aria-label="App navigation">
          <button
            className={tab === "train" ? "selected" : ""}
            onClick={() => setTab("train")}
          >
            <Dumbbell size={16} /> Train
          </button>
          <button
            className={tab === "history" ? "selected" : ""}
            onClick={() => setTab("history")}
          >
            <History size={16} /> History
          </button>
          <button
            className={tab === "settings" ? "selected" : ""}
            onClick={() => setTab("settings")}
          >
            <Settings2 size={16} /> Settings
          </button>
        </nav>
        {message && (
          <div className="notice" role="status">
            <Check size={16} />
            {message}
            <button onClick={() => setMessage("")} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}
        {tab === "train" && (
          <>
            <section className="rotation">
              <div className="sectionhead">
                <div>
                  <div className="eyebrow">CURRENT ROTATION</div>
                  <h2>
                    Day {day + 1} <span className="muted">of 8</span>
                  </h2>
                </div>
                <div className="daycontrols">
                  <button
                    onClick={() => changeDay(day - 1)}
                    aria-label="Previous day"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={() => changeDay(day + 1)}
                    aria-label="Next day"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="daygrid">
                {store.sessions.map((d, i) => (
                  <button
                    key={i}
                    title={d.title}
                    className={
                      "daytile " +
                      (i === day ? "active " : "") +
                      (d.exercises.length === 0 ? "rest" : "")
                    }
                    onClick={() => changeDay(i)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <small>{d.exercises.length === 0 ? "REST" : "TRAIN"}</small>
                  </button>
                ))}
              </div>
            </section>
            <section className="sessionhead">
              <div className="eyebrow">
                {isRest ? "RECOVERY DAY" : "TODAY’S SESSION"}
              </div>
              <h2>{session.title}</h2>
              <p>{session.subtitle}</p>
            </section>
            {isRest ? (
              <div className="restcard">
                <div className="resticon">☾</div>
                <h3>Recovery is training.</h3>
                <p>
                  Rest, walk, or do light mobility. When you're ready, advance
                  to the next day.
                </p>
                <button className="primary" onClick={save}>
                  Complete rest day <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <>
                <div className="exerciselist">
                  {session.exercises.map((e, idx) => {
                    const sets = getSets(e);
                    const prev = previous(e.id);
                    const target = nextTarget(e, sets);
                    return (
                      <article className="exercise" key={e.id}>
                        <div className="exerciseheader">
                          <div className="index">
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                          <div className="exercisetitle">
                            <h3>{e.name}</h3>
                            <div className="exmeta">
                              <span>
                                {e.kind === "heavyCalisthenics"
                                  ? "TOP SET + 2 BACK-OFFS"
                                  : e.kind === "main"
                                    ? "TOP SET + BACK-OFFS"
                                    : e.kind === "paused"
                                      ? "TECHNIQUE / RPE 6–7"
                                      : "DOUBLE PROGRESSION"}
                              </span>
                              {e.optional && <span>OPTIONAL</span>}
                            </div>
                          </div>
                          <button
                            className="iconbtn"
                            aria-label={"Edit " + e.name}
                            onClick={() =>
                              setEditing(editing === e.id ? null : e.id)
                            }
                          >
                            {editing === e.id ? (
                              <ChevronUp size={18} />
                            ) : (
                              <Settings2 size={17} />
                            )}
                          </button>
                        </div>
                        {editing === e.id && (
                          <div className="editpanel">
                            <label>
                              Exercise name
                              <input
                                value={e.name}
                                onChange={(v) =>
                                  updateExercise(e.id, { name: v.target.value })
                                }
                              />
                            </label>
                            <div className="editgrid">
                              <label>
                                Sets
                                <input
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={e.sets}
                                  onChange={(v) =>
                                    updateExercise(e.id, {
                                      sets: Math.max(
                                        1,
                                        Math.min(
                                          12,
                                          Number(v.target.value) || 1,
                                        ),
                                      ),
                                    })
                                  }
                                />
                              </label>
                              <label>
                                Min reps
                                <input
                                  type="number"
                                  min="1"
                                  value={e.min}
                                  onChange={(v) =>
                                    updateExercise(e.id, {
                                      min: Math.max(
                                        1,
                                        Number(v.target.value) || 1,
                                      ),
                                    })
                                  }
                                />
                              </label>
                              <label>
                                Max reps
                                <input
                                  type="number"
                                  min={e.min}
                                  value={e.max}
                                  onChange={(v) =>
                                    updateExercise(e.id, {
                                      max: Math.max(
                                        e.min,
                                        Number(v.target.value) || e.min,
                                      ),
                                    })
                                  }
                                />
                              </label>
                            </div>
                            <label>
                              Progression type
                              <select
                                value={e.kind}
                                onChange={(v) =>
                                  updateExercise(e.id, {
                                    kind: v.target.value as Exercise["kind"],
                                  })
                                }
                              >
                                <option value="heavyCalisthenics">
                                  Weighted dip / pull-up top set
                                </option>
                                <option value="main">Main strength lift</option>
                                <option value="paused">Paused technique</option>
                                <option value="accessory">
                                  Accessory / double progression
                                </option>
                              </select>
                            </label>
                            <button
                              className="dangerlink"
                              onClick={() => removeExercise(e.id)}
                            >
                              <Trash2 size={15} /> Remove exercise
                            </button>
                          </div>
                        )}
                        <div className="settable">
                          <div className="setrow setlabels">
                            <span>SET</span>
                            <span>KG</span>
                            <span>REPS</span>
                            <span>RPE</span>
                            <span>DONE</span>
                          </div>
                          {Array.from({ length: e.sets }, (_, i) => (
                            <div
                              className={
                                "setrow " + (sets[i]?.done ? "completed" : "")
                              }
                              key={i}
                            >
                              <span className="setname">
                                {e.kind === "heavyCalisthenics" ||
                                e.kind === "main"
                                  ? i === 0
                                    ? "TOP"
                                    : `BO ${i}`
                                  : String(i + 1).padStart(2, "0")}
                              </span>
                              <input
                                type="number"
                                step="0.5"
                                inputMode="decimal"
                                aria-label={`${e.name} set ${i + 1} weight`}
                                placeholder="—"
                                value={sets[i]?.weight ?? ""}
                                onChange={(v) =>
                                  setField(e, i, "weight", v.target.value)
                                }
                              />
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                aria-label={`${e.name} set ${i + 1} reps`}
                                placeholder={`${e.min}–${e.max}`}
                                value={sets[i]?.reps ?? ""}
                                onChange={(v) =>
                                  setField(e, i, "reps", v.target.value)
                                }
                              />
                              <input
                                type="number"
                                min="1"
                                max="10"
                                step="0.5"
                                inputMode="decimal"
                                aria-label={`${e.name} set ${i + 1} RPE`}
                                placeholder="—"
                                value={sets[i]?.rpe ?? ""}
                                onChange={(v) =>
                                  setField(e, i, "rpe", v.target.value)
                                }
                              />
                              <button
                                className={
                                  "checkbtn " + (sets[i]?.done ? "checked" : "")
                                }
                                aria-label={`Mark set ${i + 1} ${sets[i]?.done ? "incomplete" : "complete"}`}
                                onClick={() =>
                                  setField(e, i, "done", !sets[i]?.done)
                                }
                              >
                                <Check size={17} />
                              </button>
                            </div>
                          ))}
                        </div>
                        {prev && (
                          <div className="previous">
                            <History size={13} /> Previous:{" "}
                            {prev
                              .map(
                                (s, i) =>
                                  `${i + 1}: ${s.weight || "—"} kg × ${s.reps || "—"}`,
                              )
                              .join("  ·  ")}
                          </div>
                        )}
                        {target && (
                          <div className="target">
                            <TrendingUp size={15} />
                            {target}
                          </div>
                        )}
                        <div className="range">
                          TARGET{" "}
                          <strong>
                            {e.kind === "heavyCalisthenics" || e.kind === "main"
                              ? `Top ${e.min}–${e.max} · back-offs ${e.kind === "main" && e.id === "rdl" ? "6–10" : e.id === "bench" ? "5–8" : "4–6"}`
                              : `${e.sets} × ${e.min}–${e.max}`}
                          </strong>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <button className="addexercise" onClick={addExercise}>
                  <Plus size={17} /> Add exercise to Day {day + 1}
                </button>
                <div className="finish">
                  <label>
                    SESSION NOTES
                    <textarea
                      value={notes}
                      onChange={(v) => setNotes(v.target.value)}
                      rows={3}
                      placeholder="How did it feel? Technique notes, fatigue, PRs…"
                    />
                  </label>
                  <button className="primary" onClick={save}>
                    Finish & save workout <ArrowRight size={18} />
                  </button>
                  <p>Completed sets are saved locally on this device.</p>
                </div>
              </>
            )}
          </>
        )}
        {tab === "history" && (
          <section className="panel">
            <div className="eyebrow">YOUR TRAINING LOG</div>
            <h2>Workout history</h2>
            <p className="subtext">
              {stats.count} workouts · {stats.completed} completed sets
            </p>
            {store.workouts.length === 0 ? (
              <div className="empty">
                Your completed sessions will appear here.
              </div>
            ) : (
              <div className="historylist">
                {[...store.workouts].reverse().map((w) => (
                  <details key={w.id} className="historyitem">
                    <summary>
                      <div>
                        <strong>
                          {store.sessions[w.day]?.title ?? `Day ${w.day + 1}`}
                        </strong>
                        <small>
                          {new Date(w.date).toLocaleDateString()} · Day{" "}
                          {w.day + 1} · {Object.values(w.entries).flat().length}{" "}
                          sets
                        </small>
                      </div>
                      <ChevronDown size={18} />
                    </summary>
                    <div className="historybody">
                      {Object.entries(w.entries).map(([id, sets]) => (
                        <div key={id}>
                          <strong>
                            {store.sessions
                              .flatMap((s) => s.exercises)
                              .find((e) => e.id === id)?.name ?? id}
                          </strong>
                          <span>
                            {sets
                              .map(
                                (s) =>
                                  `${s.weight || "—"} kg × ${s.reps || "—"}${s.rpe ? " @" + s.rpe : ""}`,
                              )
                              .join(" · ")}
                          </span>
                        </div>
                      ))}
                      {w.notes && <p>{w.notes}</p>}
                      <button
                        className="dangerlink"
                        onClick={() => {
                          if (confirm("Delete this workout permanently?"))
                            setStore((s) => ({
                              ...s,
                              workouts: s.workouts.filter((x) => x.id !== w.id),
                            }));
                        }}
                      >
                        <Trash2 size={14} /> Delete workout
                      </button>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>
        )}
        {tab === "settings" && (
          <section className="panel">
            <div className="eyebrow">MANAGE YOUR TRAINING</div>
            <h2>Settings & backup</h2>
            <div className="setting">
              <div>
                <h3>Export your data</h3>
                <p>
                  Download exercises, rotation position, and workout history as
                  JSON.
                </p>
              </div>
              <button className="secondary" onClick={exportData}>
                <Download size={16} /> Export
              </button>
            </div>
            <div className="setting">
              <div>
                <h3>Import a backup</h3>
                <p>
                  Restore data from another device. Replaces the current local
                  data.
                </p>
              </div>
              <button
                className="secondary"
                onClick={() => upload.current?.click()}
              >
                <FileUp size={16} /> Import
              </button>
              <input
                hidden
                type="file"
                ref={upload}
                accept=".json,application/json"
                onChange={(e) => importData(e.target.files?.[0])}
              />
            </div>
            <div className="setting">
              <div>
                <h3>Reset exercise plan</h3>
                <p>
                  Restore the original eight-day exercises. Workout history
                  stays intact.
                </p>
              </div>
              <button
                className="secondary"
                onClick={() => {
                  if (
                    confirm(
                      "Reset all exercise edits? Your workout history will be kept.",
                    )
                  )
                    setStore((s) => ({
                      ...s,
                      sessions: structuredClone(DEFAULT_SESSIONS),
                    }));
                }}
              >
                <RotateCcw size={16} /> Reset plan
              </button>
            </div>
            <div className="setting">
              <div>
                <h3>Clear all data</h3>
                <p>
                  Erase workout history and reset the schedule on this device.
                </p>
              </div>
              <button
                className="secondary danger"
                onClick={() => {
                  if (
                    confirm(
                      "Permanently erase ALL locally saved StrengthLog data?",
                    )
                  ) {
                    setStore(defaultStore());
                    setDraft({});
                  }
                }}
              >
                <Trash2 size={16} /> Clear
              </button>
            </div>
            <div className="guide">
              <div className="eyebrow">PROGRESSION REFERENCE</div>
              <h3>How to progress</h3>
              <div>
                <strong>Weighted dips & pull-ups</strong>
                <p>
                  Top set 4–6 reps. At 6 clean reps, add 2.5 kg next heavy
                  session. At 4–5 reps, keep the weight and build reps. Use two
                  back-off sets at roughly 90% of added top-set weight, rounded
                  to available plates.
                </p>
              </div>
              <div>
                <strong>Squat, OHP, RDL & close-grip bench</strong>
                <p>
                  Build reps to the top of the range before increasing load.
                  Start back-offs around 5–10% lighter; adjust to hit their
                  assigned rep ranges. Your barbell's smallest possible jump may
                  be 5 kg.
                </p>
              </div>
              <div>
                <strong>Paused variations</strong>
                <p>
                  2×4–5 at RPE 6–7. Keep pauses controlled. Increase weight only
                  when technique is consistently crisp.
                </p>
              </div>
              <div>
                <strong>Accessories</strong>
                <p>
                  Double progression: add reps until every set reaches the upper
                  bound, then increase weight and rebuild. Generally leave 1–2
                  reps in reserve.
                </p>
              </div>
              <div>
                <strong>Recovery</strong>
                <p>
                  Rest 3–5 minutes on main lifts and 1–3 minutes on accessories.
                  Reduce volume if recovery or joint comfort suffers. Two
                  consecutive rest days follow Day 6.
                </p>
              </div>
            </div>
            <p className="storagewarning">
              Data is saved in this browser's local storage. It does not
              automatically sync between devices and can be lost if browser data
              is cleared. Export backups regularly.
            </p>
          </section>
        )}
      </main>
      <footer>
        STRENGTHLOG <span>·</span> TRAIN WITH INTENT <span>·</span> BUILT FOR
        YOUR 8-DAY ROTATION
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
