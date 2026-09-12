/**
 * Servicio para gestionar ejercicios en la aplicación fitness-app-tfm
 * Proporciona métodos para CRUD de ejercicios con búsqueda y filtrado
 */

import { Exercise } from '../types/Exercise'
import axiosInstance from '../lib/axios'

export interface ExerciseQueryParams {
  q?: string;
  search?: string;
  body_part?: string;
  target_muscle?: string;
  equipment?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedExercisesResponse {
  data: Exercise[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExerciseCategoriesResponse {
  bodyParts: string[];
  targetMuscles: string[];
  equipments: string[];
}

export const getExercises = async (params?: ExerciseQueryParams): Promise<Exercise[] | PaginatedExercisesResponse> => {
  try {
    const response = await axiosInstance.get('/exercises', { params })
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al obtener ejercicios'
    )
  }
}

export const getExerciseCategories = async (): Promise<ExerciseCategoriesResponse> => {
  try {
    const response = await axiosInstance.get('/exercises/categories')
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al obtener categorías de ejercicios'
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
  exercise: Partial<Omit<Exercise, 'id'>>
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

