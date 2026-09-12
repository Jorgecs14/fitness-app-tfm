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
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '../utils/iconify';
import { getCurrentUser } from '../services/userService';
import { getWorkoutsWithExercises, getWorkoutDetails } from '../services/workoutService';
import { getDietsWithFoods, getDietUsers, getDietWithFoods } from '../services/dietService';
import { getUserLoggedSessions, LoggedSessionData } from '../services/loggedSessionService';
import { User } from '../types/User';
import { WorkoutWithExercises } from '../types/WorkoutWithExercises';
import { DietWithFoods } from '../types/DietWithFoods';
import { LiveWorkoutDialog } from '../components/Workouts/LiveWorkoutDialog';
import { ClientWorkoutBuilderModal } from '../components/Workouts/ClientWorkoutBuilderModal';
import { BodyHeatmap } from '../components/Analytics/BodyHeatmap';
import { calculateMuscleRecovery } from '../lib/recovery';

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

      // Cargar dietas del cliente
      try {
        const diets = await getDietsWithFoods();
        let matchedDiet: DietWithFoods | null = null;
        for (const d of diets) {
          try {
            const dietUsers = await getDietUsers(d.id);
            if (dietUsers.some((u: any) => u.id === user.id)) {
              matchedDiet = await getDietWithFoods(d.id);
              break;
            }
          } catch (duErr) {
            // Ignorar error individual
          }
        }
        if (!matchedDiet && diets.length > 0) {
          matchedDiet = diets[0];
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

  // Preparar datos para el mapa de calor muscular
  const allSets: any[] = [];
  loggedSessions.forEach((session) => {
    const sessionDate = session.completed_at || session.started_at || new Date().toISOString();
    (session.logged_sets || session.sets || []).forEach((s) => {
      allSets.push({
        target_muscle: s.exercises?.target_muscle,
        main_muscle_group: s.exercises?.body_part,
        weight: s.weight,
        reps: s.reps,
        created_at: sessionDate,
      });
    });
  });

  const muscleStatusMap = calculateMuscleRecovery(allSets);

  // Sesiones de esta semana
  const thisWeekSessions = loggedSessions.filter((s) => {
    const d = new Date(s.completed_at || s.started_at || '');
    const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={45} />
        <Typography sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
          Cargando tu panel de rendimiento físico...
        </Typography>
      </Box>
    );
  }

  // Rutina destacada para entrenar hoy (primera disponible)
  const spotlightWorkout = assignedWorkouts.length > 0 ? assignedWorkouts[0] : null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Banner de Bienvenida y Resumen Semanal */}
      <Paper
        sx={{
          p: 3.5,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #00a76f 0%, #007867 100%)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0, 167, 111, 0.25)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2.5}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                icon={<Iconify icon="solar:fire-bold" width={18} />}
                label={`Racha Activa: ${thisWeekSessions.length} días esta semana`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
              />
              <Chip
                icon={<Iconify icon="solar:calendar-bold" width={18} />}
                label={new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}
              />
            </Stack>

            <Typography variant="h3" fontWeight="bold">
              ¡Hola, {currentUser?.name || 'Atleta'}! 👋
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5, opacity: 0.9 }}>
              Panel interactivo de rendimiento. Controla tus rutinas, registra cada serie en vivo y gestiona tu nutrición.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
            <Button
              variant="contained"
              sx={{ bgcolor: 'white', color: '#007867', fontWeight: 'bold', borderRadius: 2.5, '&:hover': { bgcolor: '#f0fdf4' } }}
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={() => setWorkoutBuilderOpen(true)}
            >
              Crear Rutina
            </Button>

            <Button
              variant="contained"
              color="warning"
              startIcon={<Iconify icon="solar:camera-add-bold" />}
              onClick={() => navigate('/dashboard/submit-progress')}
              sx={{ fontWeight: 'bold', borderRadius: 2.5 }}
            >
              Reporte Semanal
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* TARJETA DESTACADA: ENTRENAR HOY (ESTILO OPENGYM) */}
      {spotlightWorkout ? (
        <Card
          sx={{
            mb: 3,
            p: 3,
            borderRadius: 3,
            bgcolor: '#161c24',
            color: 'white',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip label="LISTA PARA HOY" size="small" color="success" sx={{ fontWeight: 'bold' }} />
                <Chip label={spotlightWorkout.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }} />
              </Stack>
              <Typography variant="h4" fontWeight="bold">
                {spotlightWorkout.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                {spotlightWorkout.notes || 'Rutina lista para ejecutar con seguimiento de series y descansos.'}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:dumbbell-large-bold" /> {(spotlightWorkout.workout_exercises || spotlightWorkout.exercises || []).length} ejercicios configurados
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:clock-circle-bold" /> ~45 - 60 min estimados
                </Typography>
              </Stack>
            </Box>

            <Button
              variant="contained"
              color="success"
              size="large"
              disabled={loadingWorkoutId === spotlightWorkout.id}
              startIcon={
                loadingWorkoutId === spotlightWorkout.id ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="solar:play-circle-bold" width={24} height={24} />
                )
              }
              onClick={() => handleStartLiveWorkout(spotlightWorkout)}
              sx={{
                px: 3.5,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2.5,
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.4)',
              }}
            >
              {loadingWorkoutId === spotlightWorkout.id ? 'Cargando Ejercicios...' : 'Comenzar Entrenamiento Ya'}
            </Button>
          </Stack>
        </Card>
      ) : (
        <Card sx={{ mb: 3, p: 3, borderRadius: 3, bgcolor: '#f8fafc', border: '2px dashed #cbd5e1' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                🏋️ ¿Listo para tu primer entrenamiento?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No tienes ninguna rutina creada todavía. Elige una de nuestras plantillas contrastadas (Push/Pull/Legs, Torso/Pierna o Full Body) en 1 solo clic.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
              onClick={() => setWorkoutBuilderOpen(true)}
              sx={{ fontWeight: 'bold', borderRadius: 2 }}
            >
              Elegir Plantilla de Rutina
            </Button>
          </Stack>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Mis Rutinas de Entrenamiento */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📋 Mis Rutinas ({assignedWorkouts.length})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={() => setWorkoutBuilderOpen(true)}
                >
                  Nueva Rutina
                </Button>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              {assignedWorkouts.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Aún no tienes rutinas guardadas. Pulsa en <strong>"Nueva Rutina"</strong> para crear una o cargar una plantilla prediseñada.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {assignedWorkouts.map((workout) => {
                    const exerciseCount = (workout.workout_exercises || workout.exercises || []).length;
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={workout.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderRadius: 2.5,
                            p: 2.5,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                          }}
                        >
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {workout.name}
                              </Typography>
                              <Chip label={workout.category} size="small" color="primary" variant="outlined" />
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40 }}>
                              {workout.notes || 'Rutina personalizada'}
                            </Typography>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                              <Iconify icon="solar:dumbbell-bold" /> {exerciseCount} ejercicios asignados
                            </Typography>
                          </Box>

                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            size="medium"
                            disabled={loadingWorkoutId === workout.id}
                            startIcon={
                              loadingWorkoutId === workout.id ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <Iconify icon="eva:play-circle-fill" />
                              )
                            }
                            onClick={() => handleStartLiveWorkout(workout)}
                            sx={{ fontWeight: 'bold', borderRadius: 2 }}
                          >
                            {loadingWorkoutId === workout.id ? 'Cargando...' : 'Entrenar Ya'}
                          </Button>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tarjeta de Entrenador o Modo Autónomo */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">
                ESTADO DEL ALUMNO
              </Typography>
              <Divider sx={{ my: 1.5 }} />

              {currentUser?.trainer ? (
                <Stack spacing={2} alignItems="center">
                  <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    {currentUser.trainer.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {currentUser.trainer.name} {currentUser.trainer.surname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentUser.trainer.email}
                    </Typography>
                  </Box>
                  <Chip icon={<Iconify icon="solar:shield-check-bold" />} label="Entrenador Asignado" color="success" size="small" />
                  <Button variant="outlined" fullWidth startIcon={<Iconify icon="eva:email-fill" />} href={`mailto:${currentUser.trainer.email}`}>
                    Contactar
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ py: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: '#00a76f', mx: 'auto', mb: 1.5 }}>
                    <Iconify icon="solar:user-bold" width={36} height={36} />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Modo Atleta Autónomo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    Tienes control absoluto sobre tus rutinas, cargas y plan nutricional diario.
                  </Typography>
                  <Chip label="Autogestión Activa" color="primary" size="small" sx={{ mb: 2 }} />
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="solar:book-bookmark-bold" />}
                    onClick={() => navigate('/dashboard/exercises')}
                  >
                    Biblioteca de Ejercicios
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen de Mi Dieta */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🥗 Mi Plan de Nutrición
                </Typography>
                <Button size="small" onClick={() => navigate('/dashboard/client-diet')}>
                  Ver Detalle
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {assignedDiet ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {assignedDiet.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line', maxHeight: 80, overflow: 'hidden' }}>
                    {assignedDiet.description || 'Pautas de alimentación adaptadas a tus objetivos.'}
                  </Typography>

                  <Chip
                    icon={<Iconify icon="solar:fire-bold" />}
                    label={`${assignedDiet.calories} Kcal Diarias`}
                    color="primary"
                    sx={{ fontWeight: 'bold', mb: 2 }}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    color="success"
                    onClick={() => navigate('/dashboard/client-diet')}
                    startIcon={<Iconify icon="eva:checkmark-square-2-fill" />}
                    sx={{ fontWeight: 'bold', borderRadius: 2 }}
                  >
                    Completar Retos de Comida Hoy
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Aún no has configurado tu plan de alimentación semanal.
                  </Typography>
                  <Button variant="outlined" color="primary" onClick={() => navigate('/dashboard/client-diet')}>
                    Configurar Mi Plan Nutricional
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mapa Corporal de Recuperación Muscular */}
        <Grid size={{ xs: 12, md: 6 }}>
          <BodyHeatmap muscleStatus={muscleStatusMap} />
        </Grid>
      </Grid>

      {/* Live Workout Player Modal */}
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

      {/* Creador de Rutinas Modal */}
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
