import { 
  Box,
  Badge,
  Button,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import { Iconify } from '../iconify';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationsPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function NotificationsPopover({ anchorEl, onClose }: NotificationsPopoverProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const minutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  const getNotificationColor = (type: string) => {
    const colors = { success: 'success', warning: 'warning', error: 'error' };
    return colors[type as keyof typeof colors] || 'info';
  };

  const getNotificationIcon = (notification: any) => {
    if (notification.icon) return notification.icon;
    const icons = {
      success: 'solar:check-circle-bold-duotone',
      warning: 'solar:warning-bold-duotone',
      error: 'solar:close-circle-bold-duotone',
    };
    return icons[notification.type as keyof typeof icons] || 'solar:info-circle-bold-duotone';
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ sx: { width: 380, maxHeight: 600 } }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6">Notificaciones</Typography>
          <Badge badgeContent={unreadCount} color="error">
            <Iconify icon="solar:bell-bold-duotone" width={24} />
          </Badge>
        </Stack>
        {unreadCount > 0 && (
          <Button size="small" onClick={markAllAsRead} sx={{ mb: 1 }}>
            Marcar todas como leídas
          </Button>
        )}
      </Box>

      <Divider />

      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Iconify icon="solar:bell-off-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No hay notificaciones nuevas</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  onClick={() => markAsRead(notification.id)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.main`, width: 40, height: 40 }}>
                      <Iconify icon={getNotificationIcon(notification)} width={20} sx={{ color: 'white' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600, flex: 1 }}>
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.timestamp)}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {notification.message}
                        </Typography>
                        {!notification.read && (
                          <Chip label="Nuevo" size="small" color="primary" variant="outlined" sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Popover>
  );
}
