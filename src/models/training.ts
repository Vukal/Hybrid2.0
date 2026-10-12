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
