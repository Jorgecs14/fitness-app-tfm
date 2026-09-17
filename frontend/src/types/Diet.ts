export interface MealFoodItem {
  id?: string | number;
  food_id?: number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
}

export interface DietSupplementProduct {
  id?: string | number;
  product_id?: number;
  name: string;
  url?: string;
  timing?: string;
  dosage?: string;
  observations?: string;
}

export interface Diet {
  id: number;
  name: string;
  description: string;
  calories: number;
  water_liters?: number;
  meals_data?: Record<string, MealFoodItem[]>;
  supplement_products?: DietSupplementProduct[];
  notes?: string;
  user_id?: number;
  export_template?: string;
}

