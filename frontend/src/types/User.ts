// Definición de la interfaz User para el tipado de datos de usuario
export interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
  surname: string;
  birth_date: string;
  created_at: string;
  role: string;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other' | string;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'very_active' | string;
  fitness_goal?: 'fat_loss' | 'muscle_gain' | 'maintenance' | 'health' | string;
  onboarding_completed?: boolean;
  trainer_id?: number | null;
  trainer?: User;
  can_reset_initial_photos?: boolean;
}

