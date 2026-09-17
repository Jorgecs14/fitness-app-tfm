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
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  HeartPulse,
  Camera,
  Search,
  Wallet,
  Activity
} from 'lucide-react';
import { getUsers, getCurrentUser, getTrainerClients } from '../services/userService';
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
      const currentUser = await getCurrentUser();
      if (currentUser && (currentUser.role === 'client' || currentUser.role === 'cliente')) {
        navigate('/dashboard/client-home', { replace: true });
        return;
      }

      let clients: User[] = [];
      if (currentUser && (currentUser.role === 'trainer' || currentUser.role === 'entrenador')) {
        clients = await getTrainerClients(currentUser.id);
      } else {
        const userData = await getUsers();
        clients = userData.filter((u) => u.role === 'client' || u.role === 'cliente');
      }

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
        (u.surname && u.surname.toLowerCase().includes(q)) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [users, searchTerm]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1280,
        mx: 'auto',
        p: { xs: 1.5, sm: 2.5, md: 3 },
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      {/* Header Apple Inset Grouped */}
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          mb: 3,
          borderRadius: '20px',
          bgcolor: 'var(--bg-card, #18181b)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1.2} alignItems="center" mb={1} flexWrap="wrap">
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
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.78rem' }}>
                Gestión Integral de Alumnos
              </Typography>
            </Stack>

            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, color: '#FFFFFF', fontSize: { xs: '1.4rem', sm: '1.85rem' } }}>
              Expedientes de Alumnos
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 680, fontSize: '0.85rem' }}>
              Acceso a historiales de salud, lesiones, mediciones antropométricas, cobros y fichas técnicas completas.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate('/dashboard/users')}
            startIcon={<UserPlus size={16} />}
            sx={{
              bgcolor: '#007AFF',
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.2,
              py: 0.9,
              boxShadow: '0 4px 14px rgba(0, 122, 255, 0.35)',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Añadir Nuevo Alumno
          </Button>
        </Box>
      </Box>

      {/* KPI Strip */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
          mb: 3,
          width: '100%',
          minWidth: 0
        }}
      >
        <Box
          sx={{
            p: 2.2,
            borderRadius: '18px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxSizing: 'border-box'
          }}
        >
          <Box display="flex" alignItems="center" gap={1.2} mb={1}>
            <Users size={18} color="#007AFF" />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.72rem' }}>
              Total Alumnos en Cartera
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#FFFFFF', letterSpacing: '-0.02em', fontSize: '1.6rem' }}>
            {users.length}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2.2,
            borderRadius: '18px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxSizing: 'border-box'
          }}
        >
          <Box display="flex" alignItems="center" gap={1.2} mb={1}>
            <HeartPulse size={18} color="#34C759" />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.72rem' }}>
              Fichas Médicas Activas
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#34C759', letterSpacing: '-0.02em', fontSize: '1.6rem' }}>
            {users.length}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2.2,
            borderRadius: '18px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxSizing: 'border-box'
          }}
        >
          <Box display="flex" alignItems="center" gap={1.2} mb={1}>
            <Camera size={18} color="#AF52DE" />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.72rem' }}>
              Seguimiento y Fotos
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#AF52DE', letterSpacing: '-0.02em', fontSize: '1.6rem' }}>
            {users.length}
          </Typography>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Buscar alumno por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="rgba(255, 255, 255, 0.4)" />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px'
            }
          }}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* Clients CRM Cards Grid */}
      {loading ? (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress size={32} sx={{ color: '#007AFF', mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Cargando expedientes...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: '14px' }}>{error}</Alert>
      ) : filteredClients.length === 0 ? (
        <Box sx={{ p: 4, borderRadius: '20px', bgcolor: 'var(--bg-card, #18181b)', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <Typography color="rgba(255, 255, 255, 0.5)">No se encontraron alumnos en el CRM.</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            width: '100%',
            minWidth: 0
          }}
        >
          {filteredClients.map((client) => (
            <Box
              key={client.id}
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: 'var(--bg-card, #18181b)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                '&:hover': {
                  borderColor: 'rgba(0, 122, 255, 0.3)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5} flexWrap="wrap" gap={1}>
                <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      background: '#007AFF',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      flexShrink: 0
                    }}
                  >
                    {(client.name.charAt(0) || 'U').toUpperCase()}
                    {(client.surname?.charAt(0) || '').toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight="700" noWrap sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                      {client.name} {client.surname}
                    </Typography>
                    <Typography variant="caption" noWrap sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.75rem' }}>
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
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    height: 22,
                  }}
                />
              </Box>

              <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

              {/* Quick Action Navigation Buttons */}
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.8}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate(`/dashboard/users/${client.id}`)}
                  sx={{
                    bgcolor: '#007AFF',
                    borderRadius: '10px',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    py: 0.6,
                    px: 1.5
                  }}
                >
                  Ficha 360°
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/dashboard/users/${client.id}/medical-info`)}
                  sx={{
                    borderRadius: '10px',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    py: 0.6,
                    px: 1.5,
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
                    borderRadius: '10px',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    py: 0.6,
                    px: 1.5,
                    '&:hover': { borderColor: '#AF52DE', color: '#AF52DE', background: 'rgba(175, 82, 222, 0.1)' },
                  }}
                >
                  Seguimiento
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CrmPage;
