export interface ClientMedicalInfo {
  id: number;
  user_id: number;
  allergies?: string;
  food_intolerances?: string;
  injuries_conditions?: string;
  disliked_foods?: string;
  lab_results?: string;
  daily_nutrition_log?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientMedicalInfoData {
  user_id: number;
  allergies?: string;
  food_intolerances?: string;
  injuries_conditions?: string;
  disliked_foods?: string;
  lab_results?: string;
  daily_nutrition_log?: string;
}

export interface UpdateClientMedicalInfoData {
  allergies?: string;
  food_intolerances?: string;
  injuries_conditions?: string;
  disliked_foods?: string;
  lab_results?: string;
  daily_nutrition_log?: string;
}
