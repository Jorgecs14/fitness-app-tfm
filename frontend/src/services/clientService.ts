import { Client } from '../types/Client';

// Backend API endpoint
const API_URL = 'http://localhost:3001/api/clients';

/**
 * Fetch all clients from the API
 * @returns Promise with array of clients
 */
export const getClients = async (): Promise<Client[]> => {
  console.log('Frontend: Solicitando lista de clientes');
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error al obtener clientes');
  const data = await response.json();
  console.log(`Frontend: Recibidos ${data.length} clientes`);
  return data;
};

/**
 * Create a new client
 * @param client - Client data without ID
 * @returns Promise with the created client
 */
export const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
  console.log('Frontend: Creando nuevo cliente', client);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error('Error al crear cliente');
  const newClient = await response.json();
  console.log('Frontend: Cliente creado exitosamente', newClient);
  return newClient;
};

/**
 * Update existing client
 * @param id - Client ID to update
 * @param client - New client data
 * @returns Promise with updated client
 */
export const updateClient = async (id: number, client: Omit<Client, 'id'>): Promise<Client> => {
  console.log(`Frontend: Actualizando cliente con ID ${id}`);
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error('Error al actualizar cliente');
  const updatedClient = await response.json();
  console.log('Frontend: Cliente actualizado', updatedClient);
  return updatedClient;
};

/**
 * Delete a client
 * @param id - Client ID to delete
 */
export const deleteClient = async (id: number): Promise<void> => {
  console.log(`Frontend: Eliminando cliente con ID ${id}`);
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar cliente');
  console.log('Frontend: Cliente eliminado exitosamente');
};