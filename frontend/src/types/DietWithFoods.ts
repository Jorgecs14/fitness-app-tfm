import { Diet } from './Diet';

export interface DietFood {
  food_id: number;
  quantity: number;
}

export interface DietWithFoods extends Diet {
  foods: DietFood[];
}