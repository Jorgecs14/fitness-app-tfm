/**
 * Servicio para gestionar relaciones entre dietas y alimentos en la aplicación fitness-app-tfm
 * Proporciona métodos para añadir, eliminar y consultar alimentos de las dietas
 */

import { DietFood } from '../types/DietFood'
import axiosInstance from '../lib/axios'

export const getDietFoods = async (dietId: number): Promise<DietFood[]> => {
  try {
    const response = await axiosInstance.get(`/diet_foods?diet_id=${dietId}`)
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al obtener alimentos de la dieta'
    )
  }
}

export const addFoodToDiet = async (
  diet_id: number,
  food_id: number,
  quantity: number
): Promise<DietFood> => {
  try {
    const response = await axiosInstance.post('/diet_foods', {
      diet_id,
      food_id,
      quantity
    })
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al añadir alimento a la dieta'
    )
  }
}

export const removeFoodFromDiet = async (dietFoodId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/diet_foods/${dietFoodId}`)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al eliminar alimento de la dieta'
    )
  }
}
