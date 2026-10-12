import { Trash2 } from "lucide-react";
import type { Exercise } from "../models/training";
import type { TrainingModel } from "../hooks/useTraining";
type Props = {
  exercise: Exercise;
  updateExercise: TrainingModel["updateExercise"];
  removeExercise: TrainingModel["removeExercise"];
};
export function ExerciseEditor({
  exercise: e,
  updateExercise,
  removeExercise,
}: Props) {
  return (
    <div className="editpanel">
      <label>
        Exercise name
        <input
          value={e.name}
          onChange={(v) => updateExercise(e.id, { name: v.target.value })}
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
                sets: Math.max(1, Math.min(12, Number(v.target.value) || 1)),
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
                min: Math.max(1, Number(v.target.value) || 1),
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
                max: Math.max(e.min, Number(v.target.value) || e.min),
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
          <option value="accessory">Accessory / double progression</option>
        </select>
      </label>
      <button className="dangerlink" onClick={() => removeExercise(e.id)}>
        <Trash2 size={15} /> Remove exercise
      </button>
    </div>
  );
}
