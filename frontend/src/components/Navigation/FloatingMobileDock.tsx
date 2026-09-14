import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { Iconify } from '../../utils/iconify';

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
      icon: 'solar:home-2-bold-duotone',
    },
    {
      label: 'Rutinas',
      path: '/dashboard/workouts',
      icon: 'solar:dumbbell-bold-duotone',
    },
    {
      label: 'Dieta',
      path: '/dashboard/client-diet',
      icon: 'solar:chef-hat-bold-duotone',
    },
    {
      label: 'Progreso',
      path: '/dashboard/submit-progress',
      icon: 'solar:camera-add-bold-duotone',
    },
    {
      label: 'Perfil',
      path: '/dashboard/profile',
      icon: 'solar:user-circle-bold-duotone',
    },
  ];

  const trainerItems = [
    {
      label: 'Cockpit',
      path: '/dashboard/home',
      icon: 'solar:home-2-bold-duotone',
    },
    {
      label: 'Alumnos',
      path: '/dashboard/users',
      icon: 'solar:users-group-two-rounded-bold-duotone',
    },
    {
      label: 'Rutinas',
      path: '/dashboard/workouts',
      icon: 'solar:dumbbell-bold-duotone',
    },
    {
      label: 'Dietas',
      path: '/dashboard/diets',
      icon: 'solar:chef-hat-bold-duotone',
    },
    {
      label: 'CRM',
      path: '/dashboard/crm',
      icon: 'solar:user-speak-bold-duotone',
    },
  ];

  const items = isClient ? clientItems : trainerItems;

  return (
    <Box
      className="liquid-floating-dock"
      sx={{
        display: { xs: 'flex', lg: 'none' },
        gap: { xs: 0.5, sm: 1.5 },
      }}
    >
      {items.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== '/dashboard/home' &&
            item.path !== '/dashboard/client-home' &&
            location.pathname.startsWith(item.path));

        return (
          <Box
            key={item.path}
            component={Link}
            to={item.path}
            className={`liquid-dock-item ${isActive ? 'active' : ''}`}
            sx={{
              py: 0.8,
              px: { xs: 1.2, sm: 1.8 },
            }}
          >
            <Iconify
              icon={item.icon}
              width={22}
              sx={{
                color: isActive ? '#22d3ee' : '#94a3b8',
                transition: 'all 0.25s ease',
                transform: isActive ? 'translateY(-1px) scale(1.1)' : 'none',
                filter: isActive ? 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))' : 'none',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 800 : 500,
                color: isActive ? '#22d3ee' : '#94a3b8',
                mt: 0.3,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
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
