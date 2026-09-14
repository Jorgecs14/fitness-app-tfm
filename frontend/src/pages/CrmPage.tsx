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
import {
  Users,
  UserPlus,
  HeartPulse,
  Camera,
  Search,
  UserCheck,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
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
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1280, mx: 'auto', pb: 8 }}>
      {/* Header Apple Inset Grouped */}
      <Box
        className="apple-card"
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 3,
          background: 'linear-gradient(180deg, #1C1C1E 0%, #161618 100%)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Chip
                label="CRM & Expedientes"
                size="small"
                sx={{
                  background: 'rgba(0, 122, 255, 0.15)',
                  color: '#007AFF',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: '0.5px solid rgba(0, 122, 255, 0.3)',
                  height: 24,
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Gestión Integral de Alumnos
              </Typography>
            </Stack>

            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, color: '#FFFFFF' }}>
              Expedientes de Alumnos
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 680 }}>
              Acceso a historiales de salud, lesiones, mediciones antropométricas y fichas técnicas completas.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate('/dashboard/users')}
            startIcon={<UserPlus size={16} />}
            className="apple-button-primary"
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
            }}
          >
            Añadir Nuevo Alumno
          </Button>
        </Box>
      </Box>

      {/* KPI Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.2} mb={1}>
              <Users size={18} color="#007AFF" />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Alumnos en Cartera
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {users.length}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.2} mb={1}>
              <HeartPulse size={18} color="#34C759" />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Fichas Médicas Activas
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#34C759', letterSpacing: '-0.02em' }}>
              {users.length}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.2} mb={1}>
              <Camera size={18} color="#AF52DE" />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Seguimiento y Fotos
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#AF52DE', letterSpacing: '-0.02em' }}>
              {users.length}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Box
        className="apple-card"
        sx={{
          p: 1.5,
          mb: 3,
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar alumno por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="rgba(255, 255, 255, 0.4)" />
              </InputAdornment>
            ),
          }}
          sx={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            '& fieldset': { border: 'none' },
          }}
        />
      </Box>

      {/* Clients CRM Cards Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      ) : filteredClients.length === 0 ? (
        <Box className="apple-card" sx={{ p: 5, textAlign: 'center' }}>
          <Typography color="rgba(255, 255, 255, 0.5)">No se encontraron alumnos en el CRM.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredClients.map((client) => (
            <Grid size={{ xs: 12, md: 6 }} key={client.id}>
              <Box
                className="apple-card"
                sx={{
                  p: 2.5,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'rgba(0, 122, 255, 0.3)',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        background: '#2C2C2E',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        border: '0.5px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      {client.name.charAt(0).toUpperCase()}
                      {client.surname?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#FFFFFF' }}>
                        {client.name} {client.surname}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {client.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label="Alumno"
                    size="small"
                    sx={{
                      background: 'rgba(0, 122, 255, 0.15)',
                      color: '#007AFF',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 22,
                    }}
                  />
                </Box>

                <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

                {/* Quick Action Navigation Buttons */}
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/dashboard/users/${client.id}`)}
                    className="apple-button-primary"
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      py: 0.6,
                    }}
                  >
                    Ficha 360°
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/dashboard/users/${client.id}/medical-info`)}
                    sx={{
                      borderRadius: '8px',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      py: 0.6,
                      '&:hover': { borderColor: '#34C759', color: '#34C759', background: 'rgba(52, 199, 89, 0.1)' },
                    }}
                  >
                    Ficha Médica
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/dashboard/client-tracking`)}
                    sx={{
                      borderRadius: '8px',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      py: 0.6,
                      '&:hover': { borderColor: '#AF52DE', color: '#AF52DE', background: 'rgba(175, 82, 222, 0.1)' },
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
