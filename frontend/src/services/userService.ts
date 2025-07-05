/**
 * Servicio para gestionar usuarios en la aplicación fitness-app-tfm
 * Proporciona métodos para CRUD de usuarios y gestión del usuario actual autenticado
 */

import { User } from '../types/User'
import axiosInstance from '../lib/axios'
import { supabase } from '../lib/supabase'

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axiosInstance.get('/users')
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al obtener usuarios'
    )
  }
}

export const getUser = async (id: number): Promise<User> => {
  try {
    const response = await axiosInstance.get(`/users/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener usuario')
  }
}

export const createUser = async (
  user: Omit<User, 'id' | 'created_at'>
): Promise<User> => {
  try {
    const response = await axiosInstance.post('/users', user)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear usuario')
  }
}

export const updateUser = async (
  id: number,
  user: Partial<Omit<User, 'id' | 'created_at'>>
): Promise<User> => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, user)
    return response.data
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al actualizar usuario'
    )
  }
}

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/users/${id}`)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Error al eliminar usuario'
    )
  }
}

export const getCurrentUser = async (): Promise<User> => {
  try {
    const {
      data: { user: authUser },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      throw new Error('No hay usuario autenticado. Por favor, inicia sesión.')
    }

    const response = await axiosInstance.get('/users/profile')
    return response.data
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('No estás autenticado. Por favor, inicia sesión.')
    }
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Error al obtener usuario actual'
    )
  }
}
