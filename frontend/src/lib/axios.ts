/**
 * Configuración de Axios con interceptor para autenticación automática
 * Agrega automáticamente el token JWT de Supabase a todas las requests y maneja errores de autenticación
 */

import axios from 'axios'
import { supabase } from './supabase'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (error) {
        return config
      }

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }

      return config
    } catch (error) {
      return config
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const {
          data: { session },
          error: refreshError
        } = await supabase.auth.refreshSession()

        if (refreshError || !session) {
          window.location.href = '/sign-in'
          return Promise.reject(error)
        }

        originalRequest.headers.Authorization = `Bearer ${session.access_token}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        window.location.href = '/sign-in'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
