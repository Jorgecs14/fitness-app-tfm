/**
 * Servicio para generar notificaciones del sistema en la aplicación fitness-app-tfm
 * Crea notificaciones automáticas basadas en la actividad del sistema
 */

import axiosInstance from '../lib/axios'

export interface SystemNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  icon?: string
}

export const generateSystemNotifications = async (): Promise<
  SystemNotification[]
> => {
  try {
    const [usersResponse, dietsResponse, workoutsResponse] = await Promise.all([
      axiosInstance.get('/users').catch(() => ({ data: [] })),
      axiosInstance.get('/diets').catch(() => ({ data: [] })),
      axiosInstance.get('/workouts').catch(() => ({ data: [] }))
    ])

    const users = usersResponse.data
    const diets = dietsResponse.data
    const workouts = workoutsResponse.data

    const notifications: SystemNotification[] = []
    const now = new Date()

    const recentUsers = users
      .filter((user: any) => {
        if (!user.created_at) {
          return false
        }
        const created = new Date(user.created_at)
        if (isNaN(created.getTime())) {
          return false
        }
        const diffMs = now.getTime() - created.getTime()

        return diffMs < 3 * 24 * 60 * 60 * 1000
      })
      .slice(0, 100)

    if (recentUsers.length > 0) {
      const userNames = recentUsers
        .slice(0, 3)
        .map((u: any) => u.name || 'Usuario')
        .join(', ')
      const moreCount =
        recentUsers.length > 3 ? ` y ${recentUsers.length - 3} más` : ''

      notifications.push({
        id: 'recent-users',
        title: 'Nuevos usuarios registrados',
        message: `${recentUsers.length} usuario${
          recentUsers.length > 1 ? 's' : ''
        } registrado${
          recentUsers.length > 1 ? 's' : ''
        } en los últimos 3 días: ${userNames}${moreCount}`,
        type: 'success',
        timestamp: new Date(recentUsers[0].created_at),
        read: false,
        icon: 'solar:users-group-two-rounded-bold-duotone'
      })
    }

    if (notifications.length === 0) {
      notifications.push({
        id: 'system-stats',
        title: 'Sistema Fitness App',
        message: `Sistema activo: ${users.length} usuarios, ${diets.length} dietas, ${workouts.length} entrenamientos`,
        type: 'info',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000),
        read: false,
        icon: 'solar:chart-bold-duotone'
      })

      notifications.push({
        id: 'welcome',
        title: 'Bienvenido al Dashboard',
        message:
          'Todo funcionando correctamente. Gestiona usuarios, dietas y entrenamientos desde aquí.',
        type: 'success',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
        read: false,
        icon: 'solar:shield-check-bold-duotone'
      })
    }

    return notifications.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  } catch (error) {
    return [
      {
        id: 'error',
        title: 'Error de conexión',
        message: 'No se pudo conectar al servidor',
        type: 'error',
        timestamp: new Date(),
        read: false,
        icon: 'solar:wifi-router-minimalistic-bold-duotone'
      }
    ]
  }
}
