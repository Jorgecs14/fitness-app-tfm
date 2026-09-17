import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Paper,
  Alert,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  Grid,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUsers, getCurrentUser, getTrainerClients } from '../services/userService';
import { weeklyTrackingService } from '../services/weeklyTrackingService';
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
        } catch (error) {
          console.error(`Error loading progress for user ${user.id}:`, error);
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
    } catch (err) {
      setError('Error al cargar los progresos de los clientes');
      console.error('Error loading user progress:', err);
    } finally {
      setLoading(false);
    }
  };

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
        p.user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1280, mx: 'auto' }}>
      {/* Hero Cockpit */}
      <Box
        className="liquid-glass-card"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Chip
                label="Supervisión Biométrica"
                size="small"
                sx={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: '#22d3ee',
                  fontWeight: 700,
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Panel Central de Entrenador
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
              Analítica de Progreso y Clientes
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700 }}>
              Supervisa la adherencia, reportes de pesaje, fotografías antes/después y curvas de fuerza de todos tus atletas.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={loadUsersProgress}
            startIcon={<Iconify icon="solar:refresh-bold" />}
            sx={{
              borderRadius: '24px',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              background: 'rgba(255, 255, 255, 0.05)',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            Actualizar Datos
          </Button>
        </Box>
      </Box>

      {/* KPI Metric Cards Strip */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Total Alumnos
            </Typography>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#fff', mt: 0.5 }}>
              {stats.total}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600 }}>
              Al Día (&lt; 7 días)
            </Typography>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#10b981', mt: 0.5 }}>
              {stats.updated}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 600 }}>
              Atención (8-14 días)
            </Typography>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#f59e0b', mt: 0.5 }}>
              {stats.warning}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#fb7185', fontWeight: 600 }}>
              Urgente (&gt; 14 días)
            </Typography>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#f43f5e', mt: 0.5 }}>
              {stats.urgent}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 2.4 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: 'rgba(148, 163, 184, 0.06)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
              Sin Registros
            </Typography>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#94a3b8', mt: 0.5 }}>
              {stats.none}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Navigation Tabs (Directorio vs Consistencia Global vs Fuerza 1RM vs Comparador) */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#22d3ee',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#22d3ee',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab
            icon={<Iconify icon="solar:users-group-two-rounded-bold" width={20} />}
            iconPosition="start"
            label="Directorio de Alumnos"
          />
          <Tab
            icon={<Iconify icon="solar:flame-bold" width={20} />}
            iconPosition="start"
            label="Calendario de Consistencia"
          />
          <Tab
            icon={<Iconify icon="solar:chart-square-bold" width={20} />}
            iconPosition="start"
            label="Evolución de Fuerza 1RM"
          />
          <Tab
            icon={<Iconify icon="solar:gallery-wide-bold" width={20} />}
            iconPosition="start"
            label="Visor Antes y Después"
          />
        </Tabs>
      </Box>

      {/* TAB 0: Directorio de Alumnos */}
      {currentTab === 0 && (
        <Box>
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
                    <Iconify icon="solar:magnifer-bold" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: { xs: '100%', md: 380 },
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '12px',
              }}
            />

            <Stack direction="row" spacing={1} overflow="auto" pb={{ xs: 1, md: 0 }}>
              <Chip
                label="Todos"
                clickable
                onClick={() => setStatusFilter('all')}
                color={statusFilter === 'all' ? 'primary' : 'default'}
                variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label="Al Día"
                clickable
                onClick={() => setStatusFilter('updated')}
                color={statusFilter === 'updated' ? 'success' : 'default'}
                variant={statusFilter === 'updated' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label="Atención"
                clickable
                onClick={() => setStatusFilter('warning')}
                color={statusFilter === 'warning' ? 'warning' : 'default'}
                variant={statusFilter === 'warning' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label="Urgente"
                clickable
                onClick={() => setStatusFilter('urgent')}
                color={statusFilter === 'urgent' ? 'error' : 'default'}
                variant={statusFilter === 'urgent' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label="Sin registros"
                clickable
                onClick={() => setStatusFilter('none')}
                variant={statusFilter === 'none' ? 'filled' : 'outlined'}
                size="small"
              />
            </Stack>
          </Stack>

          {/* Client Progress Cards Grid */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={260}>
              <CircularProgress color="info" />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredUsers.length === 0 ? (
            <Box
              className="liquid-glass-card"
              sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}
            >
              <Typography variant="body1" color="text.secondary">
                No se encontraron alumnos con los criterios seleccionados.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {filteredUsers.map((item) => {
                const badge = getStatusBadge(item.daysAgo, item.lastProgressDate !== null);
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.user.id}>
                    <Box
                      className="liquid-glass-card"
                      sx={{
                        p: 3,
                        borderRadius: 3.5,
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                          borderColor: 'rgba(6, 182, 212, 0.4)',
                        },
                      }}
                      onClick={() => navigate(`/dashboard/users/${item.user.id}`)}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                              fontWeight: 800,
                              boxShadow: `0 0 15px ${badge.color}40`,
                              border: `2px solid ${badge.color}`,
                            }}
                          >
                            {item.user.name.charAt(0).toUpperCase()}
                            {item.user.surname.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="800">
                              {item.user.name} {item.user.surname}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {item.user.email}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            px: 1.2,
                            py: 0.4,
                            borderRadius: '12px',
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: badge.color, fontWeight: 700, fontSize: '0.72rem' }}>
                            {badge.label}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Quick Biometrics */}
                      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
                        <Box
                          sx={{
                            flex: 1,
                            p: 1.2,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                            Último Peso
                          </Typography>
                          <Typography variant="body2" fontWeight="800">
                            {item.weight ? `${item.weight} kg` : '—'}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            flex: 1,
                            p: 1.2,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                            Cintura
                          </Typography>
                          <Typography variant="body2" fontWeight="800">
                            {item.waist ? `${item.waist} cm` : '—'}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Action footer */}
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/users/${item.user.id}`);
                        }}
                        sx={{
                          borderRadius: '16px',
                          textTransform: 'none',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          '&:hover': {
                            background: 'rgba(6, 182, 212, 0.15)',
                            borderColor: '#06b6d4',
                          },
                        }}
                      >
                        Ver Ficha Completa
                      </Button>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 1: Calendario de Consistencia Global */}
      {currentTab === 1 && (
        <Box>
          <ConsistencyHeatmap />
        </Box>
      )}

      {/* TAB 2: Evolución de Fuerza 1RM */}
      {currentTab === 2 && (
        <Box>
          <ExerciseProgressChart history={[]} />
        </Box>
      )}

      {/* TAB 3: Visor Antes y Después */}
      {currentTab === 3 && (
        <Box>
          <BeforeAfterSlider />
        </Box>
      )}
    </Box>
  );
};

export default ProgressPage;
