import { Exercise } from '../types/Exercise';

const API_URL = 'http://localhost:3001/api/exercises';

export const getExercises = async (): Promise<Exercise[]> =>
{
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al botener ejercicios');
    return response.json();
};

export const createExercise = async (exercise: Omit<Exercise, 'id'>): Promise<Exercise> => {

    const response = await fetch(API_URL, { 
        method:'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(exercise),
    });
    if (!response.ok) throw new Error('Error al crear ejercicio');
        return response.json();

};    

export const updateExercise = async (id: number, exercise: 
    Omit<Exercise, 'id'>): Promise<Exercise> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(exercise),

        });
        if(!response.ok) throw new Error('Error al actualizar ejercicio');
            return response.json();
    };

export const deleteExercise = async (id: number):
Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',

    });
    if (!response.ok) throw new Error('Error al elemiminar ejercicio');
};