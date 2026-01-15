import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '../utils/iconify';
import { getUsers } from '../services/userService';
import { User } from '../types/User';

const CrmPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await getUsers();
      // Filtrar solo clientes
      const clients = userData.filter(user => user.role === 'client');
      setUsers(clients);
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClientDetails = (userId: number) => {
    navigate(`/dashboard/users/${userId}`);
  };

  const handleViewMedicalInfo = (userId: number) => {
    navigate(`/dashboard/users/${userId}/medical-info`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando clientes...</Typography>
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
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          <Iconify icon="solar:clipboard-list-bold-duotone" sx={{ mr: 2, verticalAlign: 'middle' }} />
          CRM - Gestión de Clientes
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Administra la información médica, fotos de progreso y seguimiento de tus clientes
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box display="flex" gap={3} mb={4} flexWrap="wrap">
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Clientes
                </Typography>
                <Typography variant="h4">
                  {users.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Iconify icon="solar:users-group-two-rounded-bold-duotone" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Clientes Activos
                </Typography>
                <Typography variant="h4">
                  {users.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Iconify icon="solar:check-circle-bold-duotone" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Seguimientos Esta Semana
                </Typography>
                <Typography variant="h4">
                  0
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Iconify icon="solar:calendar-date-bold-duotone" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Fotos de Progreso
                </Typography>
                <Typography variant="h4">
                  0
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Iconify icon="solar:camera-bold-duotone" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Client List */}
      <Box display="flex" gap={3} flexWrap="wrap">
        <Paper sx={{ flex: 2, minWidth: 600 }}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Lista de Clientes
            </Typography>
            
            {users.length === 0 ? (
              <Alert severity="info">
                No hay clientes registrados en el sistema.
              </Alert>
            ) : (
              <List>
                {users.map((user, index) => (
                  <Box key={user.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.name} ${user.surname}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Chip
                              label={user.role}
                              size="small"
                              color="primary"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="solar:user-bold-duotone" />}
                          onClick={() => handleViewClientDetails(user.id)}
                        >
                          Perfil
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon="solar:health-bold-duotone" />}
                          onClick={() => handleViewMedicalInfo(user.id)}
                        >
                          Médica
                        </Button>
                      </Box>
                    </ListItem>
                    {index < users.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </Paper>

        <Paper sx={{ flex: 1, minWidth: 300 }}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Acciones Rápidas
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Información Médica
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gestiona alergias, intolerancias y condiciones médicas de los clientes
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Iconify icon="solar:health-bold-duotone" />}>
                    Gestionar
                  </Button>
                </CardActions>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Fotos de Progreso
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Visualiza y administra las fotos de progreso de los clientes
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Iconify icon="solar:camera-bold-duotone" />}>
                    Ver Fotos
                  </Button>
                </CardActions>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Seguimiento Semanal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revisa el progreso semanal de medidas y entrenamientos
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Iconify icon="solar:calendar-date-bold-duotone" />}>
                    Ver Seguimiento
                  </Button>
                </CardActions>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Análisis Mensual
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Analiza el progreso mensual y establece nuevos objetivos
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Iconify icon="solar:chart-bold-duotone" />}>
                    Ver Análisis
                  </Button>
                </CardActions>
              </Card>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CrmPage;
