import { Cliente } from '../types/Cliente';

const API_URL = 'http://localhost:3001/api/clientes';

export const getClientes = async (): Promise<Cliente[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error al obtener clientes');
  return response.json();
};

export const createCliente = async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error('Error al crear cliente');
  return response.json();
};

export const updateCliente = async (id: number, cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error('Error al actualizar cliente');
  return response.json();
};

export const deleteCliente = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar cliente');
};