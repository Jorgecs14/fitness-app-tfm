import axios from '../lib/axios';
import { ClientProgressPhoto, CreateClientProgressPhotoData } from '../types/ClientProgressPhoto';

export const clientProgressPhotoService = {
  // Obtener todas las fotos de progreso de un cliente
  getByUserId: async (userId: number): Promise<ClientProgressPhoto[]> => {
    const response = await axios.get(`/client-progress-photos/user/${userId}`);
    return response.data;
  },

  // Obtener fotos de progreso por fecha
  getByUserIdAndDate: async (userId: number, date: string): Promise<ClientProgressPhoto[]> => {
    const response = await axios.get(`/client-progress-photos/user/${userId}/date/${date}`);
    return response.data;
  },

  // Crear nueva foto de progreso
  create: async (data: CreateClientProgressPhotoData): Promise<ClientProgressPhoto> => {
    const response = await axios.post('/client-progress-photos', data);
    return response.data;
  },

  // Eliminar foto de progreso
  delete: async (id: number): Promise<void> => {
    await axios.delete(`/client-progress-photos/${id}`);
  },

  // Subir archivo de imagen
  uploadPhoto: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await axios.post('/client-progress-photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Resetear línea de base de fotos iniciales
  resetBaseline: async (userId: number, photos: CreateClientProgressPhotoData[]): Promise<ClientProgressPhoto[]> => {
    const response = await axios.post('/client-progress-photos/reset-baseline', {
      user_id: userId,
      photos,
    });
    return response.data;
  }
};

