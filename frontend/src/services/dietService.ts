import { Diet } from '../types/Diet';
import { DietWithFoods } from '../types/DietWithFoods';

const API_URL = 'http://localhost:3001/api/diets';

export const getDiets = async (): Promise<Diet[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error al obtener dietas');
  return response.json();
};

export const createDiet = async (diet: Omit<Diet, 'id'>): Promise<Diet> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diet),
  });
  if (!response.ok) throw new Error('Error al crear dieta');
  return response.json();
};

export const updateDiet = async (id: number, diet: Omit<Diet, 'id'>): Promise<Diet> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diet),
  });
  if (!response.ok) throw new Error('Error al actualizar dieta');
  return response.json();
};

export const deleteDiet = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar dieta');
};

export const getDietWithFoods = async (id: number): Promise<DietWithFoods> => {
  const response = await fetch(`${API_URL}/${id}/foods`);
  if (!response.ok) throw new Error('Error al obtener dieta con alimentos');
  return response.json();
};

export const addFoodToDiet = async (dietId: number, food_id: number, quantity: number) => {
  const response = await fetch(`http://localhost:3001/api/diets/${dietId}/foods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ food_id, quantity }),
  });
  if (!response.ok) throw new Error('Error al agregar alimento a la dieta');
  return response.json();
};