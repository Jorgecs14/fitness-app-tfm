import { Client } from '../types/Client';

const API_URL = 'http://localhost:3001/api/clients';

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

export function deleteWorkout(id: number) {
  throw new Error('Function not implemented.');
}
export function createWorkout(workoutData: Omit<Workout, "id">) {
  throw new Error('Function not implemented.');
}

export function updateWorkout(id: number, workoutData: Omit<Workout, "id">) {
  throw new Error('Function not implemented.');
}

