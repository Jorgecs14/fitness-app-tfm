/**
 * Configuración de Axios con interceptor para autenticación automática
 * Agrega automáticamente el token JWT de Neon DB a todas las requests
 */

import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/sign-in'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

