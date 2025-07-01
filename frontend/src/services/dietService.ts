import { Diet } from '../types/Diet';

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

export const getDietUsers = async (dietId: number): Promise<any[]> => {
  const response = await fetch(`${API_URL}/${dietId}/users`);
  if (!response.ok) throw new Error('Error al obtener usuarios de la dieta');
  return response.json();
};

export const assignUserToDiet = async (dietId: number, userId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${dietId}/users/${userId}`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al asignar usuario');
  }
};

export const removeUserFromDiet = async (dietId: number, userId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${dietId}/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al remover usuario de la dieta');
};