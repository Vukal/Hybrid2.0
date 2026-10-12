import { Dumbbell } from "lucide-react";
export function AppHeader() {
  return (
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
  );
}
export function TrainingSummary({ count }: { count: number }) {
  return (
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
        Five training sessions, three recovery days. No fixed weekdays—just your
        next session.
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
          <strong>{String(count).padStart(2, "0")}</strong>
          <span>WORKOUTS LOGGED</span>
        </div>
      </div>
    </div>
  );
}
