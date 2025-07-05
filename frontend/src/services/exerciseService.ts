/**
 * Servicio para gestionar ejercicios en la aplicación fitness-app-tfm
 * Proporciona métodos para CRUD de ejercicios
 */

import { Exercise } from '../types/Exercise'
import axiosInstance from '../lib/axios'

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await axiosInstance.get('/exercises')
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al obtener ejercicios'
    )
  }
}

export const createExercise = async (
  exercise: Omit<Exercise, 'id'>
): Promise<Exercise> => {
  try {
    const response = await axiosInstance.post('/exercises', exercise)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear ejercicio')
  }
}

export const updateExercise = async (
  id: number,
  exercise: Omit<Exercise, 'id'>
): Promise<Exercise> => {
  try {
    const response = await axiosInstance.put(`/exercises/${id}`, exercise)
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al actualizar ejercicio'
    )
  }
}

export const deleteExercise = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/exercises/${id}`)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al eliminar ejercicio'
    )
  }
}
