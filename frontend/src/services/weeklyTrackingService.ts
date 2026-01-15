import axios from '../lib/axios';
import { WeeklyTracking, CreateWeeklyTrackingData, UpdateWeeklyTrackingData } from '../types/WeeklyTracking';

export const weeklyTrackingService = {
  // Obtener todos los seguimientos semanales de un cliente
  getByUserId: async (userId: number): Promise<WeeklyTracking[]> => {
    const response = await axios.get(`/weekly-tracking/user/${userId}`);
    return response.data;
  },

  // Obtener seguimiento semanal por fecha específica
  getByUserIdAndDate: async (userId: number, weekStartDate: string): Promise<WeeklyTracking | null> => {
    try {
      const response = await axios.get(`/weekly-tracking/user/${userId}/week/${weekStartDate}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Crear nuevo seguimiento semanal
  create: async (data: CreateWeeklyTrackingData): Promise<WeeklyTracking> => {
    const response = await axios.post('/weekly-tracking', data);
    return response.data;
  },

  // Actualizar seguimiento semanal
  update: async (id: number, data: UpdateWeeklyTrackingData): Promise<WeeklyTracking> => {
    const response = await axios.put(`/weekly-tracking/${id}`, data);
    return response.data;
  },

  // Eliminar seguimiento semanal
  delete: async (id: number): Promise<void> => {
    await axios.delete(`/weekly-tracking/${id}`);
  },

  // Subir foto de peso
  uploadWeightPhoto: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('weightPhoto', file);
    
    const response = await axios.post('/weekly-tracking/upload-weight-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
