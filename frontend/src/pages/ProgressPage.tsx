import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Alert,
  Stack,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  ChevronRight,
  Flame,
  Activity,
  Award,
  RefreshCw,
  Image as ImageIcon,
  UserCheck
} from 'lucide-react';
import { getUsers, getCurrentUser, getTrainerClients } from '../services/userService';
import { weeklyTrackingService } from '../services/weeklyTrackingService';
import { clientProgressPhotoService } from '../services/clientProgressPhotoService';
import { ClientProgressPhoto } from '../types/ClientProgressPhoto';
import { User } from '../types/User';
import ConsistencyHeatmap from '../components/Progress/ConsistencyHeatmap';
import ExerciseProgressChart from '../components/Analytics/ExerciseProgressChart';
import BeforeAfterSlider from '../components/Progress/BeforeAfterSlider';

interface UserProgress {
  user: User;
  lastProgressDate: string | null;
  daysAgo: number;
  weight?: number;
  waist?: number;
}

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [clientPhotos, setClientPhotos] = useState<ClientProgressPhoto[]>([]);
  const [clientActivity, setClientActivity] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'updated' | 'warning' | 'urgent' | 'none'>('all');
  const [currentTab, setCurrentTab] = useState<number>(0);

  useEffect(() => {
    loadUsersProgress();
  }, []);

  const loadUsersProgress = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      let clients: User[] = [];

      if (currentUser && (currentUser.role === 'trainer' || currentUser.role === 'entrenador')) {
        clients = await getTrainerClients(currentUser.id);
      } else {
        const users = await getUsers();
        clients = users.filter(user => user.role === 'client' || user.role === 'cliente');
      }
      
      // Obtener la fecha del último progreso para cada cliente
      const progressPromises = clients.map(async (user) => {
        try {
          const weeklyData = await weeklyTrackingService.getByUserId(user.id);
          
          let lastProgressDate = null;
          let daysAgo = 999;
          let weight = undefined;
          let waist = undefined;
          
          if (weeklyData && weeklyData.length > 0) {
            const sortedData = weeklyData.sort((a, b) => 
              new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
            );
            lastProgressDate = sortedData[0].week_start_date;
            weight = sortedData[0].weight;
            waist = sortedData[0].waist_measurement;
            
            const lastDate = new Date(lastProgressDate);
            const today = new Date();
            daysAgo = Math.max(0, Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));
          }
          
          return {
            user,
            lastProgressDate,
            daysAgo,
            weight,
            waist,
          };
        } catch (err) {
          console.error(`Error loading progress for user ${user.id}:`, err);
          return {
            user,
            lastProgressDate: null,
            daysAgo: 999,
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
      if (progressData.length > 0 && !selectedClientId) {
        setSelectedClientId(progressData[0].user.id);
      }
    } catch (err) {
      setError('Error al cargar los progresos de los clientes');
      console.error('Error loading user progress:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos biométricos y fotos del atleta seleccionado
  useEffect(() => {
    if (!selectedClientId) return;
    const fetchAthleteDetails = async () => {
      try {
        const [photos, weekly] = await Promise.all([
          clientProgressPhotoService.getByUserId(Number(selectedClientId)).catch(() => []),
          weeklyTrackingService.getByUserId(Number(selectedClientId)).catch(() => [])
        ]);
        setClientPhotos(photos || []);
        
        const activities = (weekly || []).map((w: any) => ({
          date: (w.week_start_date || '').split('T')[0],
          count: 1
        }));
        setClientActivity(activities);
      } catch (err) {
        console.error('Error fetching athlete details:', err);
      }
    };
    fetchAthleteDetails();
  }, [selectedClientId]);

  // KPIs
  const stats = useMemo(() => {
    const total = userProgress.length;
    const updated = userProgress.filter((p) => p.lastProgressDate !== null && p.daysAgo <= 7).length;
    const warning = userProgress.filter((p) => p.lastProgressDate !== null && p.daysAgo > 7 && p.daysAgo <= 14).length;
    const urgent = userProgress.filter((p) => p.lastProgressDate !== null && p.daysAgo > 14).length;
    const none = userProgress.filter((p) => p.lastProgressDate === null).length;
    return { total, updated, warning, urgent, none };
  }, [userProgress]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return userProgress.filter((p) => {
      const matchSearch =
        p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.user.surname && p.user.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.user.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === 'updated') return p.lastProgressDate !== null && p.daysAgo <= 7;
      if (statusFilter === 'warning') return p.lastProgressDate !== null && p.daysAgo > 7 && p.daysAgo <= 14;
      if (statusFilter === 'urgent') return p.lastProgressDate !== null && p.daysAgo > 14;
      if (statusFilter === 'none') return p.lastProgressDate === null;
      return true;
    });
  }, [userProgress, searchTerm, statusFilter]);

  const getStatusBadge = (daysAgo: number, hasProgress: boolean) => {
    if (!hasProgress) {
      return {
        label: 'Sin registros',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.15)',
        border: 'rgba(148, 163, 184, 0.3)',
      };
    }
    if (daysAgo <= 7) {
      return {
        label: daysAgo === 0 ? 'Hoy' : `Hace ${daysAgo}d`,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.4)',
      };
    }
    if (daysAgo <= 14) {
      return {
        label: `Hace ${daysAgo}d`,
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.4)',
      };
    }
    return {
      label: `Hace ${daysAgo}d`,
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.15)',
      border: 'rgba(244, 63, 94, 0.4)',
    };
  };

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
      {/* Hero Cockpit */}
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
            <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap">
              <Chip
                label="Supervisión Biométrica"
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
                Panel Central de Entrenador
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, color: '#ffffff', fontSize: { xs: '1.4rem', sm: '1.85rem' } }}>
              Analítica de Progreso y Clientes
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 700, fontSize: '0.85rem' }}>
              Supervisa la adherencia, reportes de pesaje, fotografías antes/después y curvas de fuerza de todos tus atletas.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={loadUsersProgress}
            startIcon={<RefreshCw size={15} />}
            sx={{
              borderRadius: '12px',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              background: 'rgba(255, 255, 255, 0.03)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.84rem',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: '#ffffff',
              },
            }}
          >
            Actualizar Datos
          </Button>
        </Box>
      </Box>

      {/* KPI Metric Cards Strip */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 3,
          width: '100%',
          minWidth: 0
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, fontSize: '0.72rem' }}>
            Total Alumnos
          </Typography>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#fff', mt: 0.5, fontSize: '1.5rem' }}>
            {stats.total}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600, fontSize: '0.72rem' }}>
            Al Día (&lt; 7d)
          </Typography>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#10b981', mt: 0.5, fontSize: '1.5rem' }}>
            {stats.updated}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.72rem' }}>
            Atención (8-14d)
          </Typography>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#f59e0b', mt: 0.5, fontSize: '1.5rem' }}>
            {stats.warning}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="caption" sx={{ color: '#fb7185', fontWeight: 600, fontSize: '0.72rem' }}>
            Urgente (&gt; 14d)
          </Typography>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#f43f5e', mt: 0.5, fontSize: '1.5rem' }}>
            {stats.urgent}
          </Typography>
        </Box>

        <Box
          sx={{
            gridColumn: { xs: 'span 2', sm: 'span 1' },
            p: 2,
            borderRadius: '16px',
            background: 'rgba(148, 163, 184, 0.06)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.72rem' }}>
            Sin Registros
          </Typography>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#94a3b8', mt: 0.5, fontSize: '1.5rem' }}>
            {stats.none}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box
        sx={{
          mb: 3,
          borderRadius: '16px',
          bgcolor: 'var(--bg-card, #18181b)',
          p: 0.8,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxSizing: 'border-box',
          overflowX: 'auto'
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons={false}
          allowScrollButtonsMobile={false}
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': {
              display: 'none'
            },
            '& .MuiTab-root': {
              minHeight: 38,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              color: 'rgba(255, 255, 255, 0.6)',
              px: 2,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#ffffff',
                bgcolor: '#007AFF',
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
              }
            }
          }}
        >
          <Tab
            icon={<Users size={16} />}
            iconPosition="start"
            label="Directorio de Alumnos"
          />
          <Tab
            icon={<Flame size={16} />}
            iconPosition="start"
            label="Calendario de Consistencia"
          />
          <Tab
            icon={<Activity size={16} />}
            iconPosition="start"
            label="Evolución 1RM"
          />
          <Tab
            icon={<ImageIcon size={16} />}
            iconPosition="start"
            label="Visor Antes / Después"
          />
        </Tabs>
      </Box>

      {/* TAB 0: Directorio de Alumnos */}
      {currentTab === 0 && (
        <Box sx={{ width: '100%', minWidth: 0 }}>
          {/* Search and Filters Strip */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ mb: 3 }}
          >
            <TextField
              size="small"
              placeholder="Buscar alumno por nombre o email..."
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
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px'
                }
              }}
              sx={{
                maxWidth: { xs: '100%', md: 380 },
              }}
            />

            <Stack direction="row" spacing={0.8} overflow="auto" pb={{ xs: 1, md: 0 }}>
              <Chip
                label="Todos"
                clickable
                onClick={() => setStatusFilter('all')}
                sx={{
                  bgcolor: statusFilter === 'all' ? '#007AFF' : 'rgba(255, 255, 255, 0.06)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label="Al Día"
                clickable
                onClick={() => setStatusFilter('updated')}
                sx={{
                  bgcolor: statusFilter === 'updated' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: statusFilter === 'updated' ? '#34C759' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label="Atención"
                clickable
                onClick={() => setStatusFilter('warning')}
                sx={{
                  bgcolor: statusFilter === 'warning' ? 'rgba(255, 149, 0, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: statusFilter === 'warning' ? '#FF9500' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label="Urgente"
                clickable
                onClick={() => setStatusFilter('urgent')}
                sx={{
                  bgcolor: statusFilter === 'urgent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: statusFilter === 'urgent' ? '#ef4444' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label="Sin registros"
                clickable
                onClick={() => setStatusFilter('none')}
                sx={{
                  bgcolor: statusFilter === 'none' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: statusFilter === 'none' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            </Stack>
          </Stack>

          {/* Client Progress Cards Grid */}
          {loading ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress size={32} sx={{ color: '#007AFF', mb: 2 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Cargando datos de atletas...</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: '14px' }}>{error}</Alert>
          ) : filteredUsers.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: '20px',
                bgcolor: 'var(--bg-card, #18181b)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                No se encontraron alumnos con los criterios seleccionados.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                gap: 2,
                width: '100%',
                minWidth: 0
              }}
            >
              {filteredUsers.map((item) => {
                const badge = getStatusBadge(item.daysAgo, item.lastProgressDate !== null);
                return (
                  <Box
                    key={item.user.id}
                    sx={{
                      p: 2.5,
                      borderRadius: '18px',
                      bgcolor: 'var(--bg-card, #18181b)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      minWidth: 0,
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        borderColor: 'rgba(0, 122, 255, 0.3)',
                      },
                    }}
                    onClick={() => navigate(`/dashboard/users/${item.user.id}`)}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5} flexWrap="wrap" gap={1}>
                      <Box display="flex" alignItems="center" gap={1.2} sx={{ minWidth: 0, flex: 1 }}>
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: '#007AFF',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            border: `2px solid ${badge.color}`,
                            flexShrink: 0
                          }}
                        >
                          {(item.user.name.charAt(0) || 'U').toUpperCase()}
                          {(item.user.surname?.charAt(0) || '').toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight="800" noWrap sx={{ color: '#ffffff', fontSize: '0.92rem' }}>
                            {item.user.name} {item.user.surname}
                          </Typography>
                          <Typography variant="caption" noWrap sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.72rem' }}>
                            {item.user.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          px: 1,
                          py: 0.3,
                          borderRadius: '8px',
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          flexShrink: 0
                        }}
                      >
                        <Typography variant="caption" sx={{ color: badge.color, fontWeight: 700, fontSize: '0.68rem' }}>
                          {badge.label}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Quick Biometrics */}
                    <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          flex: 1,
                          p: 1,
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.68rem', display: 'block' }}>
                          Último Peso
                        </Typography>
                        <Typography variant="body2" fontWeight="800" sx={{ color: '#ffffff' }}>
                          {item.weight ? `${item.weight} kg` : '—'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          p: 1,
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.68rem', display: 'block' }}>
                          Cintura
                        </Typography>
                        <Typography variant="body2" fontWeight="800" sx={{ color: '#ffffff' }}>
                          {item.waist ? `${item.waist} cm` : '—'}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Action footer */}
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      endIcon={<ChevronRight size={15} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/users/${item.user.id}`);
                      }}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        py: 0.6,
                        '&:hover': {
                          background: 'rgba(0, 122, 255, 0.15)',
                          borderColor: '#007AFF',
                        },
                      }}
                    >
                      Ver Ficha Completa
                    </Button>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* TAB 1: Calendario de Consistencia */}
      {currentTab === 1 && (
        <Box sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
          {userProgress.length > 0 && (
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2} gap={1.5} flexWrap="wrap">
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>
                Visualizando atleta:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <Select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(Number(e.target.value))}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    height: 38,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                  }}
                >
                  {userProgress.map((item) => (
                    <MenuItem key={`sel-heat-${item.user.id}`} value={item.user.id} sx={{ fontSize: '0.82rem' }}>
                      {item.user.name} {item.user.surname || ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          <ConsistencyHeatmap activityData={clientActivity} />
        </Box>
      )}

      {/* TAB 2: Evolución de Fuerza 1RM */}
      {currentTab === 2 && (
        <Box sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
          {userProgress.length > 0 && (
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2} gap={1.5} flexWrap="wrap">
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>
                Visualizando atleta:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <Select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(Number(e.target.value))}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    height: 38,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                  }}
                >
                  {userProgress.map((item) => (
                    <MenuItem key={`sel-chart-${item.user.id}`} value={item.user.id} sx={{ fontSize: '0.82rem' }}>
                      {item.user.name} {item.user.surname || ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          <ExerciseProgressChart history={[]} />
        </Box>
      )}

      {/* TAB 3: Visor Antes y Después */}
      {currentTab === 3 && (
        <Box sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
          {userProgress.length > 0 && (
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2} gap={1.5} flexWrap="wrap">
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>
                Visualizando atleta:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <Select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(Number(e.target.value))}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    height: 38,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                  }}
                >
                  {userProgress.map((item) => (
                    <MenuItem key={`sel-photo-${item.user.id}`} value={item.user.id} sx={{ fontSize: '0.82rem' }}>
                      {item.user.name} {item.user.surname || ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          <BeforeAfterSlider photos={clientPhotos} />
        </Box>
      )}
    </Box>
  );
};

export default ProgressPage;
