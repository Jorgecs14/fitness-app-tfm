import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Calendar,
  PlusCircle,
  TrendingUp,
  Dumbbell,
  Clock,
  PlayCircle,
  UtensilsCrossed,
  ShieldCheck,
  UserCheck,
  BookOpen
} from 'lucide-react';
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

      // Cargar dieta del cliente asignada exclusivamente por su entrenador
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
        }
        setAssignedDiet(matchedDiet || null);
      } catch (dErr) {
        console.error('Error cargando dietas:', dErr);
        setAssignedDiet(null);
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

  const handleStartLiveWorkout = async (workout: any) => {
    setLoadingWorkoutId(workout.id);
    try {
      const fullDetails = await getWorkoutDetails(workout.id);
      setActiveLiveWorkout(fullDetails);
      setLiveWorkoutOpen(true);
    } catch (err) {
      setActiveLiveWorkout(workout);
      setLiveWorkoutOpen(true);
    } finally {
      setLoadingWorkoutId(null);
    }
  };

  const now = new Date();
  const thisWeekSessions = loggedSessions.filter((s) => {
    const d = new Date(s.completed_at || s.started_at || '');
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  const activeItemsForMuscleLoad: Array<{ sets: number; exercise: any }> = [];
  const activeExerciseListForDetails: Array<{ name: string; target_muscle?: string; sets?: number }> = [];

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
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={36} sx={{ color: '#007aff' }} />
        <Typography sx={{ mt: 2, color: 'rgba(235, 235, 245, 0.6)', fontSize: '14px' }}>
          Cargando tu plan de entrenamiento...
        </Typography>
      </Box>
    );
  }

  const spotlightWorkout = assignedWorkouts.length > 0 ? assignedWorkouts[0] : null;

  return (
    <Box className="apple-content-container">
      {/* Apple Greeting Hero Card */}
      <Box
        className="apple-card"
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          background: 'linear-gradient(180deg, #1c1c1e 0%, #161618 100%)',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }} flexWrap="wrap">
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              backgroundColor: 'rgba(255, 149, 0, 0.15)',
              color: '#ff9500',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Flame size={14} />
            <span>{thisWeekSessions.length} sesiones esta semana</span>
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              backgroundColor: 'rgba(120, 120, 128, 0.2)',
              color: 'rgba(235, 235, 245, 0.7)',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </Box>
        </Stack>

        <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', mb: 0.8 }}>
          ¡Hola, {currentUser?.name || 'Atleta'}!
        </Typography>

        <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.65)', maxWidth: 640, mb: 2.5, lineHeight: 1.5 }}>
          Controla en tiempo real tu estímulo muscular, registra series en vivo y mantén el control de tus objetivos.
        </Typography>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <button
            onClick={() => setWorkoutBuilderOpen(true)}
            className="apple-btn-secondary"
            style={{ gap: '6px' }}
          >
            <PlusCircle size={17} color="#007aff" />
            Nueva Rutina
          </button>
          <button
            onClick={() => navigate('/dashboard/submit-progress')}
            className="apple-btn-secondary"
            style={{ gap: '6px' }}
          >
            <TrendingUp size={17} color="#34c759" />
            Subir Progreso
          </button>
        </Stack>
      </Box>

      {/* Featured Workout Hero Section */}
      {spotlightWorkout ? (
        <Box
          className="apple-card"
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            border: '0.5px solid rgba(0, 122, 255, 0.3)',
            backgroundColor: '#1c1c1e',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(52, 199, 89, 0.15)',
                  color: '#34c759',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1.5,
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Recomendado Hoy
              </Box>
              <Chip
                label={spotlightWorkout.category}
                size="small"
                sx={{ backgroundColor: 'rgba(120, 120, 128, 0.24)', color: '#ffffff', fontWeight: 600 }}
              />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', mb: 0.6 }}>
            {spotlightWorkout.name}
          </Typography>

          <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.65)', mb: 2 }}>
            {spotlightWorkout.notes || 'Rutina estructurada con seguimiento en vivo de pesos y descansos.'}
          </Typography>

          <Stack direction="row" spacing={2.5} sx={{ mb: 2.5 }} flexWrap="wrap">
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.75)', display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '13px' }}>
              <Dumbbell size={15} color="#007aff" />
              {(spotlightWorkout.workout_exercises || spotlightWorkout.exercises || []).length} ejercicios
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.75)', display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '13px' }}>
              <Clock size={15} color="#ff9500" />
              ~45 - 60 min
            </Typography>
          </Stack>

          <button
            onClick={() => handleStartLiveWorkout(spotlightWorkout)}
            disabled={loadingWorkoutId === spotlightWorkout.id}
            className="apple-btn-primary"
            style={{ height: '48px' }}
          >
            {loadingWorkoutId === spotlightWorkout.id ? (
              <CircularProgress size={18} sx={{ color: '#000000' }} />
            ) : (
              <>
                <PlayCircle size={20} />
                Empezar Sesión
              </>
            )}
          </button>
        </Box>
      ) : (
        <Box
          className="apple-card"
          sx={{
            p: 3,
            mb: 3,
            textAlign: 'center',
          }}
        >
          <Dumbbell size={36} color="#007aff" style={{ marginBottom: '10px' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Diseña tu primera rutina
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', maxWidth: 450, mx: 'auto', mb: 2 }}>
            Elige una plantilla contrastada (Tirón/Empuje/Piernas, Torso/Pierna) o añade tus ejercicios preferidos.
          </Typography>
          <button onClick={() => setWorkoutBuilderOpen(true)} className="apple-btn-blue" style={{ maxWidth: '280px', margin: '0 auto' }}>
            Elegir Plantilla
          </button>
        </Box>
      )}

      {/* Anatomical Heatmap Section */}
      <Box sx={{ mb: 3 }}>
        <BodyHeatmap
          muscleLoad={calculatedMuscleLoad}
          activeExercises={activeExerciseListForDetails}
        />
      </Box>

      {/* Grid: Routines and Nutrition */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box className="apple-card" sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                Mis Rutinas ({assignedWorkouts.length})
              </Typography>
              <button
                onClick={() => setWorkoutBuilderOpen(true)}
                className="apple-btn-secondary"
                style={{ height: '36px', fontSize: '13px', padding: '0 12px' }}
              >
                + Añadir
              </button>
            </Box>

            {assignedWorkouts.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3, backgroundColor: 'rgba(0, 122, 255, 0.1)', color: '#47a3ff' }}>
                Aún no tienes rutinas guardadas. Pulsa en "+ Añadir" para crear la primera.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {assignedWorkouts.map((workout) => {
                  const exerciseCount = (workout.workout_exercises || workout.exercises || []).length;
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={workout.id}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          backgroundColor: '#2c2c2e',
                          border: '0.5px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          height: '100%',
                        }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                              {workout.name}
                            </Typography>
                            <Chip label={workout.category} size="small" sx={{ fontSize: '11px', height: '22px' }} />
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '13px', mb: 1 }}>
                            {workout.notes || 'Rutina personalizada'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Dumbbell size={13} /> {exerciseCount} ejercicios
                          </Typography>
                        </Box>

                        <button
                          onClick={() => handleStartLiveWorkout(workout)}
                          disabled={loadingWorkoutId === workout.id}
                          className="apple-btn-blue"
                          style={{ height: '40px', fontSize: '14px' }}
                        >
                          {loadingWorkoutId === workout.id ? 'Iniciando...' : 'Entrenar'}
                        </button>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Grid>

        {/* Nutrition and Trainer Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            <Box className="apple-card" sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UtensilsCrossed size={18} color="#34c759" />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px' }}>
                    Mi Plan Nutricional
                  </Typography>
                </Box>
                <button
                  onClick={() => navigate('/dashboard/client-diet')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#007aff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Ver
                </button>
              </Box>

              {assignedDiet ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    {assignedDiet.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '13px', mb: 1.5 }}>
                    {assignedDiet.description || 'Pautas de alimentación adaptadas a tus metas.'}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.6,
                      backgroundColor: 'rgba(255, 149, 0, 0.15)',
                      color: '#ff9500',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '13px',
                      fontWeight: 700,
                      mb: 2,
                    }}
                  >
                    <Flame size={14} />
                    {assignedDiet.calories} Kcal Diarias
                  </Box>

                  <button
                    onClick={() => navigate('/dashboard/client-diet')}
                    className="apple-btn-secondary"
                    style={{ width: '100%', height: '40px', fontSize: '13px' }}
                  >
                    Registrar Comidas
                  </button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 1.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.5)', mb: 1.5, fontSize: '13px' }}>
                    No tienes una dieta asignada actualmente.
                  </Typography>
                  <button
                    onClick={() => navigate('/dashboard/client-diet')}
                    className="apple-btn-secondary"
                    style={{ width: '100%', height: '38px', fontSize: '13px' }}
                  >
                    Configurar Dieta
                  </button>
                </Box>
              )}
            </Box>

            {/* Coach or Autonomous Profile Card */}
            <Box className="apple-card" sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1.5 }}>
                Estado del Atleta
              </Typography>

              {currentUser?.trainer ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      backgroundColor: '#2c2c2e',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#ffffff'
                    }}
                  >
                    {currentUser.trainer.name?.charAt(0)}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    {currentUser.trainer.name} {currentUser.trainer.surname}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', display: 'block', mb: 1.5 }}>
                    {currentUser.trainer.email}
                  </Typography>
                  <Chip icon={<ShieldCheck size={14} color="#34c759" />} label="Entrenador Asignado" size="small" sx={{ mb: 1.5 }} />
                  <a
                    href={`mailto:${currentUser.trainer.email}`}
                    className="apple-btn-secondary"
                    style={{ width: '100%', height: '40px', fontSize: '13px', textDecoration: 'none' }}
                  >
                    Contactar Entrenador
                  </a>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 122, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    <UserCheck size={22} color="#007aff" />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Modo Atleta Autónomo
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '12px', mb: 2 }}>
                    Entrenas y planificas tus cargas y dieta de manera independiente.
                  </Typography>
                  <button
                    onClick={() => navigate('/dashboard/workouts')}
                    className="apple-btn-secondary"
                    style={{ width: '100%', height: '40px', fontSize: '13px', gap: '6px' }}
                  >
                    <BookOpen size={15} />
                    Explorar Ejercicios
                  </button>
                </Box>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Modales */}
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
