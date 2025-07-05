/**
 * Servicio para gestionar relaciones entre entrenamientos y ejercicios en la aplicación fitness-app-tfm
 * Proporciona métodos para añadir, eliminar y consultar ejercicios de los entrenamientos
 */

import {
  WorkoutExercise,
  WorkoutExerciseDetail
} from '../types/WorkoutExercise'
import axiosInstance from '../lib/axios'

export const getWorkoutExercises = async (
  workoutId: number
): Promise<WorkoutExerciseDetail[]> => {
  try {
    const response = await axiosInstance.get(
      `/workout_exercises/workout/${workoutId}`
    )
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        'Error al obtener ejercicios del entrenamiento'
    )
  }
}

export const addExerciseToWorkout = async (
  data: WorkoutExercise
): Promise<WorkoutExercise> => {
  try {
    const response = await axiosInstance.post('/workout_exercises', data)
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        'Error al agregar ejercicio al entrenamiento'
    )
  }
}

export const removeExerciseFromWorkout = async (
  linkId: number
): Promise<void> => {
  try {
    await axiosInstance.delete(`/workout_exercises/${linkId}`)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        'Error al eliminar ejercicio del entrenamiento'
    )
  }
}
