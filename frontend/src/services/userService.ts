import { User } from '../types/User';

const API_URL = 'http://localhost:3001/api/users';

/**
 * Obtener todos los usuarios desde la API
 */
export const getUsers = async (): Promise<User[]> => {
  console.log('Frontend: Solicitando lista de usuarios');
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error al obtener usuarios');
  const data = await response.json();
  console.log(`Frontend: Recibidos ${data.length} usuarios`);
  return data;
};

/**
 * Obtener un usuario por ID
 */ 
export const getUser = async (id: number): Promise<User> => {
  console.log(`Frontend: Solicitando usuario con ID ${id}`);
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Error al obtener usuario');
  const data = await response.json();
  console.log('Frontend: Usuario recibido', data);
  return data;
};

/**
 * Crear un nuevo usuario
 */
export const createUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<User> => {
  console.log('Frontend: Creando nuevo usuario', user);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error('Error al crear usuario');
  const newUser = await response.json();
  console.log('Frontend: Usuario creado exitosamente', newUser);
  return newUser;
};

/**
 * Actualizar un usuario existente
 */
export const updateUser = async (id: number, user: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User> => {
  console.log(`Frontend: Actualizando usuario con ID ${id}`);
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error('Error al actualizar usuario');
  const updatedUser = await response.json();
  console.log('Frontend: Usuario actualizado', updatedUser);
  return updatedUser;
};

/**
 * Eliminar un usuario
 */
export const deleteUser = async (id: number): Promise<void> => {
  console.log(`Frontend: Eliminando usuario con ID ${id}`);
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar usuario');
  console.log('Frontend: Usuario eliminado exitosamente');
};