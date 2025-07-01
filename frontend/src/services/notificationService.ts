const API_BASE_URL = 'http://localhost:3001/api';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  icon?: string;
}

export const generateSystemNotifications = async (): Promise<SystemNotification[]> => {
  try {
    const [users, diets] = await Promise.all([
      fetch(`${API_BASE_URL}/users`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE_URL}/diets`).then(r => r.json()).catch(() => []),
    ]);

    const notifications: SystemNotification[] = [];
    const now = new Date();

    // Solo usuarios de las últimas 24 horas
    const recentUsers = users.filter((user: any) => {
      if (!user.created_at) return false;
      const created = new Date(user.created_at);
      return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000;
    }).slice(0, 2);

    recentUsers.forEach((user: any, i: number) => {
      notifications.push({
        id: `user-${user.id}`,
        title: 'Nuevo usuario',
        message: `${user.name || 'Usuario'} se registró`,
        type: 'success',
        timestamp: new Date(user.created_at),
        read: i > 0,
        icon: 'solar:user-plus-bold-duotone',
      });
    });

    // Solo dietas recientes
    const recentDiets = diets.filter((diet: any) => {
      if (!diet.created_at) return false;
      const created = new Date(diet.created_at);
      return (now.getTime() - created.getTime()) < 12 * 60 * 60 * 1000;
    }).slice(0, 1);

    recentDiets.forEach((diet: any) => {
      notifications.push({
        id: `diet-${diet.id}`,
        title: 'Nueva dieta',
        message: `"${diet.name}" creada`,
        type: 'info',
        timestamp: new Date(diet.created_at),
        read: false,
        icon: 'solar:chef-hat-bold-duotone',
      });
    });

    // Notificación de bienvenida si no hay datos recientes
    if (notifications.length === 0) {
      notifications.push({
        id: 'welcome',
        title: 'Sistema activo',
        message: 'Todo funcionando correctamente',
        type: 'success',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
        read: false,
        icon: 'solar:shield-check-bold-duotone',
      });
    }

    return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  } catch (error) {
    return [{
      id: 'error',
      title: 'Error de conexión',
      message: 'No se pudo conectar al servidor',
      type: 'error',
      timestamp: new Date(),
      read: false,
      icon: 'solar:wifi-router-minimalistic-bold-duotone',
    }];
  }
};
