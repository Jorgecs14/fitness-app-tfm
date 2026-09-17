import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  CircularProgress,
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
  Wallet,
  TrendingDown,
} from 'lucide-react';

import { Chart } from '../utils/chart';
import * as userService from '../services/userService';
import * as dietService from '../services/dietService';
import * as workoutService from '../services/workoutService';
import { weeklyTrackingService } from '../services/weeklyTrackingService';
import { billingService, TrainerBillingSummary } from '../services/billingService';
import { User } from '../types/User';

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalDiets: number;
  totalWorkouts: number;
  activeTrackingsCount: number;
  monthlyData: {
    users: number[];
    workouts: number[];
    categories: string[];
  };
}

interface ActivityEvent {
  id: string;
  userName: string;
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
    totalDiets: 0,
    totalWorkouts: 0,
    activeTrackingsCount: 0,
    monthlyData: {
      users: [0, 0, 0, 0, 0, 0],
      workouts: [0, 0, 0, 0, 0, 0],
      categories: []
    }
  });
  const [billingSummary, setBillingSummary] = useState<TrainerBillingSummary | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
      loadDashboardStats(currentUser);
    } catch (e) {
      loadDashboardStats(null);
    }
  };

  const loadDashboardStats = async (currentUser: any) => {
    try {
      setLoading(true);

      let clients: User[] = [];
      if (currentUser && (currentUser.role === 'trainer' || currentUser.role === 'entrenador')) {
        clients = await userService.getTrainerClients(currentUser.id).catch(() => []);
      } else {
        const allUsers = await userService.getUsers().catch(() => []);
        clients = allUsers.filter((u) => u.role === 'client' || u.role === 'cliente');
      }

      const clientIds = clients.map((c) => c.id);

      const [allDiets, allWorkouts, billSummary] = await Promise.all([
        dietService.getDiets().catch(() => []),
        workoutService.getWorkouts().catch(() => []),
        billingService.getTrainerSummary().catch(() => null),
      ]);

      setBillingSummary(billSummary);

      const trainerWorkouts = allWorkouts.filter(
        (w: any) =>
          !w.user_id ||
          (currentUser && w.user_id === currentUser.id) ||
          clientIds.includes(w.user_id)
      );

      // Cargar eventos de actividad reales de los clientes del entrenador
      const events: ActivityEvent[] = [];
      let totalActiveTrackings = 0;

      // Obtener seguimientos recientes de los primeros clientes
      const trackingPromises = clients.slice(0, 15).map(async (client) => {
        try {
          const trackings = await weeklyTrackingService.getByUserId(client.id);
          if (trackings && trackings.length > 0) {
            totalActiveTrackings += trackings.length;
            const sorted = [...trackings].sort(
              (a, b) => new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
            );
            const latest = sorted[0];
            const dateObj = new Date(latest.week_start_date);
            const daysAgo = Math.max(0, Math.floor((new Date().getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)));
            const timeAgoStr = daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : `Hace ${daysAgo} días`;

            if (latest.weight) {
              events.push({
                id: `weight-${client.id}-${latest.id}`,
                userName: `${client.name} ${client.surname || ''}`.trim(),
                type: 'weight',
                title: 'Reporte de Pesaje',
                description: `Peso registrado: ${latest.weight} kg ${latest.waist_measurement ? `• Cintura: ${latest.waist_measurement} cm` : ''}`,
                timeAgo: timeAgoStr,
                badgeColor: '#007AFF',
                badgeIcon: Scale,
              });
            }
          }
        } catch {}
      });

      await Promise.all(trackingPromises);

      // Ordenar eventos de más reciente a más antiguo
      events.sort((a, b) => a.id.localeCompare(b.id));
      setActivityEvents(events.slice(0, 6));

      const monthlyData = calculateMonthlyData(clients, trainerWorkouts);

      setStats({
        totalUsers: clients.length,
        totalClients: clients.length,
        totalDiets: allDiets.length,
        totalWorkouts: trainerWorkouts.length,
        activeTrackingsCount: totalActiveTrackings,
        monthlyData,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyData = (users: any[], workouts: any[]) => {
    const months: string[] = [];
    const userCounts: number[] = [];
    const workoutCounts: number[] = [];

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
        },
        formatter: (val) => Math.round(val).toString(),
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
    { name: 'Nuevos Clientes', data: stats.monthlyData.users },
    { name: 'Rutinas Creadas', data: stats.monthlyData.workouts },
  ];

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
      {/* Apple Cockpit Header */}
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
                label="Panel Central de Entrenador"
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
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, fontSize: '0.78rem' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Stack>

            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, color: '#FFFFFF', fontSize: { xs: '1.4rem', sm: '1.85rem' } }}>
              Centro de Control 360°
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 680, fontSize: '0.85rem' }}>
              Supervisión en tiempo real de tus clientes, rutinas, dietas y facturación mensual.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.2} flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<Users size={15} />}
              onClick={() => navigate('/dashboard/crm')}
              sx={{
                borderRadius: '12px',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                py: 0.8,
                fontSize: '0.84rem',
                flex: { xs: 1, sm: 'none' },
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              Ver Clientes
            </Button>

            <Button
              variant="contained"
              startIcon={<Wallet size={15} />}
              onClick={() => navigate('/dashboard/billing')}
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#007AFF',
                px: 2.2,
                py: 0.8,
                fontSize: '0.84rem',
                flex: { xs: 1, sm: 'none' },
                boxShadow: '0 4px 14px rgba(0, 122, 255, 0.35)'
              }}
            >
              Facturación
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* 4 Inset Grouped Primary Metric Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
          width: '100%',
          minWidth: 0
        }}
      >
        {/* Card 1: Clientes Activos */}
        <Box
          sx={{
            p: 2.2,
            borderRadius: '18px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: 'rgba(0, 122, 255, 0.4)', transform: 'translateY(-2px)' }
          }}
          onClick={() => navigate('/dashboard/crm')}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.2}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              Clientes en Cartera
            </Typography>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: 'rgba(0, 122, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={16} color="#007AFF" />
            </Box>
          </Box>

          <Typography variant="h4" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.3, letterSpacing: '-0.03em', fontSize: '1.6rem' }}>
            {loading ? '...' : stats.totalClients}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Bajo tu tutela" size="small" sx={{ background: 'rgba(0, 122, 255, 0.15)', color: '#007AFF', fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.72rem' }}>
              Acceso Clientes →
            </Typography>
          </Stack>
        </Box>

        {/* Card 2: Rutinas */}
        <Box
          sx={{
            p: 2.2,
            borderRadius: '18px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: 'rgba(52, 199, 89, 0.4)', transform: 'translateY(-2px)' }
          }}
          onClick={() => navigate('/dashboard/workouts')}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.2}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              Rutinas Creadas
            </Typography>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: 'rgba(52, 199, 89, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Dumbbell size={16} color="#34C759" />
            </Box>
          </Box>

          <Typography variant="h4" fontWeight="800" sx={{ color: '#34C759', mb: 0.3, letterSpacing: '-0.03em', fontSize: '1.6rem' }}>
            {loading ? '...' : stats.totalWorkouts}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Biblioteca" size="small" sx={{ background: 'rgba(52, 199, 89, 0.15)', color: '#34C759', fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.72rem' }}>
              Ver Rutinas →
            </Typography>
          </Stack>
        </Box>

        {/* Card 3: Dietas */}
        <Box
          sx={{
            p: 2.2,
            borderRadius: '18px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: 'rgba(255, 149, 0, 0.4)', transform: 'translateY(-2px)' }
          }}
          onClick={() => navigate('/dashboard/diets')}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.2}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              Planes Dietéticos
            </Typography>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: 'rgba(255, 149, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UtensilsCrossed size={16} color="#FF9500" />
            </Box>
          </Box>

          <Typography variant="h4" fontWeight="800" sx={{ color: '#FF9500', mb: 0.3, letterSpacing: '-0.03em', fontSize: '1.6rem' }}>
            {loading ? '...' : stats.totalDiets}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Configurados" size="small" sx={{ background: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.72rem' }}>
              Ver Dietas →
            </Typography>
          </Stack>
        </Box>

        {/* Card 4: Facturación / MRR */}
        <Box
          sx={{
            p: 2.2,
            borderRadius: '18px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: 'rgba(56, 189, 248, 0.5)', transform: 'translateY(-2px)' }
          }}
          onClick={() => navigate('/dashboard/billing')}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.2}>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              MRR Cuotas
            </Typography>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wallet size={16} color="#38bdf8" />
            </Box>
          </Box>

          <Typography variant="h4" fontWeight="900" sx={{ color: '#38bdf8', mb: 0.3, letterSpacing: '-0.02em', fontSize: '1.6rem' }}>
            {billingSummary ? `${billingSummary.mrr.toFixed(2)} €` : '0.00 €'}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${billingSummary?.pending_payments || 0} pendientes`}
              size="small"
              sx={{
                background: (billingSummary?.pending_payments || 0) > 0 ? 'rgba(255, 149, 0, 0.15)' : 'rgba(52, 199, 89, 0.15)',
                color: (billingSummary?.pending_payments || 0) > 0 ? '#FF9500' : '#34C759',
                fontWeight: 700,
                height: 20,
                fontSize: '0.68rem'
              }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.72rem' }}>
              Gestión Cobros →
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Main Grid: Activity Feed & Analytics Chart */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1.4fr' },
          gap: 2.5,
          width: '100%',
          minWidth: 0
        }}
      >
        {/* Left Column: Activity Feed Real */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: '20px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            minWidth: 0
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  background: 'rgba(0, 122, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={16} color="#007AFF" />
              </Box>
              <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', fontSize: '0.98rem' }}>
                Actividad de Clientes
              </Typography>
            </Box>

            <Chip label="Directo BD" size="small" sx={{ background: 'rgba(52, 199, 89, 0.15)', color: '#34C759', fontWeight: 700, height: 20, fontSize: '0.68rem' }} />
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 2, fontSize: '0.75rem' }}>
            Últimos registros biométricos y reportes de tus clientes:
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
              <CircularProgress size={28} sx={{ color: '#007AFF' }} />
            </Box>
          ) : activityEvents.length === 0 ? (
            <Box
              sx={{
                p: 3,
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                my: 'auto'
              }}
            >
              <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                No hay registros recientes aún. Cuando tus clientes reporten su peso o completen progresos, aparecerán aquí.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.2} sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {activityEvents.map((evt) => {
                const IconComponent = evt.badgeIcon;
                return (
                  <Box
                    key={evt.id}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '0.5px solid rgba(255, 255, 255, 0.06)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            background: `${evt.badgeColor}20`,
                            color: evt.badgeColor,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          <IconComponent size={14} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF', fontSize: '0.84rem' }}>
                            {evt.userName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: evt.badgeColor, fontWeight: 600, fontSize: '0.72rem' }}>
                            {evt.title}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.68rem' }}>
                        {evt.timeAgo}
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', pl: 4.5, fontSize: '0.75rem' }}>
                      {evt.description}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          )}

          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => navigate('/dashboard/progress')}
            endIcon={<ChevronRight size={15} />}
            sx={{
              mt: 2,
              borderRadius: '10px',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              py: 0.8,
              fontSize: '0.8rem',
              '&:hover': {
                borderColor: '#007AFF',
                background: 'rgba(0, 122, 255, 0.1)',
              }
            }}
          >
            Ver Módulo de Progresos
          </Button>
        </Box>

        {/* Right Column: Evolution Chart & Quick Actions */}
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          {/* Chart Card */}
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: '20px',
              bgcolor: 'var(--bg-card, #18181b)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              minWidth: 0,
              boxSizing: 'border-box'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    background: 'rgba(52, 199, 89, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp size={16} color="#34C759" />
                </Box>
                <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', fontSize: '0.98rem' }}>
                  Evolución de Cartera & Rutinas
                </Typography>
              </Box>

              <Chip label="Últimos 6 Meses" size="small" sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.5)', height: 20, fontSize: '0.68rem' }} />
            </Box>

            <Box sx={{ height: 260, width: '100%', minWidth: 0, overflow: 'hidden' }}>
              <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
            </Box>
          </Box>

          {/* Quick Actions Grid */}
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: '20px',
              bgcolor: 'var(--bg-card, #18181b)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxSizing: 'border-box'
            }}
          >
            <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.72rem' }}>
              Accesos Directos
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                gap: 1.5
              }}
            >
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/dashboard/crm')}
                startIcon={<Users size={17} color="#007AFF" />}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  flexDirection: 'column',
                  gap: 0.6,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '&:hover': { background: 'rgba(0, 122, 255, 0.1)', borderColor: '#007AFF' },
                }}
              >
                Clientes
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/dashboard/workouts')}
                startIcon={<Dumbbell size={17} color="#34C759" />}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  flexDirection: 'column',
                  gap: 0.6,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '&:hover': { background: 'rgba(52, 199, 89, 0.1)', borderColor: '#34C759' },
                }}
              >
                Rutinas
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/dashboard/diets')}
                startIcon={<UtensilsCrossed size={17} color="#FF9500" />}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  flexDirection: 'column',
                  gap: 0.6,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '&:hover': { background: 'rgba(255, 149, 0, 0.1)', borderColor: '#FF9500' },
                }}
              >
                Dietas
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/dashboard/billing')}
                startIcon={<Wallet size={17} color="#38bdf8" />}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  flexDirection: 'column',
                  gap: 0.6,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '&:hover': { background: 'rgba(56, 189, 248, 0.1)', borderColor: '#38bdf8' },
                }}
              >
                Facturación
              </Button>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default HomePage;
