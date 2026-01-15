import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Paper,
  Alert,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '../utils/iconify';
import { getUsers } from '../services/userService';
import { weeklyTrackingService } from '../services/weeklyTrackingService';
import { User } from '../types/User';

interface UserProgress {
  user: User;
  lastProgressDate: string | null;
  daysAgo: number;
}

const ProgressPage = () => {
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsersProgress();
  }, []);

  const loadUsersProgress = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      
      // Filtrar solo clientes
      const clients = users.filter(user => user.role === 'client');
      
      // Obtener la fecha del último progreso para cada cliente
      const progressPromises = clients.map(async (user) => {
        try {
          const weeklyData = await weeklyTrackingService.getByUserId(user.id);
          
          let lastProgressDate = null;
          let daysAgo = 0;
          
          if (weeklyData && weeklyData.length > 0) {
            // Obtener la fecha más reciente
            const sortedData = weeklyData.sort((a, b) => 
              new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
            );
            lastProgressDate = sortedData[0].week_start_date;
            
            // Calcular días desde el último progreso
            const lastDate = new Date(lastProgressDate);
            const today = new Date();
            daysAgo = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          }
          
          return {
            user,
            lastProgressDate,
            daysAgo
          };
        } catch (error) {
          console.error(`Error loading progress for user ${user.id}:`, error);
          return {
            user,
            lastProgressDate: null,
            daysAgo: 0
          };
        }
      });
      
      const progressData = await Promise.all(progressPromises);
      
      // Ordenar por días desde el último progreso (más reciente primero)
      progressData.sort((a, b) => {
        if (a.lastProgressDate === null && b.lastProgressDate === null) return 0;
        if (a.lastProgressDate === null) return 1;
        if (b.lastProgressDate === null) return -1;
        return a.daysAgo - b.daysAgo;
      });
      
      setUserProgress(progressData);
    } catch (err) {
      setError('Error al cargar los progresos de los clientes');
      console.error('Error loading user progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetail = (userId: number) => {
    navigate(`/dashboard/users/${userId}`);
  };

  const getProgressStatusColor = (daysAgo: number, hasProgress: boolean) => {
    if (!hasProgress) return 'default';
    if (daysAgo <= 7) return 'success';
    if (daysAgo <= 14) return 'warning';
    return 'error';
  };

  const getProgressStatusText = (daysAgo: number, hasProgress: boolean) => {
    if (!hasProgress) return 'Sin progreso';
    if (daysAgo === 0) return 'Hoy';
    if (daysAgo === 1) return 'Ayer';
    if (daysAgo <= 7) return `Hace ${daysAgo} días`;
    if (daysAgo <= 30) return `Hace ${daysAgo} días`;
    return `Hace ${Math.floor(daysAgo / 30)} meses`;
  };

  const formatLastProgressDate = (date: string | null) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando progresos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Progresos de Clientes
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:refresh-bold" />}
          onClick={loadUsersProgress}
        >
          Actualizar
        </Button>
      </Box>

      <Paper elevation={1}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Clientes y su Último Progreso
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Haz clic en un cliente para ver sus detalles completos y gestionar su progreso
          </Typography>

          {userProgress.length === 0 ? (
            <Alert severity="info">
              No hay clientes registrados en el sistema.
            </Alert>
          ) : (
            <List>
              {userProgress.map((progress, index) => (
                <div key={progress.user.id}>
                  <ListItem
                    component="div"
                    onClick={() => handleViewUserDetail(progress.user.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {progress.user.name.charAt(0).toUpperCase()}
                        {progress.user.surname.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {progress.user.name} {progress.user.surname}
                          </Typography>
                          <Chip
                            size="small"
                            label={progress.user.role}
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {progress.user.email}
                        </Typography>
                      }
                    />
                    
                    <Box textAlign="right">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Último progreso
                      </Typography>
                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          {formatLastProgressDate(progress.lastProgressDate)}
                        </Typography>
                        <Chip
                          size="small"
                          label={getProgressStatusText(progress.daysAgo, progress.lastProgressDate !== null)}
                          color={getProgressStatusColor(progress.daysAgo, progress.lastProgressDate !== null)}
                          variant="filled"
                        />
                      </Box>
                    </Box>
                    
                    <Box ml={2}>
                      <Iconify 
                        icon="solar:alt-arrow-right-bold" 
                        width={20} 
                        sx={{ color: 'text.secondary' }}
                      />
                    </Box>
                  </ListItem>
                  
                  {index < userProgress.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leyenda de Estados
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={1}>
                <Chip size="small" label="Actualizado" color="success" />
                <Typography variant="body2">Últimos 7 días</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip size="small" label="Atención" color="warning" />
                <Typography variant="body2">8-14 días</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip size="small" label="Urgente" color="error" />
                <Typography variant="body2">Más de 14 días</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip size="small" label="Sin progreso" color="default" />
                <Typography variant="body2">Nunca ha subido progreso</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ProgressPage;
