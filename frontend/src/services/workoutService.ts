import { Workout } from '../types/Workout';

const API_URL = 'http://localhost:3001/api/workouts';

export const getWorkouts = async (): Promise<Workout[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Error al obtener entrenamientos');
  return response.json();
};

export const createWorkout = async (workout: Omit<Workout, 'id'>): Promise<Workout> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workout),
  });
  if (!response.ok) throw new Error('Error al crear entrenamiento');
  return response.json();
};

export const updateWorkout = async (id: number, workout: Omit<Workout, 'id'>): Promise<Workout> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workout),
  });
  if (!response.ok) throw new Error('Error al actualizar entrenamiento');
  return response.json();
};

export const deleteWorkout = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar entrenamiento');
};