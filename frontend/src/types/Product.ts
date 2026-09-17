// Definición de la interfaz Product para el tipado de datos de producto
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  url?: string;
  image_url?: string;
  category?: string;
  trainer_id?: number;
}

