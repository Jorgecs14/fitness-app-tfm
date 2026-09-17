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
  trainer_id?: number | null;
  trainer?: User;
  can_reset_initial_photos?: boolean;
}

