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
  MessageSquareShare,
  Sparkles,
} from 'lucide-react';

interface FloatingMobileDockProps {
  userRole?: string | null;
  onOpenChat?: () => void;
}

export const FloatingMobileDock: React.FC<FloatingMobileDockProps> = ({
  userRole,
  onOpenChat,
}) => {
  const location = useLocation();
  
  let effectiveRole = userRole;
  if (!effectiveRole) {
    try {
      const cached = localStorage.getItem('user');
      if (cached) {
        const parsed = JSON.parse(cached);
        effectiveRole = parsed.role;
      }
    } catch {}
  }

  const isTrainer = effectiveRole === 'trainer' || effectiveRole === 'entrenador' || effectiveRole === 'admin';
  const isClient = !isTrainer;

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
      label: 'Chat',
      isAction: true,
      onClick: onOpenChat,
      icon: MessageSquareShare,
      highlight: true,
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
      label: 'Clientes',
      path: '/dashboard/crm',
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
      label: 'Progresos',
      path: '/dashboard/progress',
      icon: TrendingUp,
    },
    {
      label: 'Chat IA',
      isAction: true,
      onClick: onOpenChat,
      icon: Sparkles,
      highlight: true,
    },
    {
      label: 'Perfil',
      path: '/dashboard/profile',
      icon: User,
    },
  ];

  const items = isClient ? clientItems : trainerItems;

  return (
    <Box
      component="nav"
      className="apple-tab-bar"
      sx={{
        display: { xs: 'flex', lg: 'none' },
        justifyContent: 'space-around',
        px: 0.5,
      }}
    >
      {items.map((item, index) => {
        const IconComponent = item.icon;

        if (item.isAction) {
          return (
            <Box
              key={`action-${index}`}
              component="button"
              onClick={item.onClick}
              className="apple-tab-item"
              sx={{
                background: 'none',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 0,
                flex: 1,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComponent
                  size={20}
                  strokeWidth={2}
                  color="#007AFF"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(0, 122, 255, 0.4))',
                    transition: 'transform 0.15s ease',
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '9.5px',
                  fontWeight: 600,
                  color: '#007AFF',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                  mt: '2px',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        }

        const isActive =
          location.pathname === item.path ||
          (item.path !== '/dashboard/home' &&
            item.path !== '/dashboard/client-home' &&
            item.path &&
            location.pathname.startsWith(item.path));

        return (
          <Box
            key={item.path}
            component={Link}
            to={item.path!}
            className={`apple-tab-item ${isActive ? 'active' : ''}`}
            sx={{
              textDecoration: 'none',
              minWidth: 0,
              flex: 1,
            }}
          >
            <IconComponent
              size={20}
              strokeWidth={isActive ? 2.3 : 1.7}
              color={isActive ? '#007AFF' : 'rgba(235, 235, 245, 0.5)'}
              style={{
                transition: 'color 0.15s ease, transform 0.15s ease',
                transform: isActive ? 'scale(1.05)' : 'none',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '9.5px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#007AFF' : 'rgba(235, 235, 245, 0.5)',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                mt: '2px',
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
