import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Search,
  ArrowLeft,
  Activity,
  Calendar,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { User } from '../types/User';
import * as userService from '../services/userService';
import ClientTrackingDashboard from '../components/Client/ClientTrackingDashboard';

const ClientTrackingPage: React.FC = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await userService.getCurrentUser();
      let clientUsers: User[] = [];

      if (currentUser && (currentUser.role === 'trainer' || currentUser.role === 'entrenador')) {
        clientUsers = await userService.getTrainerClients(currentUser.id);
      } else {
        const allUsers = await userService.getUsers();
        clientUsers = allUsers.filter(user => user.role === 'client' || user.role === 'cliente');
      }

      setClients(clientUsers);
    } catch (err: any) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.surname && client.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDate?: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age > 0 ? age : null;
  };

  const getInitials = (name: string, surname?: string): string => {
    const first = name ? name.charAt(0) : 'U';
    const second = surname ? surname.charAt(0) : '';
    return `${first}${second}`.toUpperCase();
  };

  if (selectedClient) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto', p: { xs: 1.5, sm: 2.5, md: 3 }, boxSizing: 'border-box', overflowX: 'hidden' }}>
        <Box sx={{ mb: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => setSelectedClient(null)}
            startIcon={<ArrowLeft size={16} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            Volver a la Lista de Alumnos
          </Button>
        </Box>
        <ClientTrackingDashboard user={selectedClient} />
      </Box>
    );
  }

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
      {/* Header */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" gap={1.2} mb={0.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              bgcolor: 'rgba(0, 122, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#007AFF'
            }}
          >
            <Activity size={18} />
          </Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', sm: '1.85rem' } }}>
            Seguimiento de Clientes
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 620 }}>
          Supervisa el pesaje semanal, evolución de pliegues/medidas y fotos de progreso de tus alumnos.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }}>
          {error}
        </Alert>
      )}

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar alumnos por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="rgba(255, 255, 255, 0.4)" />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '14px',
              color: '#ffffff',
              fontSize: '14px'
            }
          }}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* Grid de clientes */}
      {loading ? (
        <Box py={6} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <CircularProgress size={32} sx={{ color: '#007AFF', mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Cargando expedientes de clientes...
          </Typography>
        </Box>
      ) : filteredClients.length === 0 ? (
        <Box
          sx={{
            p: 4,
            borderRadius: '20px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            {searchTerm ? 'No se encontraron alumnos con ese criterio de búsqueda.' : 'No tienes alumnos asignados actualmente.'}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
            width: '100%',
            minWidth: 0
          }}
        >
          {filteredClients.map((client) => {
            const age = calculateAge(client.birth_date);
            return (
              <Card
                key={client.id}
                onClick={() => setSelectedClient(client)}
                sx={{
                  borderRadius: '18px',
                  bgcolor: 'var(--bg-card, #18181b)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'rgba(0, 122, 255, 0.4)',
                    boxShadow: '0 8px 30px rgba(0, 122, 255, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                  <Box display="flex" alignItems="center" gap={1.2} mb={1.5}>
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: '#007AFF',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.95rem'
                      }}
                    >
                      {getInitials(client.name, client.surname)}
                    </Avatar>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="700" noWrap sx={{ color: '#ffffff', fontSize: '0.9rem' }}>
                        {client.name} {client.surname}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.72rem' }}>
                        {client.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={0.8} mb={1.8} flexWrap="wrap" gap={0.5}>
                    <Chip
                      label="Alumno"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: 'rgba(0, 122, 255, 0.15)',
                        color: '#007AFF'
                      }}
                    />
                    {age && (
                      <Chip
                        label={`${age} años`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          color: 'rgba(255, 255, 255, 0.7)'
                        }}
                      />
                    )}
                  </Stack>

                  <Box
                    pt={1.2}
                    borderTop="1px solid rgba(255, 255, 255, 0.06)"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption" sx={{ color: '#007AFF', fontWeight: 600, fontSize: '0.75rem' }}>
                      Ver Evolución 360°
                    </Typography>
                    <ChevronRight size={15} color="#007AFF" />
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ClientTrackingPage;
