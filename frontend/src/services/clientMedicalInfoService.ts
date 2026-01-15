import axios from '../lib/axios';
import { ClientMedicalInfo, CreateClientMedicalInfoData, UpdateClientMedicalInfoData } from '../types/ClientMedicalInfo';

export const clientMedicalInfoService = {
  // Obtener información médica de un cliente
  getByUserId: async (userId: number): Promise<ClientMedicalInfo | null> => {
    try {
      const response = await axios.get(`/client-medical-info/user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Crear información médica inicial para un cliente
  create: async (data: CreateClientMedicalInfoData): Promise<ClientMedicalInfo> => {
    const response = await axios.post('/client-medical-info', data);
    return response.data;
  },

  // Actualizar información médica de un cliente
  update: async (id: number, data: UpdateClientMedicalInfoData): Promise<ClientMedicalInfo> => {
    const response = await axios.put(`/client-medical-info/${id}`, data);
    return response.data;
  },

  // Eliminar información médica de un cliente
  delete: async (id: number): Promise<void> => {
    await axios.delete(`/client-medical-info/${id}`);
  }
};
