import { ChevronDown, Trash2 } from "lucide-react";
import type { TrainingModel } from "../hooks/useTraining";
export function HistoryView({ model }: { model: TrainingModel }) {
  const { stats, store, setStore } = model;
  return (
    <section className="panel">
      <div className="eyebrow">YOUR TRAINING LOG</div>
      <h2>Workout history</h2>
      <p className="subtext">
        {stats.count} workouts · {stats.completed} completed sets
      </p>
      {store.workouts.length === 0 ? (
        <div className="empty">Your completed sessions will appear here.</div>
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
                    {new Date(w.date).toLocaleDateString()} · Day {w.day + 1} ·{" "}
                    {Object.values(w.entries).flat().length} sets
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
  );
}
