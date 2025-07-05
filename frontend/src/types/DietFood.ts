// Definición de la interfaz DietFood para el tipado de datos de relación dieta-comida
import { Food } from './Food'

export interface DietFood {
  id: number
  diet_id: number
  food_id: number
  quantity: number
  foods?: Food
}
