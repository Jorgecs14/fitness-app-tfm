// Definición de la interfaz Exercise para el tipado de datos de ejercicio
export interface Exercise {
  id: number;
  name: string;
  description: string;
  execution_time?: number;
  executionTime?: number; // Para compatibilidad
  slug?: string;
  body_part?: string;
  equipment?: string;
  target_muscle?: string;
  main_muscle_group?: string;
  secondary_muscles?: string[];
  instructions?: string[];
  image_url?: string;
  gif_url?: string;
}

