import { Food } from '../types/Food';

const API_URL = 'http://localhost:3001/api/foods';

export const getFoods = async (): Promise<Food[]> =>
{
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener alimentos');
    return response.json();
};

export const createFood = async (food: Omit<Food, 'id'>): Promise<Food> => {

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(food),
    });
    if (!response.ok) throw new Error('Error al crear alimento');
    return response.json();

};    

export const updateFood = async (id: number, food: Omit<Food, 'id'>): Promise<Food> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(food),

    });
    if(!response.ok) throw new Error('Error al actualizar alimento');
    return response.json();
};

export const deleteFood = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',

    });
    if (!response.ok) throw new Error('Error al eliminar alimento');
};