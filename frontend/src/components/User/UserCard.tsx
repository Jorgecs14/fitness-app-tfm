import React, { useState } from 'react';
import {
  Card,
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
import {
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Shield,
  User as UserIcon,
  Activity,
  HeartPulse,
} from 'lucide-react';
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
        return { label: 'Administrador', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)' };
      case 'client':
      case 'cliente':
        return { label: 'Alumno', color: '#007AFF', bg: 'rgba(0, 122, 255, 0.15)' };
      case 'trainer':
      case 'entrenador':
        return { label: 'Entrenador', color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)' };
      default:
        return { label: role, color: 'rgba(255, 255, 255, 0.6)', bg: 'rgba(255, 255, 255, 0.08)' };
    }
  };

  const getStatusIndicator = () => {
    if (status === 'active') {
      return {
        color: '#34C759',
        text: daysAgo !== undefined ? (daysAgo === 0 ? 'Al día' : `Activo (${daysAgo}d)`) : 'Activo',
      };
    }
    if (status === 'warning') {
      return {
        color: '#FF9500',
        text: daysAgo !== undefined ? `Pendiente (${daysAgo}d)` : 'Atención',
      };
    }
    return {
      color: '#FF3B30',
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
      className="apple-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'rgba(0, 122, 255, 0.3)',
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/dashboard/users/${user.id}`)}
        sx={{ flexGrow: 1, p: 2.2, pb: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          {/* Avatar with Status Dot */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 46,
                height: 46,
                background: '#2C2C2E',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 700,
                border: '0.5px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              {getInitials(user.name, user.surname)}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: statusInfo.color,
                border: '2px solid #1C1C1E',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            <Chip
              label={roleInfo.label}
              size="small"
              sx={{
                bgcolor: roleInfo.bg,
                color: roleInfo.color,
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
              }}
            />
            <Typography variant="caption" sx={{ color: statusInfo.color, fontWeight: 600, fontSize: '0.68rem' }}>
              {statusInfo.text}
            </Typography>
          </Box>
        </Box>

        <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#FFFFFF', mb: 0.2 }}>
          {user.name} {user.surname}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.45)', display: 'block', mb: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </Typography>

        <Stack direction="row" spacing={0.8} flexWrap="wrap">
          {user.birth_date && (
            <Chip
              label={new Date(user.birth_date).toLocaleDateString('es-ES')}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.6)' }}
            />
          )}
        </Stack>
      </CardActionArea>

      <CardActions sx={{ px: 2, py: 1, borderTop: '0.5px solid rgba(255, 255, 255, 0.06)', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Ficha Médica">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/users/${user.id}/medical-info`);
              }}
              sx={{ color: 'rgba(255, 255, 255, 0.6)', '&:hover': { color: '#34C759' } }}
            >
              <HeartPulse size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Seguimiento">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/client-tracking`);
              }}
              sx={{ color: 'rgba(255, 255, 255, 0.6)', '&:hover': { color: '#AF52DE' } }}
            >
              <Activity size={16} />
            </IconButton>
          </Tooltip>
        </Stack>

        <IconButton size="small" onClick={handleMenuClick} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          <MoreVertical size={16} />
        </IconButton>
      </CardActions>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          className: 'apple-card',
          sx: { minWidth: 150, borderRadius: '12px', p: 0.5 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate(`/dashboard/users/${user.id}`);
          }}
        >
          <ListItemIcon><Eye size={16} color="#007AFF" /></ListItemIcon>
          <ListItemText primary="Ver Ficha" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEdit(user);
          }}
        >
          <ListItemIcon><Edit2 size={16} color="#FF9500" /></ListItemIcon>
          <ListItemText primary="Editar" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete(user.id);
          }}
          sx={{ color: '#FF3B30' }}
        >
          <ListItemIcon><Trash2 size={16} color="#FF3B30" /></ListItemIcon>
          <ListItemText primary="Eliminar" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: '#FF3B30' }} />
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default UserCard;
