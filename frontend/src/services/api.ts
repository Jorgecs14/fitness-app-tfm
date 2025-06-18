import { Client } from '../types/Client';
import { Diet } from '../types/Diet';

const API_URL = 'http://localhost:3001/api/clients';
const DIETS_API_URL = 'http://localhost:3001/api/diets';

export const getClients = async (): Promise<Client[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error al obtener clientes');
  return response.json();
};

export const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error('Error al crear cliente');
  return response.json();
};

export const updateClient = async (id: number, client: Omit<Client, 'id'>): Promise<Client> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error('Error al actualizar cliente');
  return response.json();
};

export const deleteClient = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar cliente');
};

export const getDiets = async (): Promise<Diet[]> => {
  const response = await fetch(DIETS_API_URL);
  if (!response.ok) throw new Error('Error al obtener dietas');
  return response.json();
};

export const createDiet = async (diet: Omit<Diet, 'id'>): Promise<Diet> => {
  const response = await fetch(DIETS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diet),
  });
  if (!response.ok) throw new Error('Error al crear dieta');
  return response.json();
};

export const updateDiet = async (id: number, diet: Omit<Diet, 'id'>): Promise<Diet> => {
  const response = await fetch(`${DIETS_API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(diet),
  });
  if (!response.ok) throw new Error('Error al actualizar dieta');
  return response.json();
};

export const deleteDiet = async (id: number): Promise<void> => {
  const response = await fetch(`${DIETS_API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar dieta');
};