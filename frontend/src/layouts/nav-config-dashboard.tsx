// Configuración de navegación del dashboard con iconos y rutas adaptadas por rol
import { Iconify } from '../utils/iconify'

export type NavItem = {
  title: string
  path: string
  icon: React.ReactNode
  info?: React.ReactNode
}

export const trainerNavData: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard/home',
    icon: <Iconify icon='solar:home-2-bold-duotone' width={24} />
  },
  {
    title: 'Mis Clientes',
    path: '/dashboard/users',
    icon: <Iconify icon='solar:users-group-two-rounded-bold-duotone' width={24} />
  },
  {
    title: 'CRM Clientes',
    path: '/dashboard/crm',
    icon: <Iconify icon='solar:user-speak-bold-duotone' width={24} />
  },
  {
    title: 'Seguimiento Clientes',
    path: '/dashboard/client-tracking',
    icon: <Iconify icon='solar:chart-line-duotone' width={24} />
  },
  {
    title: 'Progresos',
    path: '/dashboard/progress',
    icon: <Iconify icon='solar:chart-square-bold-duotone' width={24} />
  },
  {
    title: 'Dietas',
    path: '/dashboard/diets',
    icon: <Iconify icon='solar:chef-hat-bold-duotone' width={24} />
  },
  {
    title: 'Entrenamientos',
    path: '/dashboard/workouts',
    icon: <Iconify icon='solar:dumbbell-bold-duotone' width={24} />
  },
  {
    title: 'Productos',
    path: '/dashboard/products',
    icon: <Iconify icon='solar:bag-4-bold-duotone' width={24} />
  },
  {
    title: 'Perfil',
    path: '/dashboard/profile',
    icon: <Iconify icon='solar:user-circle-bold-duotone' width={24} />
  }
]

export const clientNavData: NavItem[] = [
  {
    title: 'Mi Panel',
    path: '/dashboard/client-home',
    icon: <Iconify icon='solar:home-2-bold-duotone' width={24} />
  },
  {
    title: 'Mis Rutinas',
    path: '/dashboard/workouts',
    icon: <Iconify icon='solar:dumbbell-bold-duotone' width={24} />
  },
  {
    title: 'Mi Dieta',
    path: '/dashboard/client-diet',
    icon: <Iconify icon='solar:chef-hat-bold-duotone' width={24} />
  },
  {
    title: 'Subir Progreso',
    path: '/dashboard/submit-progress',
    icon: <Iconify icon='solar:camera-add-bold-duotone' width={24} />
  },
  {
    title: 'Productos',
    path: '/dashboard/products',
    icon: <Iconify icon='solar:bag-4-bold-duotone' width={24} />
  },
  {
    title: 'Perfil',
    path: '/dashboard/profile',
    icon: <Iconify icon='solar:user-circle-bold-duotone' width={24} />
  }
]

export const navData = trainerNavData

export function getNavDataByRole(role?: string): NavItem[] {
  if (role === 'client' || role === 'cliente') {
    return clientNavData
  }
  return trainerNavData
}

