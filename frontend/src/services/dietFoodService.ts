import { SelectedFood } from '../types/DietFood';

const API_URL = 'http://localhost:3001/api/diet_foods';

export const getDietFoods = async (dietId: number) => {
  const response = await fetch(`${API_URL}/diet/${dietId}`);
  if (!response.ok) throw new Error('Error al obtener alimentos de la dieta');
  return response.json();
};

export const addFoodsToDiet = async (dietId: number, foods: SelectedFood[]) => {
  const payload = foods.map(f => ({
    diet_id: dietId,
    ...f
  }));
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Error al agregar alimentos a la dieta');
  return response.json();
};

export const removeAllFoodsFromDiet = async (dietId: number) => {
  const response = await fetch(`${API_URL}/diet/${dietId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Error al eliminar alimentos de la dieta');
};