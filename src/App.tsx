import { Check, Dumbbell, History, Settings2, TrendingUp } from "lucide-react";
import { useTraining } from "./hooks/useTraining";
import { AppHeader, TrainingSummary } from "./components/AppHeader";
import { TrainingView } from "./components/TrainingView";
import { HistoryView } from "./components/HistoryView";
import { SettingsView } from "./components/SettingsView";
import { ProgressionView } from "./components/ProgressionView";
export default function App() {
  const model = useTraining();
  const { tab, setTab, message, setMessage, stats } = model;
  return (
    <div className="app">
      <AppHeader />
      <main>
        <TrainingSummary count={stats.count} />
        <nav className="tabs" aria-label="App navigation">
          <button
            className={tab === "train" ? "selected" : ""}
            onClick={() => setTab("train")}
          >
            <Dumbbell size={16} /> Train
          </button>
          <button
            className={tab === "progression" ? "selected" : ""}
            onClick={() => setTab("progression")}
          >
            <TrendingUp size={16} /> Progression reference
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
        {tab === "train" && <TrainingView model={model} />}
        {tab === "progression" && <ProgressionView />}
        {tab === "history" && <HistoryView model={model} />}
        {tab === "settings" && <SettingsView model={model} />}
      </main>
      <footer>
        STRENGTHLOG <span>·</span> TRAIN WITH INTENT <span>·</span> BUILT FOR
        YOUR 8-DAY ROTATION
      </footer>
    </div>
  );
}
