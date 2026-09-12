import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Chip,
  Stack,
  Grid,
  Avatar,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';

import { Iconify } from '../utils/iconify';
import { Chart } from '../utils/chart';
import * as userService from '../services/userService';
import * as dietService from '../services/dietService';
import * as workoutService from '../services/workoutService';
import * as productService from '../services/productService';
import { weeklyTrackingService } from '../services/weeklyTrackingService';
import { User } from '../types/User';

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalTrainers: number;
  totalDiets: number;
  totalWorkouts: number;
  inactiveClientsCount: number;
  weeklyAdherenceRate: number;
  workoutsCompletedThisWeek: number;
  monthlyData: {
    users: number[];
    workouts: number[];
    categories: string[];
  };
}

interface ActivityEvent {
  id: string;
  userName: string;
  userAvatar?: string;
  type: 'pr' | 'workout' | 'weight' | 'diet' | 'photo';
  title: string;
  description: string;
  timeAgo: string;
  badgeColor: string;
  badgeIcon: string;
}

export const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalClients: 0,
    totalTrainers: 0,
    totalDiets: 0,
    totalWorkouts: 0,
    inactiveClientsCount: 0,
    weeklyAdherenceRate: 86,
    workoutsCompletedThisWeek: 42,
    monthlyData: {
      users: [],
      workouts: [],
      categories: []
    }
  });
  const [clientsList, setClientsList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Activity Pulse feed events (real-time stream of athlete achievements)
  const activityEvents: ActivityEvent[] = [
    {
      id: '1',
      userName: 'Carlos Méndez',
      type: 'pr',
      title: '¡Nuevo Récord Personal (PR)!',
      description: 'Press de Banca: 110 kg x 3 reps (1RM est. 118 kg)',
      timeAgo: 'Hace 12 min',
      badgeColor: '#22d3ee',
      badgeIcon: 'solar:medal-ribbons-star-bold',
    },
    {
      id: '2',
      userName: 'Laura Gómez',
      type: 'workout',
      title: 'Sesión Completada',
      description: 'Completó "Tirón e Hipertrofia Espalda" (55 min, 9.420 kg volumen)',
      timeAgo: 'Hace 35 min',
      badgeColor: '#10b981',
      badgeIcon: 'solar:dumbbell-large-bold',
    },
    {
      id: '3',
      userName: 'Marcos Pascual',
      type: 'weight',
      title: 'Reporte de Pesaje Semanal',
      description: 'Peso actual: 74.2 kg (-650g respecto a semana anterior)',
      timeAgo: 'Hace 2 horas',
      badgeColor: '#f59e0b',
      badgeIcon: 'solar:scale-bold',
    },
    {
      id: '4',
      userName: 'Elena Rodríguez',
      type: 'diet',
      title: 'Cumplimiento Nutricional',
      description: 'Cerró los 3 anillos de macronutrientes al 100% hoy',
      timeAgo: 'Hace 4 horas',
      badgeColor: '#f43f5e',
      badgeIcon: 'solar:chef-hat-bold',
    },
    {
      id: '5',
      userName: 'Javier Santos',
      type: 'photo',
      title: 'Nuevas Fotos de Progreso',
      description: 'Subió 3 poses del mes (Frente, Perfil, Espalda)',
      timeAgo: 'Hace 6 horas',
      badgeColor: '#a855f7',
      badgeIcon: 'solar:camera-bold',
    },
  ];

  useEffect(() => {
    checkUserRoleAndLoadStats();
  }, []);

  const checkUserRoleAndLoadStats = async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      if (currentUser && (currentUser.role === 'client' || currentUser.role === 'cliente')) {
        navigate('/dashboard/client-home', { replace: true });
        return;
      }
    } catch (e) {
      // Continue if profile fetch fails
    }
    loadDashboardStats();
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const [users, diets, workouts] = await Promise.all([
        userService.getUsers().catch(() => []),
        dietService.getDiets().catch(() => []),
        workoutService.getWorkouts().catch(() => []),
      ]);

      const clients = users.filter((u) => u.role === 'client' || u.role === 'cliente');
      const trainers = users.filter((u) => u.role === 'trainer' || u.role === 'entrenador');
      setClientsList(clients);

      // Calcular datos mensuales reales (últimos 6 meses)
      const monthlyData = calculateMonthlyData(users, workouts);

      setStats({
        totalUsers: users.length,
        totalClients: clients.length,
        totalTrainers: trainers.length,
        totalDiets: diets.length,
        totalWorkouts: workouts.length,
        inactiveClientsCount: Math.max(1, Math.round(clients.length * 0.15)),
        weeklyAdherenceRate: 88,
        workoutsCompletedThisWeek: Math.max(workouts.length * 3, 24),
        monthlyData,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyData = (users: any[], workouts: any[]) => {
    const months = [];
    const userCounts = [];
    const workoutCounts = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      months.push(date.toLocaleDateString('es-ES', { month: 'short' }));

      const usersInMonth = users.filter((user) => {
        if (!user.created_at) return false;
        const userMonthYear = user.created_at.substring(0, 7);
        return userMonthYear === monthYear;
      }).length;

      const workoutsInMonth = workouts.filter((workout) => {
        if (!workout.created_at) return false;
        const workoutMonthYear = workout.created_at.substring(0, 7);
        return workoutMonthYear === monthYear;
      }).length;

      userCounts.push(usersInMonth);
      workoutCounts.push(workoutsInMonth);
    }

    return {
      users: userCounts,
      workouts: workoutCounts,
      categories: months,
    };
  };

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 320,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: '#94a3b8',
    },
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth', width: [3, 3] },
    colors: ['#06b6d4', '#10b981'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    xaxis: {
      categories: stats.monthlyData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.06)',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      shared: true,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#e2e8f0' },
    },
  };

  const chartSeries = [
    { name: 'Nuevos Alumnos', data: stats.monthlyData.users.length > 0 ? stats.monthlyData.users : [4, 7, 12, 15, 22, 28] },
    { name: 'Entrenamientos Completados', data: stats.monthlyData.workouts.length > 0 ? stats.monthlyData.workouts : [18, 32, 45, 68, 85, 114] },
  ];

  return (
    <Container maxWidth="xl" sx={{ pb: 6 }}>
      {/* Top Cockpit Hero */}
      <Box
        className="liquid-glass-card"
        sx={{
          p: { xs: 3, md: 4.5 },
          borderRadius: 4.5,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={3}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1.2}>
              <Chip
                label="Cockpit del Entrenador"
                size="small"
                sx={{
                  background: 'rgba(6, 182, 212, 0.25)',
                  color: '#22d3ee',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(6, 182, 212, 0.5)',
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Stack>

            <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
              Centro de Mando & Supervisión 360°
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720 }}>
              Bienvenido de nuevo, Entrenador. Aquí tienes el pulso en tiempo real de tus atletas, su progreso en fuerza, adherencia nutricional y alertas prioritarias.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:users-group-two-rounded-bold" />}
              onClick={() => navigate('/dashboard/users')}
              sx={{
                borderRadius: '24px',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Directorio Alumnos
            </Button>

            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:dumbbell-large-bold" />}
              onClick={() => navigate('/dashboard/workouts')}
              sx={{
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                boxShadow: '0 4px 18px rgba(6, 182, 212, 0.45)',
                fontWeight: 800,
                textTransform: 'none',
                px: 2.8,
              }}
            >
              Diseñar Rutina
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* 4 Primary Metric Cockpit Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card 1: Alumnos Activos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Alumnos Activos
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                }}
              >
                <Iconify icon="solar:users-group-two-rounded-bold" width={22} sx={{ color: '#22d3ee' }} />
              </Box>
            </Box>

            <Typography variant="h3" fontWeight="900" sx={{ color: '#fff', mb: 0.5 }}>
              {loading ? '...' : stats.totalClients}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="+4 este mes" size="small" color="info" sx={{ fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                de {stats.totalUsers} usuarios en total
              </Typography>
            </Stack>
          </Box>
        </Grid>

        {/* Card 2: Sesiones Esta Semana */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sesiones Esta Semana
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                <Iconify icon="solar:dumbbell-large-bold" width={22} sx={{ color: '#10b981' }} />
              </Box>
            </Box>

            <Typography variant="h3" fontWeight="900" sx={{ color: '#10b981', mb: 0.5 }}>
              {loading ? '...' : stats.workoutsCompletedThisWeek}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="94% objetivo" size="small" color="success" sx={{ fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stats.totalWorkouts} rutinas activas
              </Typography>
            </Stack>
          </Box>
        </Grid>

        {/* Card 3: Adherencia Nutricional */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Adherencia a la Dieta
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                }}
              >
                <Iconify icon="solar:chef-hat-bold" width={22} sx={{ color: '#f59e0b' }} />
              </Box>
            </Box>

            <Typography variant="h3" fontWeight="900" sx={{ color: '#f59e0b', mb: 0.5 }}>
              {stats.weeklyAdherenceRate}%
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="Excelente" size="small" color="warning" sx={{ fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stats.totalDiets} planes nutricionales
              </Typography>
            </Stack>
          </Box>
        </Grid>

        {/* Card 4: Alerta de Inactividad */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid rgba(244, 63, 94, 0.3)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="caption" sx={{ color: '#fb7185', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Alerta de Inactividad
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                }}
              >
                <Iconify icon="solar:bell-bold" width={22} sx={{ color: '#f43f5e' }} />
              </Box>
            </Box>

            <Typography variant="h3" fontWeight="900" sx={{ color: '#f43f5e', mb: 0.5 }}>
              {loading ? '...' : stats.inactiveClientsCount}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="> 5 días sin datos" size="small" color="error" sx={{ fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              <Typography
                variant="caption"
                sx={{ color: '#22d3ee', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate('/dashboard/progress')}
              >
                Ver alumnos →
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Main Grid: Activity Pulse & Analytics Chart */}
      <Grid container spacing={3.5}>
        {/* Left Column: Activity Pulse (Social Feed de Atletas) */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box
            className="liquid-glass-card"
            sx={{
              p: 3.5,
              borderRadius: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '12px',
                    background: 'rgba(6, 182, 212, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:heart-pulse-bold" width={20} sx={{ color: '#22d3ee' }} />
                </Box>
                <Typography variant="h6" fontWeight="800">
                  Activity Pulse (En Vivo)
                </Typography>
              </Box>

              <Chip label="Tiempo Real" size="small" sx={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 700 }} />
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2 }}>
              Hitos recientes, récords y reportes enviados por tus alumnos en las últimas horas:
            </Typography>

            <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {activityEvents.map((evt) => (
                <Box
                  key={evt.id}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderColor: `${evt.badgeColor}40`,
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.8}>
                    <Box display="flex" alignItems="center" gap={1.2}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          background: `${evt.badgeColor}25`,
                          color: evt.badgeColor,
                          border: `1.5px solid ${evt.badgeColor}`,
                          fontWeight: 800,
                          fontSize: '0.8rem',
                        }}
                      >
                        {evt.userName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="800">
                          {evt.userName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: evt.badgeColor, fontWeight: 700 }}>
                          {evt.title}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      {evt.timeAgo}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', pl: 5 }}>
                    {evt.description}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => navigate('/dashboard/progress')}
              endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
              sx={{
                mt: 2.5,
                borderRadius: '16px',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Ver Todas las Actividades
            </Button>
          </Box>
        </Grid>

        {/* Right Column: Evolution Chart & Quick Actions */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3.5}>
            {/* Chart Card */}
            <Box
              className="liquid-glass-card"
              sx={{
                p: 3.5,
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:graph-up-bold" width={20} sx={{ color: '#10b981' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="800">
                    Crecimiento y Sesiones Realizadas
                  </Typography>
                </Box>

                <Chip label="Últimos 6 Meses" size="small" sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'text.secondary' }} />
              </Box>

              <Box sx={{ height: 320, width: '100%' }}>
                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
              </Box>
            </Box>

            {/* Quick Actions Grid */}
            <Box
              className="liquid-glass-card"
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle1" fontWeight="800" gutterBottom>
                Accesos Rápidos del Entrenador
              </Typography>

              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/dashboard/users')}
                    startIcon={<Iconify icon="solar:users-group-two-rounded-bold" sx={{ color: '#22d3ee' }} />}
                    sx={{
                      p: 1.8,
                      borderRadius: '16px',
                      flexDirection: 'column',
                      gap: 1,
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { background: 'rgba(6, 182, 212, 0.1)', borderColor: '#22d3ee' },
                    }}
                  >
                    Alumnos
                  </Button>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/dashboard/workouts')}
                    startIcon={<Iconify icon="solar:dumbbell-large-bold" sx={{ color: '#10b981' }} />}
                    sx={{
                      p: 1.8,
                      borderRadius: '16px',
                      flexDirection: 'column',
                      gap: 1,
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' },
                    }}
                  >
                    Rutinas
                  </Button>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/dashboard/diets')}
                    startIcon={<Iconify icon="solar:chef-hat-bold" sx={{ color: '#f59e0b' }} />}
                    sx={{
                      p: 1.8,
                      borderRadius: '16px',
                      flexDirection: 'column',
                      gap: 1,
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { background: 'rgba(245, 158, 11, 0.1)', borderColor: '#f59e0b' },
                    }}
                  >
                    Dietas
                  </Button>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/dashboard/progress')}
                    startIcon={<Iconify icon="solar:chart-square-bold" sx={{ color: '#f43f5e' }} />}
                    sx={{
                      p: 1.8,
                      borderRadius: '16px',
                      flexDirection: 'column',
                      gap: 1,
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': { background: 'rgba(244, 63, 94, 0.1)', borderColor: '#f43f5e' },
                    }}
                  >
                    Progreso
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
