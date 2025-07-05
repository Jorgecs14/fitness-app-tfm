// Definición de la interfaz WorkoutWithExercises que extiende Workout incluyendo información de ejercicios
import { Workout } from './Workout'
import { WorkoutExerciseDetail } from './WorkoutExercise'

export interface WorkoutWithExercises extends Workout {
  exercises?: WorkoutExerciseDetail[]
  workout_exercises?: Array<{
    id: number
    sets: number
    reps: number
    exercises: {
      id: number
      name: string
      description: string
      execution_time: number
    }
  }>
}
