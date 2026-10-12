import { Download, FileUp, RotateCcw, Trash2 } from "lucide-react";
import { DEFAULT_SESSIONS } from "../data/sessions";
import { defaultStore } from "../lib/storage";
import type { TrainingModel } from "../hooks/useTraining";
export function SettingsView({ model }: { model: TrainingModel }) {
  const { exportData, upload, importData, setStore, setDraft } = model;
  return (
    <section className="panel">
      <div className="eyebrow">MANAGE YOUR TRAINING</div>
      <h2>Settings & backup</h2>
      <div className="setting">
        <div>
          <h3>Export your data</h3>
          <p>
            Download exercises, rotation position, and workout history as JSON.
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
            Restore data from another device. Replaces the current local data.
          </p>
        </div>
        <button className="secondary" onClick={() => upload.current?.click()}>
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
            Restore the original eight-day exercises. Workout history stays
            intact.
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
          <p>Erase workout history and reset the schedule on this device.</p>
        </div>
        <button
          className="secondary danger"
          onClick={() => {
            if (
              confirm("Permanently erase ALL locally saved StrengthLog data?")
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
            Top set 4–6 reps. At 6 clean reps, add 2.5 kg next heavy session. At
            4–5 reps, keep the weight and build reps. Use two back-off sets at
            roughly 90% of added top-set weight, rounded to available plates.
          </p>
        </div>
        <div>
          <strong>Squat, OHP, RDL & close-grip bench</strong>
          <p>
            Build reps to the top of the range before increasing load. Start
            back-offs around 5–10% lighter; adjust to hit their assigned rep
            ranges. Your barbell's smallest possible jump may be 5 kg.
          </p>
        </div>
        <div>
          <strong>Paused variations</strong>
          <p>
            2×4–5 at RPE 6–7. Keep pauses controlled. Increase weight only when
            technique is consistently crisp.
          </p>
        </div>
        <div>
          <strong>Accessories</strong>
          <p>
            Double progression: add reps until every set reaches the upper
            bound, then increase weight and rebuild. Generally leave 1–2 reps in
            reserve.
          </p>
        </div>
        <div>
          <strong>Recovery</strong>
          <p>
            Rest 3–5 minutes on main lifts and 1–3 minutes on accessories.
            Reduce volume if recovery or joint comfort suffers. Two consecutive
            rest days follow Day 6.
          </p>
        </div>
      </div>
      <p className="storagewarning">
        Data is saved in this browser's local storage. It does not automatically
        sync between devices and can be lost if browser data is cleared. Export
        backups regularly.
      </p>
    </section>
  );
}
