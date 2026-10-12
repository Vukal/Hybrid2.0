import type { Exercise, LoggedSet } from "../models/training";
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
