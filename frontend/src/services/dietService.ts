import { Diet } from '../types/Diet';
import axiosInstance from '../lib/axios';

export const getDiets = async (): Promise<Diet[]> => {
  try {
    const response = await axiosInstance.get('/diets');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener dietas:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al obtener dietas');
  }
};

export const createDiet = async (diet: Omit<Diet, 'id'>): Promise<Diet> => {
  try {
    const response = await axiosInstance.post('/diets', diet);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear dieta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al crear dieta');
  }
};

export const updateDiet = async (id: number, diet: Omit<Diet, 'id'>): Promise<Diet> => {
  try {
    const response = await axiosInstance.put(`/diets/${id}`, diet);
    return response.data;
  } catch (error: any) {
    console.error('Error al actualizar dieta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al actualizar dieta');
  }
};

export const deleteDiet = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/diets/${id}`);
  } catch (error: any) {
    console.error('Error al eliminar dieta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al eliminar dieta');
  }
};

export const getDietUsers = async (dietId: number): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(`/diets/${dietId}/users`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener usuarios de la dieta:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al obtener usuarios de la dieta');
  }
};

export const assignUserToDiet = async (dietId: number, userId: number): Promise<void> => {
  try {
    await axiosInstance.post(`/diets/${dietId}/users/${userId}`);
  } catch (error: any) {
    console.error('Error al asignar usuario:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al asignar usuario');
  }
};

export const removeUserFromDiet = async (dietId: number, userId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/diets/${dietId}/users/${userId}`);
  } catch (error: any) {
    console.error('Error al remover usuario:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al remover usuario');
  }
};
