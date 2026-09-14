// Barra de pestañas inferior nativa estilo Apple iOS Tab Bar
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  User,
  Users,
  MessageSquareShare
} from 'lucide-react';

interface FloatingMobileDockProps {
  userRole?: string | null;
}

export const FloatingMobileDock: React.FC<FloatingMobileDockProps> = ({ userRole }) => {
  const location = useLocation();
  const isClient = userRole === 'client' || userRole === 'cliente';

  const clientItems = [
    {
      label: 'Inicio',
      path: '/dashboard/client-home',
      icon: Home,
    },
    {
      label: 'Rutinas',
      path: '/dashboard/workouts',
      icon: Dumbbell,
    },
    {
      label: 'Dieta',
      path: '/dashboard/client-diet',
      icon: UtensilsCrossed,
    },
    {
      label: 'Progreso',
      path: '/dashboard/submit-progress',
      icon: TrendingUp,
    },
    {
      label: 'Perfil',
      path: '/dashboard/profile',
      icon: User,
    },
  ];

  const trainerItems = [
    {
      label: 'Resumen',
      path: '/dashboard/home',
      icon: Home,
    },
    {
      label: 'Alumnos',
      path: '/dashboard/users',
      icon: Users,
    },
    {
      label: 'Rutinas',
      path: '/dashboard/workouts',
      icon: Dumbbell,
    },
    {
      label: 'Dietas',
      path: '/dashboard/diets',
      icon: UtensilsCrossed,
    },
    {
      label: 'CRM',
      path: '/dashboard/crm',
      icon: MessageSquareShare,
    },
  ];

  const items = isClient ? clientItems : trainerItems;

  return (
    <Box
      component="nav"
      className="apple-tab-bar"
      sx={{
        display: { xs: 'flex', lg: 'none' },
      }}
    >
      {items.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== '/dashboard/home' &&
            item.path !== '/dashboard/client-home' &&
            location.pathname.startsWith(item.path));

        const IconComponent = item.icon;

        return (
          <Box
            key={item.path}
            component={Link}
            to={item.path}
            className={`apple-tab-item ${isActive ? 'active' : ''}`}
            sx={{
              textDecoration: 'none',
            }}
          >
            <IconComponent
              size={22}
              strokeWidth={isActive ? 2.3 : 1.7}
              color={isActive ? '#007aff' : 'rgba(235, 235, 245, 0.5)'}
              style={{
                transition: 'color 0.15s ease, transform 0.15s ease',
                transform: isActive ? 'scale(1.05)' : 'none'
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '10px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#007aff' : 'rgba(235, 235, 245, 0.5)',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                mt: '2px',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default FloatingMobileDock;
