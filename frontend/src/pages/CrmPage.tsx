import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  Stack,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '../utils/iconify';
import { getUsers } from '../services/userService';
import { User } from '../types/User';

export const CrmPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await getUsers();
      // Filtrar solo clientes
      const clients = userData.filter(user => user.role === 'client' || user.role === 'cliente');
      setUsers(clients);
    } catch (err) {
      setError('Error al cargar los clientes');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.surname?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [users, searchTerm]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1280, mx: 'auto' }}>
      {/* Header Liquid Glass */}
      <Box
        className="liquid-glass-card"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          mb: 4,
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Chip
                label="CRM & Expedientes"
                size="small"
                sx={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: '#22d3ee',
                  fontWeight: 800,
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Gestión Integral de Alumnos
              </Typography>
            </Stack>

            <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
              CRM - Expedientes de Alumnos
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700 }}>
              Accede directamente al historial de salud, lesiones, mediciones biométricas y fichas completas de tus asesorados.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate('/dashboard/users')}
            startIcon={<Iconify icon="solar:user-plus-bold" />}
            sx={{
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              fontWeight: 800,
              textTransform: 'none',
              px: 3,
            }}
          >
            Añadir Nuevo Alumno
          </Button>
        </Box>
      </Box>

      {/* KPI Strip */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Iconify icon="solar:users-group-two-rounded-bold" width={22} sx={{ color: '#22d3ee' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Total Alumnos en Cartera
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#fff' }}>
              {users.length}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Iconify icon="solar:health-bold" width={22} sx={{ color: '#10b981' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Fichas Médicas Activas
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#10b981' }}>
              {users.length}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Iconify icon="solar:camera-bold" width={22} sx={{ color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Seguimiento y Fotos
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#f59e0b' }}>
              {users.length}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Box
        className="liquid-glass-card"
        sx={{
          p: 2.5,
          borderRadius: 3.5,
          mb: 3,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar alumno en el CRM por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:magnifer-bold" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 420,
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
          }}
        />
      </Box>

      {/* Clients CRM Cards Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={260}>
          <CircularProgress color="info" />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredClients.length === 0 ? (
        <Box className="liquid-glass-card" sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
          <Typography color="text.secondary">No se encontraron alumnos en el CRM.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filteredClients.map((client) => (
            <Grid size={{ xs: 12, md: 6 }} key={client.id}>
              <Box
                className="liquid-glass-card"
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'rgba(6, 182, 212, 0.4)',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.8}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        fontWeight: 800,
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {client.name.charAt(0).toUpperCase()}
                      {client.surname?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="800">
                        {client.name} {client.surname}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {client.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label="Alumno"
                    size="small"
                    sx={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#22d3ee',
                      fontWeight: 700,
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

                {/* Quick Action Navigation Buttons */}
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Iconify icon="solar:user-bold" />}
                    onClick={() => navigate(`/dashboard/users/${client.id}`)}
                    sx={{
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      fontWeight: 700,
                      textTransform: 'none',
                    }}
                  >
                    Ficha 360°
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="solar:health-bold" />}
                    onClick={() => navigate(`/dashboard/users/${client.id}/medical-info`)}
                    sx={{
                      borderRadius: '16px',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { borderColor: '#10b981', color: '#10b981' },
                    }}
                  >
                    Ficha Médica
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="solar:camera-bold" />}
                    onClick={() => navigate(`/dashboard/client-tracking`)}
                    sx={{
                      borderRadius: '16px',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { borderColor: '#f59e0b', color: '#f59e0b' },
                    }}
                  >
                    Seguimiento
                  </Button>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CrmPage;
