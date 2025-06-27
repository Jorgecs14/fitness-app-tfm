import { Workout } from '../types/Workout';
import { SelectedExercise } from '../types/WorkoutExercise';
import { WorkoutWithExercises } from '../types/WorkoutWithExercises';

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

export const getWorkoutWithExercises = async (id: number): Promise<WorkoutWithExercises> => {
  const response = await fetch(`${API_URL}/${id}/details`);
  if (!response.ok) {
    throw new Error('Error al obtener entrenamiento con ejercicios');
  }
  return await response.json();
};

export const getWorkoutDetails = async (id: number): Promise<WorkoutWithExercises> => {
  const response = await fetch(`${API_URL}/${id}/details`);
  if (!response.ok) {
    throw new Error('No se pudieron cargar los detalles del entrenamiento');
  }
  return await response.json();
};

export const addExercisesToWorkout = async (
  workoutId: number,
  exercises: SelectedExercise[]
) => {
  const payload = exercises.map((ex) => ({
    workout_id: workoutId,
    ...ex
  }));

  const response = await fetch('http://localhost:3001/api/workouts_exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Error al guardar ejercicios del entrenamiento');
  }
};

export const removeAllExercisesFromWorkout = async (workoutId: number): Promise<void> => {
  const response = await fetch(`http://localhost:3001/api/workouts_exercises/workout/${workoutId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Error al eliminar ejercicios del entrenamiento');
  }
};