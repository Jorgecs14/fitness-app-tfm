import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '../utils/iconify';
import { getCurrentUser } from '../services/userService';
import { getWorkoutsWithExercises, getWorkoutDetails } from '../services/workoutService';
import { getDietsWithFoods, getDietUsers, getDietWithFoods, getUserDiet } from '../services/dietService';
import { getUserLoggedSessions, LoggedSessionData } from '../services/loggedSessionService';
import { User } from '../types/User';
import { WorkoutWithExercises } from '../types/WorkoutWithExercises';
import { DietWithFoods } from '../types/DietWithFoods';
import { LiveWorkoutDialog } from '../components/Workouts/LiveWorkoutDialog';
import { ClientWorkoutBuilderModal } from '../components/Workouts/ClientWorkoutBuilderModal';
import { BodyHeatmap } from '../components/Analytics/BodyHeatmap';
import { loadOf } from '../lib/muscles';

export const ClientHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignedWorkouts, setAssignedWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [assignedDiet, setAssignedDiet] = useState<DietWithFoods | null>(null);
  const [loggedSessions, setLoggedSessions] = useState<LoggedSessionData[]>([]);
  const [activeLiveWorkout, setActiveLiveWorkout] = useState<any | null>(null);
  const [liveWorkoutOpen, setLiveWorkoutOpen] = useState(false);
  const [workoutBuilderOpen, setWorkoutBuilderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingWorkoutId, setLoadingWorkoutId] = useState<number | null>(null);

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Cargar rutinas completas con ejercicios
      try {
        const workouts = await getWorkoutsWithExercises();
        const userWorkouts = workouts.filter((w) => w.user_id === user.id);
        setAssignedWorkouts(userWorkouts);
      } catch (wErr) {
        console.error('Error cargando rutinas:', wErr);
      }

      // Cargar dieta del cliente
      try {
        let matchedDiet = await getUserDiet(user.id);
        if (!matchedDiet) {
          const diets = await getDietsWithFoods();
          for (const d of diets) {
            try {
              const dietUsers = await getDietUsers(d.id);
              if (dietUsers.some((u: any) => u.id === user.id)) {
                matchedDiet = await getDietWithFoods(d.id);
                break;
              }
            } catch (duErr) {
              // Ignorar
            }
          }
          if (!matchedDiet && diets.length > 0) {
            matchedDiet = diets[0];
          }
        }
        setAssignedDiet(matchedDiet);
      } catch (dErr) {
        console.error('Error cargando dietas:', dErr);
      }

      // Cargar historial de ejecuciones en vivo
      try {
        const sessions = await getUserLoggedSessions(user.id);
        setLoggedSessions(sessions);
      } catch (e) {
        console.log('No logged sessions found:', e);
      }
    } catch (err) {
      console.error('Error general cargando datos del cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar entrenamiento en vivo cargando la información completa del workout
  const handleStartLiveWorkout = async (workout: any) => {
    setLoadingWorkoutId(workout.id);
    try {
      const fullDetails = await getWorkoutDetails(workout.id);
      setActiveLiveWorkout(fullDetails);
      setLiveWorkoutOpen(true);
    } catch (err) {
      console.error('Error obteniendo detalles del workout, usando datos locales:', err);
      setActiveLiveWorkout(workout);
      setLiveWorkoutOpen(true);
    } finally {
      setLoadingWorkoutId(null);
    }
  };

  // Sesiones de los últimos 7 días (esta semana)
  const now = new Date();
  const thisWeekSessions = loggedSessions.filter((s) => {
    const d = new Date(s.completed_at || s.started_at || '');
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  // Cálculo de Carga Muscular Semanal (Series efectivas acumuladas)
  const activeItemsForMuscleLoad: Array<{ sets: number; exercise: any }> = [];
  const activeExerciseListForDetails: Array<{ name: string; target_muscle?: string; sets?: number }> = [];

  // 1. Extraer series completadas de las sesiones de esta semana
  thisWeekSessions.forEach((session) => {
    (session.logged_sets || session.sets || []).forEach((s) => {
      const ex = s.exercises || {
        id: s.exercise_id,
        name: 'Ejercicio',
        target_muscle: s.exercises?.target_muscle,
        body_part: s.exercises?.body_part,
      };
      activeItemsForMuscleLoad.push({ sets: 1, exercise: ex });
      activeExerciseListForDetails.push({
        name: ex.name,
        target_muscle: ex.target_muscle || ex.body_part,
        sets: 1,
      });
    });
  });

  // 2. Si el usuario aún no ha completado series esta semana, proyectar a partir de sus rutinas asignadas
  if (activeItemsForMuscleLoad.length === 0 && assignedWorkouts.length > 0) {
    assignedWorkouts.forEach((w) => {
      const weList = w.workout_exercises || w.exercises || [];
      weList.forEach((item: any) => {
        const ex = item.exercises || item;
        const numSets = Number(item.sets) || 3;
        activeItemsForMuscleLoad.push({ sets: numSets, exercise: ex });
        activeExerciseListForDetails.push({
          name: ex.name || 'Ejercicio',
          target_muscle: ex.target_muscle || ex.body_part,
          sets: numSets,
        });
      });
    });
  }

  const calculatedMuscleLoad = loadOf(activeItemsForMuscleLoad);

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={48} color="primary" />
        <Typography sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic', fontWeight: 500 }}>
          Cargando tu ecosistema de entrenamiento y mapa corporal...
        </Typography>
      </Box>
    );
  }

  // Rutina recomendada para entrenar hoy (primera disponible)
  const spotlightWorkout = assignedWorkouts.length > 0 ? assignedWorkouts[0] : null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3.5 }, maxWidth: 1240, mx: 'auto' }}>
      {/* =========================================================================
          HERO BANNER - ESTILO iOS 26 LIQUID GLASS
          ========================================================================= */}
      <Box className="liquid-hero-banner" sx={{ p: { xs: 3, sm: 4 }, mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
          <Box sx={{ zIndex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }} flexWrap="wrap" gap={0.8}>
              <Box className="liquid-pill" sx={{ bgcolor: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', px: 1.8, py: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Iconify icon="solar:fire-bold" width={18} sx={{ color: '#f59e0b' }} />
                <span>Racha: {thisWeekSessions.length} sesiones esta semana</span>
              </Box>

              <Box className="liquid-pill" sx={{ bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#475569', px: 1.8, py: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Iconify icon="solar:calendar-bold" width={16} />
                <span style={{ textTransform: 'capitalize' }}>
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </Box>
            </Stack>

            <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.03em', color: '#0f172a' }}>
              ¡Hola, {currentUser?.name || 'Atleta'}! 👋
            </Typography>

            <Typography variant="body1" sx={{ mt: 0.8, color: '#475569', maxWidth: 640, lineHeight: 1.6 }}>
              Visualiza en tiempo real el estímulo muscular de tu cuerpo, sigue tus rutinas con demostraciones en vídeo y mantén el control de tus macros.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1} sx={{ zIndex: 1 }}>
            <Button
              variant="contained"
              className="liquid-pill"
              color="primary"
              size="large"
              startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
              onClick={() => setWorkoutBuilderOpen(true)}
              sx={{ px: 3, py: 1.4, boxShadow: '0 8px 20px rgba(0, 167, 111, 0.35)' }}
            >
              Crear Rutina
            </Button>

            <Button
              variant="outlined"
              className="liquid-pill"
              color="inherit"
              size="large"
              startIcon={<Iconify icon="solar:camera-add-bold" width={20} />}
              onClick={() => navigate('/dashboard/submit-progress')}
              sx={{ px: 2.5, py: 1.4, bgcolor: 'rgba(255,255,255,0.7)', borderColor: 'rgba(226,232,240,0.9)' }}
            >
              Progreso
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* =========================================================================
          MAPA DE CALOR ANATÓMICO CORPORAL (FLAGSHIP FEATURE)
          ========================================================================= */}
      <Box sx={{ mb: 4 }}>
        <BodyHeatmap
          muscleLoad={calculatedMuscleLoad}
          activeExercises={activeExerciseListForDetails}
        />
      </Box>

      {/* =========================================================================
          TARJETA DESTACADA: ENTRENAMIENTO RECOMENDADO PARA HOY
          ========================================================================= */}
      {spotlightWorkout ? (
        <Box
          className="liquid-glass-card"
          sx={{
            mb: 4,
            p: { xs: 2.5, sm: 3.5 },
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 41, 59, 0.96) 100%)',
            color: 'white',
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.25)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }} flexWrap="wrap" gap={0.8}>
                <Chip
                  icon={<Iconify icon="solar:flame-bold" sx={{ color: '#22c55e !important' }} />}
                  label="ENTRENAMIENTO RECOMENDADO"
                  size="small"
                  sx={{ bgcolor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontWeight: 'bold' }}
                />
                <Chip
                  label={spotlightWorkout.category}
                  size="small"
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', color: 'white', fontWeight: 600 }}
                />
              </Stack>

              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                {spotlightWorkout.name}
              </Typography>

              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.75)', maxWidth: 650, mb: 2 }}>
                {spotlightWorkout.notes || 'Rutina con seguimiento en vivo de series, repeticiones, cargas y tiempos de descanso.'}
              </Typography>

              <Stack direction="row" spacing={2.5} flexWrap="wrap" gap={1}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Iconify icon="solar:dumbbell-large-bold" width={18} sx={{ color: '#38bdf8' }} />
                  {(spotlightWorkout.workout_exercises || spotlightWorkout.exercises || []).length} ejercicios estructurados
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Iconify icon="solar:clock-circle-bold" width={18} sx={{ color: '#f59e0b' }} />
                  ~45 - 60 min estimados
                </Typography>
              </Stack>
            </Box>

            <Button
              variant="contained"
              className="liquid-pill"
              color="success"
              size="large"
              disabled={loadingWorkoutId === spotlightWorkout.id}
              startIcon={
                loadingWorkoutId === spotlightWorkout.id ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="solar:play-circle-bold" width={26} height={26} />
                )
              }
              onClick={() => handleStartLiveWorkout(spotlightWorkout)}
              sx={{
                px: 4,
                py: 1.8,
                fontSize: '1.05rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.45)',
                bgcolor: '#22c55e',
                '&:hover': { bgcolor: '#16a34a' },
              }}
            >
              {loadingWorkoutId === spotlightWorkout.id ? 'Cargando Rutina...' : 'Comenzar Entrenamiento Ya'}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box
          className="liquid-glass-card"
          sx={{
            mb: 4,
            p: 3,
            borderStyle: 'dashed',
            borderColor: '#94a3b8',
            textAlign: 'center',
          }}
        >
          <Iconify icon="solar:dumbbell-large-minimalistic-broken" width={52} height={52} sx={{ color: 'primary.main', mb: 1.5 }} />
          <Typography variant="h6" fontWeight="bold">
            ¿Listo para diseñar tu primera rutina?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}>
            Elige una plantilla contrastada (Tirón/Empuje/Pierna, Torso/Pierna o Full Body) o agrega ejercicios de la biblioteca en 1 clic.
          </Typography>
          <Button
            variant="contained"
            className="liquid-pill"
            color="primary"
            startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
            onClick={() => setWorkoutBuilderOpen(true)}
          >
            Elegir Plantilla de Rutina
          </Button>
        </Box>
      )}

      {/* =========================================================================
          BLOQUE DE CONTENIDO: MIS RUTINAS & NUTRICIÓN / PERFIL
          ========================================================================= */}
      <Grid container spacing={3}>
        {/* Mis Rutinas de Entrenamiento */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box className="liquid-glass-card" sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📋 Mis Rutinas de Entrenamiento ({assignedWorkouts.length})
              </Typography>
              <Button
                size="small"
                variant="outlined"
                className="liquid-pill"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => setWorkoutBuilderOpen(true)}
              >
                Nueva Rutina
              </Button>
            </Stack>
            <Divider sx={{ mb: 2.5 }} />

            {assignedWorkouts.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Aún no tienes rutinas guardadas. Pulsa en <strong>"Nueva Rutina"</strong> para crear una o cargar una plantilla prediseñada.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {assignedWorkouts.map((workout) => {
                  const exerciseCount = (workout.workout_exercises || workout.exercises || []).length;
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={workout.id}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 3.5,
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          height: '100%',
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {workout.name}
                            </Typography>
                            <Chip label={workout.category} size="small" color="primary" variant="outlined" />
                          </Stack>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40, fontSize: '0.85rem' }}>
                            {workout.notes || 'Rutina personalizada'}
                          </Typography>

                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 2 }}>
                            <Iconify icon="solar:dumbbell-bold" width={16} /> {exerciseCount} ejercicios estructurados
                          </Typography>
                        </Box>

                        <Button
                          variant="contained"
                          color="success"
                          fullWidth
                          className="liquid-pill"
                          disabled={loadingWorkoutId === workout.id}
                          startIcon={
                            loadingWorkoutId === workout.id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Iconify icon="eva:play-circle-fill" />
                            )
                          }
                          onClick={() => handleStartLiveWorkout(workout)}
                          sx={{ fontWeight: 'bold' }}
                        >
                          {loadingWorkoutId === workout.id ? 'Cargando...' : 'Entrenar Ya'}
                        </Button>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Grid>

        {/* Panel Lateral: Mi Plan de Nutrición & Perfil */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Card Dieta & Retos Diarios */}
            <Box className="liquid-glass-card" sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🥗 Mi Dieta Diaria
                </Typography>
                <Button size="small" onClick={() => navigate('/dashboard/client-diet')}>
                  Gestionar
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {assignedDiet ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {assignedDiet.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem', maxHeight: 60, overflow: 'hidden' }}>
                    {assignedDiet.description || 'Pautas de alimentación adaptadas a tus metas.'}
                  </Typography>

                  <Chip
                    icon={<Iconify icon="solar:fire-bold" sx={{ color: '#f59e0b !important' }} />}
                    label={`${assignedDiet.calories} Kcal Diarias`}
                    sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 'bold', mb: 2.5 }}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    color="primary"
                    className="liquid-pill"
                    onClick={() => navigate('/dashboard/client-diet')}
                    startIcon={<Iconify icon="eva:checkmark-square-2-fill" />}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Marcar Comidas de Hoy
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Aún no has configurado tu plan de alimentación semanal.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    className="liquid-pill"
                    onClick={() => navigate('/dashboard/client-diet')}
                  >
                    Crear Mi Plan Nutricional
                  </Button>
                </Box>
              )}
            </Box>

            {/* Card Estado del Alumno / Entrenador */}
            <Box className="liquid-glass-card" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">
                ESTADO DEL ATLETA
              </Typography>
              <Divider sx={{ my: 1.5 }} />

              {currentUser?.trainer ? (
                <Stack spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.6rem', fontWeight: 'bold' }}>
                    {currentUser.trainer.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {currentUser.trainer.name} {currentUser.trainer.surname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentUser.trainer.email}
                    </Typography>
                  </Box>
                  <Chip icon={<Iconify icon="solar:shield-check-bold" />} label="Entrenador Asignado" color="success" size="small" />
                  <Button
                    variant="outlined"
                    fullWidth
                    className="liquid-pill"
                    startIcon={<Iconify icon="eva:email-fill" />}
                    href={`mailto:${currentUser.trainer.email}`}
                  >
                    Contactar
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ py: 1 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: '#00a76f', mx: 'auto', mb: 1 }}>
                    <Iconify icon="solar:user-bold" width={32} height={32} />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Modo Atleta Autónomo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2, fontSize: '0.825rem' }}>
                    Controlas tus propias cargas, entrenamientos y dieta de forma independiente.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    className="liquid-pill"
                    startIcon={<Iconify icon="solar:book-bookmark-bold" />}
                    onClick={() => navigate('/dashboard/exercises')}
                  >
                    Biblioteca de Ejercicios
                  </Button>
                </Box>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* =========================================================================
          MODALES DE SESIÓN EN VIVO Y CREADOR DE RUTINAS
          ========================================================================= */}
      {activeLiveWorkout && (
        <LiveWorkoutDialog
          open={liveWorkoutOpen}
          workout={activeLiveWorkout}
          userId={currentUser?.id || 1}
          onClose={() => setLiveWorkoutOpen(false)}
          onSessionSuccess={() => {
            loadClientData();
          }}
        />
      )}

      {currentUser && (
        <ClientWorkoutBuilderModal
          open={workoutBuilderOpen}
          onClose={() => setWorkoutBuilderOpen(false)}
          userId={currentUser.id}
          onSuccess={() => {
            loadClientData();
          }}
        />
      )}
    </Box>
  );
};

export default ClientHomePage;
