// Definición de interfaces para el tipado de datos relacionados con ejercicios en entrenamientos
export interface WorkoutExercise {
  id?: number
  workout_id: number
  exercise_id: number
  sets?: number
  reps?: number
}

export interface WorkoutExerciseDetail {
  link_id: number
  exercise_id: number
  sets: number
  reps: number
  name: string
  description: string
  execution_time: number
  gif_url?: string
  image_url?: string
  body_part?: string
  equipment?: string
  target_muscle?: string
}

export interface SelectedExercise {
  exercise_id: number
  sets: number
  reps: number
}
