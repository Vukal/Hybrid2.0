export type Exercise = {
  id: string;
  name: string;
  sets: number;
  min: number;
  max: number;
  kind: "heavyCalisthenics" | "main" | "paused" | "accessory";
  optional?: boolean;
};
export type Session = {
  title: string;
  subtitle: string;
  exercises: Exercise[];
};
const e = (
  id: string,
  name: string,
  sets: number,
  min: number,
  max: number,
  kind: Exercise["kind"],
  optional = false,
): Exercise => ({ id, name, sets, min, max, kind, optional });
export const DEFAULT_SESSIONS: Session[] = [
  {
    title: "Heavy dips + upper back",
    subtitle: "Heavy dips · paused pull-ups",
    exercises: [
      e("dips", "Weighted dips", 3, 4, 6, "heavyCalisthenics"),
      e("pausedpull", "Paused weighted pull-ups", 2, 4, 5, "paused"),
      e("row1", "Chest-supported barbell row", 3, 6, 10, "accessory"),
      e("incline", "Incline Smith press", 2, 6, 10, "accessory"),
      e("lateral1", "Dumbbell lateral raises", 3, 10, 20, "accessory"),
      e(
        "overheadtri",
        "Overhead cable triceps extension",
        2,
        8,
        12,
        "accessory",
      ),
    ],
  },
  {
    title: "Heavy squat + biceps",
    subtitle: "Squat strength · leg and arm work",
    exercises: [
      e("squat", "Back squat", 3, 3, 5, "main"),
      e("ham1", "Seated hamstring curls", 3, 8, 12, "accessory"),
      e("legext1", "Leg extensions", 2, 10, 15, "accessory"),
      e("ez", "EZ-bar curls", 3, 6, 10, "accessory"),
      e("preacher1", "Dumbbell preacher curls", 2, 10, 15, "accessory"),
      e("calf1", "Calf raises", 3, 8, 15, "accessory"),
    ],
  },
  {
    title: "Rest & recovery",
    subtitle: "Easy movement or full rest",
    exercises: [],
  },
  {
    title: "Heavy pull-ups + OHP",
    subtitle: "Heavy pull-ups · OHP · paused dips",
    exercises: [
      e("pullups", "Weighted pull-ups", 3, 4, 6, "heavyCalisthenics"),
      e("ohp", "Standing overhead press", 3, 3, 6, "main"),
      e("pauseddip", "Paused weighted dips", 2, 4, 5, "paused"),
      e("row4", "Chest-supported row", 2, 8, 12, "accessory"),
      e("hammer4", "Meadows hammer curls", 3, 8, 12, "accessory"),
      e("yraise", "Chest-supported Y raises", 2, 12, 20, "accessory"),
      e("facepull", "Face pulls", 2, 12, 20, "accessory"),
    ],
  },
  {
    title: "RDL + quads",
    subtitle: "Posterior chain · quad hypertrophy",
    exercises: [
      e("rdl", "Romanian deadlift", 3, 5, 8, "main"),
      e("hack", "Hack squat", 3, 6, 10, "accessory"),
      e("ham5", "Seated hamstring curls", 2, 8, 12, "accessory"),
      e("legext5", "Leg extensions", 2, 10, 15, "accessory"),
      e("calf5", "Calf raises", 3, 10, 15, "accessory"),
      e("adductor", "Adductor machine", 2, 10, 15, "accessory"),
    ],
  },
  {
    title: "Close-grip bench + arms",
    subtitle: "Bench strength · arm hypertrophy",
    exercises: [
      e("bench", "Close-grip bench press", 3, 4, 6, "main"),
      e("preacher6", "Dumbbell preacher curls", 3, 8, 12, "accessory"),
      e("jm", "Smith JM press", 2, 6, 10, "accessory"),
      e("reverse", "Hammer / reverse curls", 2, 10, 15, "accessory"),
      e("decline", "Decline DB triceps extensions", 2, 10, 15, "accessory"),
      e("lateral6", "Dumbbell lateral raises", 2, 12, 20, "accessory", true),
    ],
  },
  { title: "Rest & recovery", subtitle: "First full rest day", exercises: [] },
  { title: "Rest & recovery", subtitle: "Second full rest day", exercises: [] },
];
export type LoggedSet = {
  weight: string;
  reps: string;
  rpe: string;
  done: boolean;
};
export type Workout = {
  id: string;
  day: number;
  date: string;
  entries: Record<string, LoggedSet[]>;
  notes: string;
};
export type Store = {
  version: 1;
  day: number;
  sessions: Session[];
  workouts: Workout[];
};
export const defaultStore = (): Store => ({
  version: 1,
  day: 0,
  sessions: structuredClone(DEFAULT_SESSIONS),
  workouts: [],
});
export const nextTarget = (exercise: Exercise, sets: LoggedSet[]) => {
  const top = sets[0];
  if (!top?.done || top.weight.trim() === "" || top.reps.trim() === "")
    return null;
  const w = Number(top.weight),
    r = Number(top.reps);
  if (!Number.isFinite(w) || !Number.isFinite(r)) return null;
  if (exercise.kind === "heavyCalisthenics") {
    if (r >= 6) return `Next top set: +${w + 2.5} kg (4–6 reps)`;
    if (r >= 4) return `Repeat +${w} kg · aim for ${r + 1} reps`;
    return `Repeat +${w} kg · target at least 4 reps`;
  }
  if (exercise.kind === "paused")
    return "Keep RPE 6–7; add weight only when pauses stay crisp.";
  if (exercise.kind === "main")
    return r >= exercise.max
      ? "Top of range reached · consider next available weight increment"
      : "Build reps before adding weight";
  const completed = sets.filter((s) => s.done);
  return completed.length === exercise.sets &&
    completed.every((s) => Number(s.reps) >= exercise.max)
    ? "All sets at upper rep limit · increase weight next time"
    : "Add reps before weight";
};
