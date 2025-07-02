import { Diet } from '../types/Diet';
import { DietWithFoods } from '../types/DietWithFoods';
import { DietFood } from '../types/DietFood';

const API_URL = 'http://localhost:3001/api/diets';

// Obtener todas las dietas
export const getDiets = async (): Promise<Diet[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error al obtener dietas');
  return response.json();
};

// Obtener todas las dietas con alimentos
export const getDietsWithFoods = async (): Promise<DietWithFoods[]> => {
  const response = await fetch(`${API_URL}/with-foods`);
  if (!response.ok) throw new Error('Error al obtener dietas con alimentos');
  return response.json();
};

// Obtener detalles de una dieta (con alimentos)
export const getDietWithFoods = async (id: number): Promise<DietWithFoods> => {
  const response = await fetch(`${API_URL}/${id}/details`);
  if (!response.ok) throw new Error('No se pudieron cargar los detalles de la dieta');
  return response.json();
};

// Crear dieta
export const createDiet = async (diet: Omit<Diet, 'id'>): Promise<Diet> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diet),
  });
  if (!response.ok) throw new Error('Error al crear dieta');
  return response.json();
};

// Actualizar dieta
export const updateDiet = async (id: number, diet: Omit<Diet, 'id'>): Promise<Diet> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diet),
  });
  if (!response.ok) throw new Error('Error al actualizar dieta');
  return response.json();
};

// Eliminar dieta
export const deleteDiet = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar dieta');
};

// Añadir alimentos a una dieta (relación dieta-alimentos)
export const addFoodsToDiet = async (
  dietId: number,
  foods: DietFood[]
) => {
  const payload = foods.map((food) => ({
    ...food,
    diet_id: dietId
  }));

  const response = await fetch('http://localhost:3001/api/diet_foods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Error al guardar alimentos de la dieta');
  }
};

// Eliminar todos los alimentos de una dieta
export const removeAllFoodsFromDiet = async (dietId: number): Promise<void> => {
  const response = await fetch(`http://localhost:3001/api/diet_foods/diet/${dietId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Error al eliminar alimentos de la dieta');
  }
};

// Obtener usuarios asignados a una dieta
export const getDietUsers = async (dietId: number) => {
  const response = await fetch(`http://localhost:3001/api/diets/${dietId}/users`);
  if (!response.ok) throw new Error('Error al obtener usuarios de la dieta');
  return response.json();
};

// Asignar usuario a dieta
export const assignUserToDiet = async (dietId: number, userId: number) => {
  const response = await fetch(`http://localhost:3001/api/diets/${dietId}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error('Error al asignar usuario a la dieta');
  return response.json();
};

// Quitar usuario de dieta
export const removeUserFromDiet = async (dietId: number, userId: number) => {
  const response = await fetch(`http://localhost:3001/api/diets/${dietId}/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al quitar usuario de la dieta');
  return response.json();
};