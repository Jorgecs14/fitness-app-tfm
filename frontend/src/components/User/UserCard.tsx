import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Stack,
  Avatar,
  Box,
  CardActionArea,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { User } from '../../types/User';
import { useNavigate } from 'react-router-dom';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  status?: 'active' | 'warning' | 'urgent';
  daysAgo?: number;
}

export const UserCard = ({ user, onEdit, onDelete, status = 'active', daysAgo }: UserCardProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.35)' };
      case 'client':
      case 'cliente':
        return { label: 'Alumno', color: '#22d3ee', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.35)' };
      case 'trainer':
      case 'entrenador':
        return { label: 'Entrenador', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' };
      default:
        return { label: role, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.35)' };
    }
  };

  const getStatusIndicator = () => {
    if (status === 'active') {
      return {
        color: '#10b981',
        glow: '0 0 14px rgba(16, 185, 129, 0.6)',
        text: daysAgo !== undefined ? (daysAgo === 0 ? 'Al día (Hoy)' : `Al día (${daysAgo}d)`) : 'Activo',
      };
    }
    if (status === 'warning') {
      return {
        color: '#f59e0b',
        glow: '0 0 14px rgba(245, 158, 11, 0.6)',
        text: daysAgo !== undefined ? `Pendiente (${daysAgo}d)` : 'Atención',
      };
    }
    return {
      color: '#f43f5e',
      glow: '0 0 14px rgba(244, 63, 94, 0.6)',
      text: daysAgo !== undefined ? `Inactivo (${daysAgo}d)` : 'Inactivo',
    };
  };

  const getInitials = (name: string, surname?: string) => {
    const first = name ? name.charAt(0) : 'U';
    const second = surname ? surname.charAt(0) : '';
    return `${first}${second}`.toUpperCase();
  };

  const roleInfo = getRoleBadge(user.role);
  const statusInfo = getStatusIndicator();

  return (
    <Card
      className="liquid-glass-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.4)',
          borderColor: `${statusInfo.color}60`,
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/dashboard/users/${user.id}`)}
        sx={{ flexGrow: 1, p: 2.5, pb: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          {/* Avatar with Status Glow Ring */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                fontSize: '1.25rem',
                fontWeight: 800,
                border: `2px solid ${statusInfo.color}`,
                boxShadow: statusInfo.glow,
              }}
            >
              {getInitials(user.name, user.surname)}
            </Avatar>
            {/* Status dot */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: statusInfo.color,
                border: '2px solid #090d16',
                boxShadow: `0 0 8px ${statusInfo.color}`,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.8 }}>
            <Chip
              label={roleInfo.label}
              size="small"
              sx={{
                background: roleInfo.bg,
                color: roleInfo.color,
                border: `1px solid ${roleInfo.border}`,
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
            <Typography variant="caption" sx={{ color: statusInfo.color, fontWeight: 700, fontSize: '0.72rem' }}>
              {statusInfo.text}
            </Typography>
          </Box>
        </Box>

        {/* Name & Basic Info */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            component="h3"
            noWrap
            sx={{ fontWeight: 800, letterSpacing: '-0.01em', mb: 0.3 }}
          >
            {user.name} {user.surname}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.6 }} noWrap>
            <Iconify icon="solar:letter-bold" width={14} sx={{ color: 'text.secondary', opacity: 0.7 }} />
            {user.email}
          </Typography>
        </Box>

        {/* Biometrics / Details Summary */}
        <Stack spacing={1} sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          {user.birth_date && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:calendar-bold" width={15} sx={{ color: 'text.secondary', opacity: 0.7 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Nacimiento: {new Date(user.birth_date).toLocaleDateString('es-ES')}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:clock-circle-bold" width={15} sx={{ color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Alta: {new Date(user.created_at).toLocaleDateString('es-ES')}
            </Typography>
          </Box>
        </Stack>
      </CardActionArea>

      {/* Card Actions Footer */}
      <CardActions sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.05)', justifyContent: 'space-between' }}>
        <Tooltip title="Ficha 360° del Alumno">
          <IconButton
            size="small"
            onClick={() => navigate(`/dashboard/users/${user.id}`)}
            sx={{
              color: '#22d3ee',
              background: 'rgba(6, 182, 212, 0.1)',
              '&:hover': { background: 'rgba(6, 182, 212, 0.25)' },
            }}
          >
            <Iconify icon="solar:user-bold" width={18} />
          </IconButton>
        </Tooltip>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar Usuario">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(user);
              }}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: '#fff', background: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              <Iconify icon="solar:pen-bold" width={18} />
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: '#fff', background: 'rgba(255, 255, 255, 0.08)' },
            }}
          >
            <Iconify icon="solar:menu-dots-bold" width={18} />
          </IconButton>
        </Stack>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            className: 'liquid-glass-card',
            sx: {
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
              minWidth: 190,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate(`/dashboard/users/${user.id}`);
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:eye-bold" width={18} sx={{ color: '#22d3ee' }} />
            </ListItemIcon>
            <ListItemText primary="Ver Ficha 360°" />
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate(`/dashboard/workouts`);
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:dumbbell-large-bold" width={18} sx={{ color: '#10b981' }} />
            </ListItemIcon>
            <ListItemText primary="Asignar Rutina" />
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate(`/dashboard/diets`);
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:chef-hat-bold" width={18} sx={{ color: '#f59e0b' }} />
            </ListItemIcon>
            <ListItemText primary="Asignar Dieta" />
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleMenuClose();
              onDelete(user.id);
            }}
            sx={{ color: '#f43f5e' }}
          >
            <ListItemIcon>
              <Iconify icon="solar:trash-bin-trash-bold" width={18} sx={{ color: '#f43f5e' }} />
            </ListItemIcon>
            <ListItemText primary="Eliminar Alumno" />
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
};

export default UserCard;
