/**
 * Servicio para consumir las APIs del historial de sesiones de entrenamiento (Logged Sessions)
 */

import axiosInstance from '../lib/axios'

export interface LoggedSetData {
  id?: number;
  exercise_id: number;
  set_order: number;
  phase?: 'work' | 'warmup';
  type?: 'straight' | 'dropset' | 'restpause';
  weight: number;
  reps: number;
  rpe?: number;
  completed?: boolean;
  extra_data?: any;
  exercises?: {
    id: number;
    name: string;
    body_part?: string;
    target_muscle?: string;
    gif_url?: string;
    image_url?: string;
  };
}

export interface LoggedSessionData {
  id?: number;
  user_id: number;
  workout_id?: number;
  name: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  notes?: string;
  rating?: number;
  logged_sets?: LoggedSetData[];
  sets?: LoggedSetData[];
}

export const createLoggedSession = async (sessionData: LoggedSessionData): Promise<LoggedSessionData> => {
  try {
    const response = await axiosInstance.post('/logged-sessions', sessionData)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al guardar la sesión de entrenamiento')
  }
}

export const getUserLoggedSessions = async (userId: number): Promise<LoggedSessionData[]> => {
  try {
    const response = await axiosInstance.get(`/logged-sessions/user/${userId}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al consultar las sesiones del usuario')
  }
}

export const getLoggedSessionById = async (id: number): Promise<LoggedSessionData> => {
  try {
    const response = await axiosInstance.get(`/logged-sessions/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener detalle de la sesión')
  }
}

export const deleteLoggedSession = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/logged-sessions/${id}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar la sesión')
  }
}
