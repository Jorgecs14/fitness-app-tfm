import { WorkoutExercise, WorkoutExerciseDetail } from '../types/WorkoutExercise';

const API_URL = 'http://localhost:3001/api/workout_exercises';

export const getWorkoutExercises = async (workoutId: number): Promise<WorkoutExerciseDetail[]> => {
  const response = await fetch(`${API_URL}/workout/${workoutId}`);
  if (!response.ok) throw new Error('Error al obtener ejercicios del entrenamiento');
  return response.json();
};

export const addExerciseToWorkout = async (data: WorkoutExercise): Promise<WorkoutExercise> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al agregar ejercicio al entrenamiento');
  return response.json();
};

export const removeExerciseFromWorkout = async (linkId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${linkId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar ejercicio del entrenamiento');
};