import { DietFood } from '../types/DietFood';

const API_URL = 'http://localhost:3001/api/diet_foods';

// Obtener alimentos de una dieta
export const getDietFoods = async (dietId: number): Promise<DietFood[]> => {
  const response = await fetch(`${API_URL}?diet_id=${dietId}`);
  if (!response.ok) throw new Error('Error al obtener alimentos de la dieta');
  return response.json();
};

// Añadir alimento a dieta
export const addFoodToDiet = async (diet_id: number, food_id: number, quantity: number): Promise<DietFood> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diet_id, food_id, quantity }),
  });
  if (!response.ok) throw new Error('Error al añadir alimento a la dieta');
  return response.json();
};

// Eliminar alimento de dieta
export const removeFoodFromDiet = async (dietFoodId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${dietFoodId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar alimento de la dieta');
};