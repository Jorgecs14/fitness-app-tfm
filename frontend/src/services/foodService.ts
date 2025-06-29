import { Food } from '../types/Food';

const API_URL = 'http://localhost:3001/api/foods';

export const getFoods = async (): Promise<Food[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener alimentos');
  return await res.json();
};

export const createFood = async (food: Omit<Food, 'id'>): Promise<Food> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(food),
  });
  if (!res.ok) throw new Error('Error al crear alimento');
  return await res.json();
};