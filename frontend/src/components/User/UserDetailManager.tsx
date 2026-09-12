// Componente de Ficha 360° del Alumno con información completa, biometría, dietas y entrenamientos
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  Divider,
  Tabs,
  Tab,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import { User } from '../../types/User';
import { Diet } from '../../types/Diet';
import { Workout } from '../../types/Workout';
import { ClientMedicalInfo } from '../../types/ClientMedicalInfo';
import { ClientProgressPhoto } from '../../types/ClientProgressPhoto';
import { WeeklyTracking } from '../../types/WeeklyTracking';
import * as userService from '../../services/userService';
import * as dietService from '../../services/dietService';
import * as workoutService from '../../services/workoutService';
import { clientMedicalInfoService } from '../../services/clientMedicalInfoService';
import { clientProgressPhotoService } from '../../services/clientProgressPhotoService';
import { weeklyTrackingService } from '../../services/weeklyTrackingService';
import { Iconify } from '../../utils/iconify';

import { BodyHeatmap } from '../Analytics/BodyHeatmap';
import { ExerciseProgressChart } from '../Analytics/ExerciseProgressChart';
import { calculateMuscleRecovery, MUSCLE_GROUPS } from '../../lib/recovery';
import { getUserLoggedSessions, LoggedSessionData } from '../../services/loggedSessionService';
import BeforeAfterSlider from '../Progress/BeforeAfterSlider';

// Helper de formateo de fecha ultra-seguro contra invalid dates o nulls
const formatDateSafe = (dateVal?: string | null): string => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES');
  } catch {
    return '—';
  }
};

