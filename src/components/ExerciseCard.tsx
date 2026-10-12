import { Check, ChevronUp, Settings2, History, TrendingUp } from "lucide-react";
import type { Exercise } from "../models/training";
import type { TrainingModel } from "../hooks/useTraining";
import { nextTarget } from "../lib/progression";
import { ExerciseEditor } from "./ExerciseEditor";
export function ExerciseCard({
  exercise: e,
  index: idx,
  model,
}: {
  exercise: Exercise;
  index: number;
  model: TrainingModel;
}) {
  const {
    getSets,
    previous,
    editing,
    setEditing,
    updateExercise,
    removeExercise,
    setField,
  } = model;
  const sets = getSets(e);
  const prev = previous(e.id);
  const target = nextTarget(e, sets);
  return (
    <article className="exercise">
      <div className="exerciseheader">
        <div className="index">{String(idx + 1).padStart(2, "0")}</div>
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
          onClick={() => setEditing(editing === e.id ? null : e.id)}
        >
          {editing === e.id ? <ChevronUp size={18} /> : <Settings2 size={17} />}
        </button>
      </div>
      {editing === e.id && (
        <ExerciseEditor
          exercise={e}
          updateExercise={updateExercise}
          removeExercise={removeExercise}
        />
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
            className={"setrow " + (sets[i]?.done ? "completed" : "")}
            key={i}
          >
            <span className="setname">
              {e.kind === "heavyCalisthenics" || e.kind === "main"
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
              onChange={(v) => setField(e, i, "weight", v.target.value)}
            />
            <input
              type="number"
              min="0"
              inputMode="numeric"
              aria-label={`${e.name} set ${i + 1} reps`}
              placeholder={`${e.min}–${e.max}`}
              value={sets[i]?.reps ?? ""}
              onChange={(v) => setField(e, i, "reps", v.target.value)}
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
              onChange={(v) => setField(e, i, "rpe", v.target.value)}
            />
            <button
              className={"checkbtn " + (sets[i]?.done ? "checked" : "")}
              aria-label={`Mark set ${i + 1} ${sets[i]?.done ? "incomplete" : "complete"}`}
              onClick={() => setField(e, i, "done", !sets[i]?.done)}
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
            .map((s, i) => `${i + 1}: ${s.weight || "—"} kg × ${s.reps || "—"}`)
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
}
