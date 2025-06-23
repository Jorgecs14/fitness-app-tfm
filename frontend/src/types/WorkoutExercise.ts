export interface WorkoutExercise {
  id?: number;
  workout_id: number;
  exercise_id: number;
  sets?: number;
  reps?: number;
}

export interface WorkoutExerciseDetail {
  link_id: number;
  sets?: number;
  reps?: number;
  id: number;
  name: string;
  description: string;
  execution_time?: number;
}