export const UserDetailManager = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userDiets, setUserDiets] = useState<Diet[]>([]);
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
  const [medicalInfo, setMedicalInfo] = useState<ClientMedicalInfo | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<ClientProgressPhoto[]>([]);
  const [weeklyTracking, setWeeklyTracking] = useState<WeeklyTracking[]>([]);
  const [loggedSessions, setLoggedSessions] = useState<LoggedSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        setErrorMessage('El ID de usuario proporcionado no es válido.');
        setUser(null);
        return;
      }

      const userData = await userService.getUser(userId);
      setUser(userData);

      // 1. Cargar dietas asignadas (Priorizar consulta directa de usuario, fallback a búsqueda general)
      try {
        const userDietDirect = await dietService.getUserDiet(userId).catch(() => null);
        if (userDietDirect && userDietDirect.id) {
          setUserDiets([userDietDirect]);
        } else {
          const allDietsRaw = await dietService.getDiets().catch(() => []);
          const allDiets = Array.isArray(allDietsRaw) ? allDietsRaw : [];
          if (allDiets.length > 0) {
            const matchedDiets: Diet[] = [];
            for (const diet of allDiets) {
              try {
                const users = await dietService.getDietUsers(diet.id).catch(() => []);
                if (Array.isArray(users) && users.some((u: any) => u.id === userId)) {
                  matchedDiets.push(diet);
                }
              } catch {
                // Continuar sin interrumpir el resto de dietas
              }
            }
            setUserDiets(matchedDiets);
          } else {
            setUserDiets([]);
          }
        }
      } catch (e) {
        console.warn('Error loading diets for user:', e);
        setUserDiets([]);
      }

      // 2. Cargar entrenamientos asignados
      try {
        const allWorkoutsRaw = await workoutService.getWorkouts().catch(() => []);
        const allWorkouts = Array.isArray(allWorkoutsRaw) ? allWorkoutsRaw : [];
        const userWorkoutsList = allWorkouts.filter(
          (w) => w.user_id === userId || (w as any).userId === userId
        );
        setUserWorkouts(userWorkoutsList);
      } catch (e) {
        console.warn('Error loading workouts for user:', e);
        setUserWorkouts([]);
      }

      // 3. Cargar sesiones de entreno ejecutadas
      try {
        const sessionsRaw = await getUserLoggedSessions(userId).catch(() => []);
        setLoggedSessions(Array.isArray(sessionsRaw) ? sessionsRaw : []);
      } catch (e) {
        console.log('No logged sessions found:', e);
        setLoggedSessions([]);
      }

      // 4. Cargar datos CRM (médico, fotos, pesajes)
      if (userData && (userData.role === 'client' || userData.role === 'cliente')) {
        const [medData, photosData, trackData] = await Promise.all([
          clientMedicalInfoService.getByUserId(userId).catch(() => null),
          clientProgressPhotoService.getByUserId(userId).catch(() => []),
          weeklyTrackingService.getByUserId(userId).catch(() => []),
        ]);

        setMedicalInfo(medData);
        setProgressPhotos(Array.isArray(photosData) ? photosData : []);
        const validTrackData = Array.isArray(trackData) ? trackData : [];
        setWeeklyTracking(
          [...validTrackData].sort(
            (a, b) => new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
          )
        );
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      setErrorMessage(error?.message || 'Error al cargar los datos del usuario.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Sets ejecutados para heatmap muscular y gráfico de 1RM
  const { muscleLoad, activeExercises, exerciseHistoryForChart } = useMemo(() => {
    const loads: Record<string, number> = {};
    const exercisesMap: Record<string, { name: string; target_muscle?: string; sets: number }> = {};
    const chartHistory: Array<{ date: string; weight: number; reps: number; exerciseName: string }> = [];

    const safeSessions = Array.isArray(loggedSessions) ? loggedSessions : [];

    safeSessions.forEach((session) => {
      const sessionDate = session.completed_at || session.started_at || new Date().toISOString();
      const sets = session.logged_sets || session.sets || [];

      if (Array.isArray(sets)) {
        sets.forEach((set) => {
          const exName = set.exercises?.name || 'Ejercicio';
          const rawMuscle = (set.exercises?.target_muscle || set.exercises?.body_part || 'chest').toLowerCase();
          const stdMuscle = MUSCLE_GROUPS[rawMuscle] || rawMuscle;

          loads[stdMuscle] = (loads[stdMuscle] || 0) + 1;

          if (!exercisesMap[exName]) {
            exercisesMap[exName] = {
              name: exName,
              target_muscle: stdMuscle,
              sets: 0,
            };
          }
          exercisesMap[exName].sets += 1;

          if (set.completed && (set.weight ?? 0) > 0 && (set.reps ?? 0) > 0) {
            chartHistory.push({
              date: sessionDate,
              weight: Number(set.weight) || 0,
              reps: Number(set.reps) || 0,
              exerciseName: exName,
            });
          }
        });
      }
    });

    return {
      muscleLoad: loads,
      activeExercises: Object.values(exercisesMap),
      exerciseHistoryForChart: chartHistory,
    };
  }, [loggedSessions]);

  const latestTracking = weeklyTracking[0];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress color="info" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
            onClick={() => navigate('/dashboard/users')}
            sx={{
              borderRadius: '20px',
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { color: '#fff' },
            }}
          >
            Volver al Directorio
          </Button>
        </Box>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 2 }}>
          {errorMessage || 'Usuario no encontrado o no disponible.'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => loadUserData()}
          sx={{
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          Reintentar Carga
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ pb: 6 }}>
      {/* Top Back Navigation Strip */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<Iconify icon="solar:arrow-left-bold" />}
          onClick={() => navigate('/dashboard/users')}
          sx={{
            borderRadius: '20px',
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { color: '#fff' },
          }}
        >
          Volver al Directorio
        </Button>
      </Box>

      {/* 360° Athlete Profile Hero Card */}
      <Box
        className="liquid-glass-card"
        sx={{
          p: { xs: 3, md: 4 },
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
          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
            <Avatar
              sx={{
                width: 76,
                height: 76,
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                fontWeight: 900,
                fontSize: '1.8rem',
                border: '3px solid #22d3ee',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.6)',
              }}
            >
              {(user.name ? user.name.charAt(0) : 'U').toUpperCase()}
              {(user.surname ? user.surname.charAt(0) : '').toUpperCase()}
            </Avatar>

            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.02em' }}>
                  {user.name || 'Usuario'} {user.surname || ''}
                </Typography>
                <Chip
                  label={
                    user.role === 'client' || user.role === 'cliente'
                      ? 'Alumno'
                      : user.role === 'trainer'
                      ? 'Entrenador'
                      : user.role || 'Usuario'
                  }
                  size="small"
                  sx={{
                    background: 'rgba(6, 182, 212, 0.25)',
                    color: '#22d3ee',
                    fontWeight: 800,
                    border: '1px solid rgba(6, 182, 212, 0.5)',
                  }}
                />
              </Stack>

              <Stack direction="row" spacing={2.5} flexWrap="wrap" sx={{ color: 'text.secondary', mt: 0.5 }}>
                <Box display="flex" alignItems="center" gap={0.8}>
                  <Iconify icon="solar:letter-bold" width={16} sx={{ color: '#22d3ee' }} />
                  <Typography variant="body2">{user.email || 'Sin correo'}</Typography>
                </Box>
                {user.birth_date && (
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Iconify icon="solar:calendar-bold" width={16} sx={{ color: '#10b981' }} />
                    <Typography variant="body2">Nacimiento: {formatDateSafe(user.birth_date)}</Typography>
                  </Box>
                )}
                <Box display="flex" alignItems="center" gap={0.8}>
                  <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2">Alta: {formatDateSafe(user.created_at)}</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="solar:dumbbell-large-bold" />}
              onClick={() => navigate('/dashboard/workouts')}
              sx={{
                borderRadius: '20px',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Asignar Rutina
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="solar:chef-hat-bold" />}
              onClick={() => navigate('/dashboard/diets')}
              sx={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Asignar Dieta
            </Button>
          </Stack>
        </Box>

        {/* Quick Stat Pill Highlights */}
        <Grid container spacing={2} sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Sesiones Ejecutadas</Typography>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#22d3ee', mt: 0.3 }}>
              {loggedSessions.length}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Rutinas en Plan</Typography>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#10b981', mt: 0.3 }}>
              {userWorkouts.length}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Dietas Asignadas</Typography>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#f59e0b', mt: 0.3 }}>
              {userDiets.length}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Último Peso</Typography>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#fff', mt: 0.3 }}>
              {latestTracking?.weight != null ? `${latestTracking.weight} kg` : 'Sin pesaje'}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* 5 Liquid Glass Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 800,
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
          <Tab icon={<Iconify icon="solar:chart-square-bold" width={20} />} iconPosition="start" label="Resumen & Biometría" />
          <Tab icon={<Iconify icon="solar:dumbbell-large-bold" width={20} />} iconPosition="start" label={`Rutinas (${userWorkouts.length})`} />
          <Tab icon={<Iconify icon="solar:chef-hat-bold" width={20} />} iconPosition="start" label={`Nutrición (${userDiets.length})`} />
          <Tab icon={<Iconify icon="solar:camera-bold" width={20} />} iconPosition="start" label={`Fotos & Progreso (${progressPhotos.length})`} />
          <Tab icon={<Iconify icon="solar:health-bold" width={20} />} iconPosition="start" label="Ficha Médica & Lesiones" />
        </Tabs>
      </Box>

      {/* TAB 0: Resumen & Biometría (Heatmap Anatómico + 1RM Chart) */}
      {activeTab === 0 && (
        <Stack spacing={4}>
          <Box>
            <Typography variant="h5" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:fire-bold" width={24} sx={{ color: '#f43f5e' }} />
              Mapa Anatómico de Recuperación y Fatiga Muscular
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Cálculo en vivo de la carga acumulada y recuperación por grupo muscular basado en las series registradas por el alumno.
            </Typography>
            <BodyHeatmap muscleLoad={muscleLoad} activeExercises={activeExercises} />
          </Box>

          <Box>
            <ExerciseProgressChart history={exerciseHistoryForChart} />
          </Box>

          {latestTracking && (
            <Box
              className="liquid-glass-card"
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="h6" fontWeight="800" gutterBottom>
                Último Registro Semanal ({formatDateSafe(latestTracking.week_start_date)})
              </Typography>
              <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Peso Báscula</Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#22d3ee', mt: 0.5 }}>
                    {latestTracking.weight != null ? `${latestTracking.weight} kg` : '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Cintura</Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#10b981', mt: 0.5 }}>{latestTracking.waist_measurement || '—'} cm</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Bíceps</Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#f59e0b', mt: 0.5 }}>{latestTracking.bicep_measurement || '—'} cm</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Días Entrenados</Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#f43f5e', mt: 0.5 }}>{latestTracking.training_days_completed || 0} / 7</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </Stack>
      )}

      {/* TAB 1: Rutinas Asignadas */}
      {activeTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight="800">
                Rutinas Asignadas al Alumno
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Planes de entrenamiento activos que el alumno puede visualizar e iniciar.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:dumbbell-large-bold" />}
              onClick={() => navigate('/dashboard/workouts')}
              sx={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                fontWeight: 700,
              }}
            >
              Nueva Rutina
            </Button>
          </Box>

          {userWorkouts.length === 0 ? (
            <Box className="liquid-glass-card" sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
              <Typography color="text.secondary">No hay rutinas asignadas a este alumno actualmente.</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {userWorkouts.map((workout) => (
                <Grid size={{ xs: 12, md: 6 }} key={workout.id}>
                  <Box
                    className="liquid-glass-card"
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.25s ease',
                      '&:hover': { borderColor: 'rgba(6, 182, 212, 0.4)' },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Typography variant="h6" fontWeight="800">
                        {workout.name}
                      </Typography>
                      <Chip label={workout.category} size="small" color="primary" sx={{ fontWeight: 700 }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {workout.notes || 'Plan personalizado para hipertrofia y acondicionamiento general.'}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/dashboard/workouts')}
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      sx={{ borderRadius: '16px', textTransform: 'none', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      Ver Rutina en Gestor
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 2: Plan Nutricional */}
      {activeTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight="800">
                Plan Nutricional Asignado
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Dietas y balance calórico pautado para el alumno.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:chef-hat-bold" />}
              onClick={() => navigate('/dashboard/diets')}
              sx={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                fontWeight: 700,
              }}
            >
              Gestionar Dietas
            </Button>
          </Box>

          {userDiets.length === 0 ? (
            <Box className="liquid-glass-card" sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
              <Typography color="text.secondary">No hay dietas asignadas a este alumno.</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {userDiets.map((diet) => (
                <Grid size={{ xs: 12, md: 6 }} key={diet.id}>
                  <Box
                    className="liquid-glass-card"
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Typography variant="h6" fontWeight="800">
                        {diet.name}
                      </Typography>
                      <Chip
                        icon={<Iconify icon="solar:fire-bold" sx={{ color: '#f59e0b' }} />}
                        label={`${diet.calories} kcal`}
                        size="small"
                        sx={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 700 }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {diet.description || 'Pauta nutricional adaptada a los objetivos del alumno.'}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/dashboard/diets')}
                      startIcon={<Iconify icon="solar:eye-bold" />}
                      sx={{ borderRadius: '16px', textTransform: 'none', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      Ver en Gestor de Dietas
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 3: Fotos & Progreso (Before/After Slider) */}
      {activeTab === 3 && (
        <Stack spacing={4}>
          <Box>
            <Typography variant="h5" fontWeight="800" gutterBottom>
              Comparador Fotográfico de Transformación
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Desliza el visor para comparar las poses corporales del alumno en diferentes fechas.
            </Typography>
            <BeforeAfterSlider photos={progressPhotos} />
          </Box>

          {/* Historial de Pesajes Semanales */}
          <Box>
            <Typography variant="h6" fontWeight="800" gutterBottom>
              Historial de Reportes Semanales
            </Typography>

            {weeklyTracking.length === 0 ? (
              <Box className="liquid-glass-card" sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                <Typography color="text.secondary">No hay reportes semanales registrados para este alumno.</Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {weeklyTracking.map((w) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={w.id}>
                    <Box
                      className="liquid-glass-card"
                      sx={{
                        p: 2.5,
                        borderRadius: 3.5,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="800" gutterBottom>
                        Semana del {formatDateSafe(w.week_start_date)}
                      </Typography>
                      <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                      <Stack spacing={0.8}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Peso: <strong style={{ color: '#22d3ee' }}>{w.weight ? `${w.weight} kg` : '—'}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Días entrenados: <strong style={{ color: '#10b981' }}>{w.training_days_completed ?? '—'}/7</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Sueño: <strong style={{ color: '#f59e0b' }}>{w.sleep_quality || '—'}</strong>
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Stack>
      )}

      {/* TAB 4: Ficha Médica & Lesiones */}
      {activeTab === 4 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight="800">
                Ficha Médica, Lesiones & Observaciones
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Datos de anamnesis clínica, antecedentes y sensaciones fisiológicas.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => navigate(`/dashboard/users/${id}/medical-info`)}
              sx={{
                borderRadius: '20px',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Editar Ficha Médica
            </Button>
          </Box>

          {medicalInfo ? (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  className="liquid-glass-card"
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    background: 'rgba(244, 63, 94, 0.05)',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Iconify icon="solar:danger-triangle-bold" width={22} sx={{ color: '#f43f5e' }} />
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#fb7185' }}>
                      Alergias Conocidas
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="600">
                    {medicalInfo.allergies || 'Sin alergias especificadas'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  className="liquid-glass-card"
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    background: 'rgba(245, 158, 11, 0.05)',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Iconify icon="solar:forbidden-circle-bold" width={22} sx={{ color: '#f59e0b' }} />
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#fbbf24' }}>
                      Intolerancias Alimentarias
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="600">
                    {medicalInfo.food_intolerances || 'Sin intolerancias especificadas'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  className="liquid-glass-card"
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    background: 'rgba(59, 130, 246, 0.05)',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Iconify icon="solar:health-bold" width={22} sx={{ color: '#3b82f6' }} />
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#60a5fa' }}>
                      Lesiones o Molestias Articulares
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="600">
                    {medicalInfo.injuries_conditions || 'Sin lesiones o molestias registradas'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  className="liquid-glass-card"
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Iconify icon="solar:dislike-bold" width={22} sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle1" fontWeight="800">
                      Alimentos No Preferidos
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="600">
                    {medicalInfo.disliked_foods || 'Ninguno especificado'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  className="liquid-glass-card"
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" color="text.secondary" gutterBottom>
                    Analítica Sanguínea / Resultados Clínicos
                  </Typography>
                  <Typography variant="body1">
                    {medicalInfo.lab_results || 'No se han adjuntado analíticas clínicas.'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  className="liquid-glass-card"
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" color="text.secondary" gutterBottom>
                    Registro de Alimentación Típica Diaria
                  </Typography>
                  <Typography variant="body1">
                    {medicalInfo.daily_nutrition_log || 'No se ha registrado menú habitual.'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box className="liquid-glass-card" sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
              <Typography color="text.secondary">No hay información médica registrada para este alumno.</Typography>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default UserDetailManager;
