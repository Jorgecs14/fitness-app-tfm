import { Workout } from './Workout'
import { WorkoutExerciseDetail } from './WorkoutExercise'

export interface WorkoutWithExercises extends Workout {
  exercises: WorkoutExerciseDetail[]
}
