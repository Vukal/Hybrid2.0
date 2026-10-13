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
      <p className="storagewarning">
        Data is saved in this browser's local storage. It does not automatically
        sync between devices and can be lost if browser data is cleared. Export
        backups regularly.
      </p>
    </section>
  );
}
