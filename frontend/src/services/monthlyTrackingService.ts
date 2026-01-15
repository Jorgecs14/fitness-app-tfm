import axios from '../lib/axios';
import { MonthlyTracking, CreateMonthlyTrackingData, UpdateMonthlyTrackingData } from '../types/MonthlyTracking';

export const monthlyTrackingService = {
  // Obtener todos los seguimientos mensuales de un cliente
  getByUserId: async (userId: number): Promise<MonthlyTracking[]> => {
    const response = await axios.get(`/monthly-tracking/user/${userId}`);
    return response.data;
  },

  // Obtener seguimiento mensual por fecha específica
  getByUserIdAndDate: async (userId: number, monthDate: string): Promise<MonthlyTracking | null> => {
    try {
      const response = await axios.get(`/monthly-tracking/user/${userId}/month/${monthDate}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Crear nuevo seguimiento mensual
  create: async (data: CreateMonthlyTrackingData): Promise<MonthlyTracking> => {
    const response = await axios.post('/monthly-tracking', data);
    return response.data;
  },

  // Actualizar seguimiento mensual
  update: async (id: number, data: UpdateMonthlyTrackingData): Promise<MonthlyTracking> => {
    const response = await axios.put(`/monthly-tracking/${id}`, data);
    return response.data;
  },

  // Eliminar seguimiento mensual
  delete: async (id: number): Promise<void> => {
    await axios.delete(`/monthly-tracking/${id}`);
  }
};
