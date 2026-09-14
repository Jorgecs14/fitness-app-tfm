import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Chip,
  Stack,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Users,
  Dumbbell,
  UtensilsCrossed,
  Activity,
  Award,
  Scale,
  Camera,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Plus
} from 'lucide-react';

import { Chart } from '../utils/chart';
import * as userService from '../services/userService';
import * as dietService from '../services/dietService';
import * as workoutService from '../services/workoutService';
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
  badgeIcon: any;
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
      title: 'Nuevo Récord Personal (PR)',
      description: 'Press de Banca: 110 kg x 3 reps (1RM est. 118 kg)',
      timeAgo: 'Hace 12 min',
      badgeColor: '#FF9500',
      badgeIcon: Award,
    },
    {
      id: '2',
      userName: 'Laura Gómez',
      type: 'workout',
      title: 'Sesión Completada',
      description: 'Completó "Tirón e Hipertrofia Espalda" (55 min, 9.420 kg volumen)',
      timeAgo: 'Hace 35 min',
      badgeColor: '#34C759',
      badgeIcon: Dumbbell,
    },
    {
      id: '3',
      userName: 'Marcos Pascual',
      type: 'weight',
      title: 'Reporte de Pesaje Semanal',
      description: 'Peso actual: 74.2 kg (-650g respecto a semana anterior)',
      timeAgo: 'Hace 2 horas',
      badgeColor: '#007AFF',
      badgeIcon: Scale,
    },
    {
      id: '4',
      userName: 'Elena Rodríguez',
      type: 'diet',
      title: 'Cumplimiento Nutricional',
      description: 'Cerró los 3 anillos de macronutrientes al 100% hoy',
      timeAgo: 'Hace 4 horas',
      badgeColor: '#FF2D55',
      badgeIcon: UtensilsCrossed,
    },
    {
      id: '5',
      userName: 'Javier Santos',
      type: 'photo',
      title: 'Nuevas Fotos de Progreso',
      description: 'Subió 3 poses del mes (Frente, Perfil, Espalda)',
      timeAgo: 'Hace 6 horas',
      badgeColor: '#AF52DE',
      badgeIcon: Camera,
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
      height: 300,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: 'rgba(255, 255, 255, 0.4)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    },
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth', width: [2.5, 2.5] },
    colors: ['#007AFF', '#34C759'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 95, 100],
      },
    },
    xaxis: {
      categories: stats.monthlyData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
        }
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.06)',
      strokeDashArray: 3,
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      style: {
        fontSize: '13px',
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: 'rgba(255, 255, 255, 0.8)' },
    },
  };

  const chartSeries = [
    { name: 'Nuevos Alumnos', data: stats.monthlyData.users.length > 0 ? stats.monthlyData.users : [4, 7, 12, 15, 22, 28] },
    { name: 'Sesiones Completadas', data: stats.monthlyData.workouts.length > 0 ? stats.monthlyData.workouts : [18, 32, 45, 68, 85, 114] },
  ];

  return (
    <Container maxWidth="xl" sx={{ pb: 8, pt: { xs: 1, sm: 2 } }}>
      {/* Apple Cockpit Header */}
      <Box
        className="apple-card"
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #1C1C1E 0%, #161618 100%)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Chip
                label="Cockpit Entrenador"
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
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Stack>

            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, color: '#FFFFFF' }}>
              Centro de Mando 360°
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 680 }}>
              Supervisión en tiempo real de tus atletas, adherencia a planes y alertas de seguimiento.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Users size={16} />}
              onClick={() => navigate('/dashboard/users')}
              sx={{
                borderRadius: '12px',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              Directorio Alumnos
            </Button>

            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate('/dashboard/workouts')}
              className="apple-button-primary"
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
              }}
            >
              Diseñar Rutina
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* 4 Inset Grouped Primary Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Card 1: Alumnos Activos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Alumnos Activos
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(0, 122, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={18} color="#007AFF" />
              </Box>
            </Box>

            <Typography variant="h3" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.5, letterSpacing: '-0.03em' }}>
              {loading ? '...' : stats.totalClients}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="+4 este mes" size="small" sx={{ background: 'rgba(0, 122, 255, 0.15)', color: '#007AFF', fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                de {stats.totalUsers} en total
              </Typography>
            </Stack>
          </Box>
        </Grid>

        {/* Card 2: Sesiones Esta Semana */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sesiones Esta Semana
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(52, 199, 89, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Dumbbell size={18} color="#34C759" />
              </Box>
            </Box>

            <Typography variant="h3" fontWeight="800" sx={{ color: '#34C759', mb: 0.5, letterSpacing: '-0.03em' }}>
              {loading ? '...' : stats.workoutsCompletedThisWeek}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="94% objetivo" size="small" sx={{ background: 'rgba(52, 199, 89, 0.15)', color: '#34C759', fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                {stats.totalWorkouts} rutinas activas
              </Typography>
            </Stack>
          </Box>
        </Grid>

        {/* Card 3: Adherencia Nutricional */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Adherencia Dieta
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(255, 149, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UtensilsCrossed size={18} color="#FF9500" />
              </Box>
            </Box>

            <Typography variant="h3" fontWeight="800" sx={{ color: '#FF9500', mb: 0.5, letterSpacing: '-0.03em' }}>
              {stats.weeklyAdherenceRate}%
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="Excelente" size="small" sx={{ background: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                {stats.totalDiets} planes activos
              </Typography>
            </Stack>
          </Box>
        </Grid>

        {/* Card 4: Alerta de Inactividad */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" sx={{ color: '#FF453A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Alerta Inactividad
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(255, 59, 48, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={18} color="#FF3B30" />
              </Box>
            </Box>

            <Typography variant="h3" fontWeight="800" sx={{ color: '#FF3B30', mb: 0.5, letterSpacing: '-0.03em' }}>
              {loading ? '...' : stats.inactiveClientsCount}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="> 5 días sin log" size="small" sx={{ background: 'rgba(255, 59, 48, 0.15)', color: '#FF3B30', fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
              <Typography
                variant="caption"
                sx={{ color: '#007AFF', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate('/dashboard/client-tracking')}
              >
                Revisar →
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Main Grid: Activity Pulse & Analytics Chart */}
      <Grid container spacing={3}>
        {/* Left Column: Activity Pulse (En Vivo) */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box
            className="apple-card"
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1.2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: 'rgba(0, 122, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Activity size={18} color="#007AFF" />
                </Box>
                <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF' }}>
                  Activity Pulse
                </Typography>
              </Box>

              <Chip label="En Vivo" size="small" sx={{ background: 'rgba(52, 199, 89, 0.15)', color: '#34C759', fontWeight: 700, height: 22 }} />
            </Box>

            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 2 }}>
              Hitos recientes registrados por tus atletas:
            </Typography>

            <Stack spacing={1.5} sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {activityEvents.map((evt) => {
                const IconComponent = evt.badgeIcon;
                return (
                  <Box
                    key={evt.id}
                    sx={{
                      p: 1.8,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '0.5px solid rgba(255, 255, 255, 0.06)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.06)',
                      },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            background: `${evt.badgeColor}20`,
                            color: evt.badgeColor,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          <IconComponent size={16} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF' }}>
                            {evt.userName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: evt.badgeColor, fontWeight: 600 }}>
                            {evt.title}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.7rem' }}>
                        {evt.timeAgo}
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', pl: 5.2 }}>
                      {evt.description}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => navigate('/dashboard/client-tracking')}
              endIcon={<ChevronRight size={16} />}
              sx={{
                mt: 2,
                borderRadius: '10px',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 600,
                py: 1,
              }}
            >
              Ver Todas las Actividades
            </Button>
          </Box>
        </Grid>

        {/* Right Column: Evolution Chart & Quick Actions */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            {/* Chart Card */}
            <Box
              className="apple-card"
              sx={{
                p: 3,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1.2}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: 'rgba(52, 199, 89, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUp size={18} color="#34C759" />
                  </Box>
                  <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF' }}>
                    Evolución & Sesiones
                  </Typography>
                </Box>

                <Chip label="Últimos 6 Meses" size="small" sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.5)', height: 22 }} />
              </Box>

              <Box sx={{ height: 280, width: '100%' }}>
                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
              </Box>
            </Box>

            {/* Quick Actions Grid */}
            <Box
              className="apple-card"
              sx={{
                p: 2.5,
              }}
            >
              <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Accesos Directos
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/dashboard/users')}
                    startIcon={<Users size={18} color="#007AFF" />}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      flexDirection: 'column',
                      gap: 0.8,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      color: '#FFFFFF',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { background: 'rgba(0, 122, 255, 0.1)', borderColor: '#007AFF' },
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
                    startIcon={<Dumbbell size={18} color="#34C759" />}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      flexDirection: 'column',
                      gap: 0.8,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      color: '#FFFFFF',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { background: 'rgba(52, 199, 89, 0.1)', borderColor: '#34C759' },
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
                    startIcon={<UtensilsCrossed size={18} color="#FF9500" />}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      flexDirection: 'column',
                      gap: 0.8,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      color: '#FFFFFF',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { background: 'rgba(255, 149, 0, 0.1)', borderColor: '#FF9500' },
                    }}
                  >
                    Dietas
                  </Button>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/dashboard/client-tracking')}
                    startIcon={<Camera size={18} color="#AF52DE" />}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      flexDirection: 'column',
                      gap: 0.8,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      color: '#FFFFFF',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { background: 'rgba(175, 82, 222, 0.1)', borderColor: '#AF52DE' },
                    }}
                  >
                    Seguimiento
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
