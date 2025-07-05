// Definición de la interfaz DietWithFoods que extiende Diet incluyendo información de comidas
import { Diet } from './Diet'
import { DietFood } from './DietFood'
import { Food } from './Food'

export interface DietWithFoods extends Diet {
  diet_foods: DietFood[]
  foods: Food[]
}
