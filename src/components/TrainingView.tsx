import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import type { TrainingModel } from "../hooks/useTraining";
import { ExerciseCard } from "./ExerciseCard";
export function TrainingView({ model }: { model: TrainingModel }) {
  const {
    day,
    changeDay,
    store,
    isRest,
    session,
    save,
    addExercise,
    notes,
    setNotes,
  } = model;
  return (
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
            <button onClick={() => changeDay(day + 1)} aria-label="Next day">
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
            Rest, walk, or do light mobility. When you're ready, advance to the
            next day.
          </p>
          <button className="primary" onClick={save}>
            Complete rest day <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
          <div className="exerciselist">
            {session.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                model={model}
              />
            ))}
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
  );
}
