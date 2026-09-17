import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Calendar,
  Dumbbell,
  Clock,
  PlayCircle,
  UtensilsCrossed,
  ShieldCheck,
  User,
  ArrowRight,
  Camera,
  Droplets,
  Plus,
  Minus,
  Check,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
  Award,
  Activity
} from 'lucide-react';
import { getCurrentUser } from '../services/userService';
import { getWorkoutsWithExercises, getWorkoutDetails } from '../services/workoutService';
import { getDietsWithFoods, getDietUsers, getDietWithFoods, getUserDiet } from '../services/dietService';
import { getUserLoggedSessions, LoggedSessionData } from '../services/loggedSessionService';
import { User as UserType } from '../types/User';
import { WorkoutWithExercises } from '../types/WorkoutWithExercises';
import { DietWithFoods } from '../types/DietWithFoods';
import { LiveWorkoutDialog } from '../components/Workouts/LiveWorkoutDialog';
import { BodyHeatmap } from '../components/Analytics/BodyHeatmap';
import { loadOf } from '../lib/muscles';

const MEAL_STEPS = [
  { id: 'desayuno', label: '1º Desayuno', short: 'Desayuno' },
  { id: 'media_manana', label: '2º Media Mañana', short: 'Media Mañana' },
  { id: 'comida', label: '3º Comida', short: 'Comida' },
  { id: 'merienda', label: '4º Merienda', short: 'Merienda' },
  { id: 'cena', label: '5º Cena', short: 'Cena' },
];

export const ClientHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [assignedWorkouts, setAssignedWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [assignedDiet, setAssignedDiet] = useState<DietWithFoods | null>(null);
  const [loggedSessions, setLoggedSessions] = useState<LoggedSessionData[]>([]);
  const [activeLiveWorkout, setActiveLiveWorkout] = useState<any | null>(null);
  const [liveWorkoutOpen, setLiveWorkoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingWorkoutId, setLoadingWorkoutId] = useState<number | null>(null);

  // Daily Habits States (Auto-reset every 24h day)
  const todayKey = new Date().toISOString().split('T')[0];
  const [waterIntake, setWaterIntake] = useState<number>(0); // in Liters
  const [completedMealIndex, setCompletedMealIndex] = useState<number>(0); // 0 to 5
  const [sleepQuality, setSleepQuality] = useState<'good' | 'regular' | 'bad' | null>(null);

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Cargar hábitos diarios desde localStorage con clave de fecha diaria
      if (user?.id) {
        const savedWater = localStorage.getItem(`lifeboost_water_${user.id}_${todayKey}`);
        if (savedWater) setWaterIntake(parseFloat(savedWater) || 0);

        const savedMeals = localStorage.getItem(`lifeboost_meals_${user.id}_${todayKey}`);
        if (savedMeals !== null) setCompletedMealIndex(parseInt(savedMeals, 10) || 0);

        const savedSleep = localStorage.getItem(`lifeboost_sleep_${user.id}_${todayKey}`);
        if (savedSleep) setSleepQuality(savedSleep as any);
      }

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

  // Water handler
  const handleAddWater = (amount: number) => {
    if (!currentUser) return;
    const newAmount = Math.max(0, Math.min(6.0, Number((waterIntake + amount).toFixed(2))));
    setWaterIntake(newAmount);
    localStorage.setItem(`lifeboost_water_${currentUser.id}_${todayKey}`, newAmount.toString());
  };

  // Meal sequence handler
  const handleAdvanceMeal = () => {
    if (!currentUser) return;
    const nextIndex = Math.min(5, completedMealIndex + 1);
    setCompletedMealIndex(nextIndex);
    localStorage.setItem(`lifeboost_meals_${currentUser.id}_${todayKey}`, nextIndex.toString());
  };

  const handleResetMeals = () => {
    if (!currentUser) return;
    setCompletedMealIndex(0);
    localStorage.setItem(`lifeboost_meals_${currentUser.id}_${todayKey}`, '0');
  };

  // Sleep quality handler
  const handleSelectSleep = (quality: 'good' | 'regular' | 'bad') => {
    if (!currentUser) return;
    setSleepQuality(quality);
    localStorage.setItem(`lifeboost_sleep_${currentUser.id}_${todayKey}`, quality);
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
        <CircularProgress size={36} sx={{ color: '#007AFF' }} />
        <Typography sx={{ mt: 2, color: 'rgba(235, 235, 245, 0.6)', fontSize: '14px' }}>
          Cargando tu plan de entrenamiento...
        </Typography>
      </Box>
    );
  }

  const spotlightWorkout = assignedWorkouts.length > 0 ? assignedWorkouts[0] : null;
  const waterTarget = 2.5; // Target 2.5L
  const waterPercentage = Math.min(100, Math.round((waterIntake / waterTarget) * 100));
  const nextMeal = completedMealIndex < 5 ? MEAL_STEPS[completedMealIndex] : null;

  return (
    <Box className="apple-content-container">
      {/* Apple Greeting Hero Card */}
      <Box
        className="apple-card"
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          background: 'linear-gradient(180deg, #1C1C1E 0%, #161618 100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            mb: 1.8
          }}
        >
          {/* Fecha Actual */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.85)',
              px: 1.4,
              py: 0.5,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'capitalize',
              letterSpacing: '-0.01em',
            }}
          >
            <Calendar size={13} color="#007AFF" />
            <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </Box>

          {/* Sesiones de la Semana */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: thisWeekSessions.length > 0 ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 149, 0, 0.12)',
              border: thisWeekSessions.length > 0 ? '1px solid rgba(52, 199, 89, 0.3)' : '1px solid rgba(255, 149, 0, 0.3)',
              color: thisWeekSessions.length > 0 ? '#34C759' : '#FF9500',
              px: 1.4,
              py: 0.5,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          >
            <Flame size={13} />
            <span>{thisWeekSessions.length} {thisWeekSessions.length === 1 ? 'sesión' : 'sesiones'} esta semana</span>
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', mb: 0.8 }}>
          ¡Hola, {currentUser?.name || 'Atleta'}!
        </Typography>

        <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.65)', maxWidth: 640, mb: 2.5, lineHeight: 1.5 }}>
          Tu centro de entrenamiento personal. Registra tus series en vivo, tus hábitos diarios y comparte tus progresos con tu entrenador.
        </Typography>

        {/* Botones Rápidos de Acción */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          {spotlightWorkout ? (
            <button
              onClick={() => handleStartLiveWorkout(spotlightWorkout)}
              className="apple-btn-blue"
              style={{ gap: '8px', padding: '0 20px', height: '44px', fontSize: '14px' }}
            >
              <PlayCircle size={18} />
              Iniciar Rutina
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard/workouts')}
              className="apple-btn-blue"
              style={{ gap: '8px', padding: '0 20px', height: '44px', fontSize: '14px' }}
            >
              <Dumbbell size={18} />
              Ver Rutinas
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard/client-diet')}
            className="apple-btn-secondary"
            style={{ gap: '8px', padding: '0 18px', height: '44px', fontSize: '14px' }}
          >
            <UtensilsCrossed size={17} color="#34C759" />
            Ver Mi Dieta
          </button>

          <button
            onClick={() => navigate('/dashboard/submit-progress')}
            className="apple-btn-secondary"
            style={{ gap: '8px', padding: '0 18px', height: '44px', fontSize: '14px' }}
          >
            <Camera size={17} color="#007AFF" />
            Subir Progreso
          </button>
        </Stack>
      </Box>

      {/* SECCIÓN SUPERIOR: 3 CARDS DE HÁBITOS DIARIOS (AGUA, CHECK COMIDAS, SUEÑO) */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
          Registro de Hábitos de Hoy (24h)
        </Typography>

        <Grid container spacing={2}>
          {/* 1. Card de Agua con Botella Interactiva */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              className="apple-card"
              sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, #1C1C1E 100%)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: 'rgba(6, 182, 212, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#22d3ee',
                      }}
                    >
                      <Droplets size={18} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                      Agua Diaria
                    </Typography>
                  </Box>
                  <Chip
                    label={`${waterPercentage}%`}
                    size="small"
                    sx={{
                      background: 'rgba(6, 182, 212, 0.2)',
                      color: '#22d3ee',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>

                {/* Botella Gráfica Interactiva */}
                <Box display="flex" alignItems="center" gap={2} my={2}>
                  {/* Visual Bottle */}
                  <Box
                    sx={{
                      width: 50,
                      height: 100,
                      borderRadius: '12px 12px 14px 14px',
                      border: '2px solid rgba(6, 182, 212, 0.6)',
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'rgba(15, 23, 42, 0.6)',
                      boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
                      flexShrink: 0,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 18,
                        height: 6,
                        background: '#22d3ee',
                        borderRadius: '3px 3px 0 0',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${waterPercentage}%`,
                        background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                        transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 -2px 8px rgba(56, 189, 248, 0.6)',
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="h5" fontWeight="900" sx={{ color: '#38bdf8', letterSpacing: '-0.02em' }}>
                      {waterIntake.toFixed(2)} L
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>
                      Meta: {waterTarget} Litros / día
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Botones de incremento */}
              <Stack direction="row" spacing={1} alignItems="center">
                <button
                  onClick={() => handleAddWater(0.25)}
                  className="apple-btn-secondary"
                  style={{ flex: 1, height: '36px', fontSize: '12px', padding: '0 8px' }}
                >
                  +250ml
                </button>
                <button
                  onClick={() => handleAddWater(0.50)}
                  className="apple-btn-secondary"
                  style={{ flex: 1, height: '36px', fontSize: '12px', padding: '0 8px' }}
                >
                  +500ml
                </button>
                <IconButton
                  size="small"
                  onClick={() => handleAddWater(-0.25)}
                  disabled={waterIntake <= 0}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <Minus size={16} />
                </IconButton>
              </Stack>
            </Box>
          </Grid>

          {/* 2. Card de Check Comidas Secuenciales (Cambia de nombre al completar) */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              className="apple-card"
              sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(180deg, rgba(52, 199, 89, 0.08) 0%, #1C1C1E 100%)',
                border: '1px solid rgba(52, 199, 89, 0.25)',
              }}
            >
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: 'rgba(52, 199, 89, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#34C759',
                      }}
                    >
                      <UtensilsCrossed size={18} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                      Control de Comidas
                    </Typography>
                  </Box>
                  <Chip
                    label={`${completedMealIndex} / 5`}
                    size="small"
                    sx={{
                      background: 'rgba(52, 199, 89, 0.2)',
                      color: '#34C759',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>

                {/* Status central dinámico */}
                <Box my={1.8} p={1.5} sx={{ borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
                  {nextMeal ? (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
                        Próxima comida a marcar:
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ color: '#FFFFFF', mt: 0.2 }}>
                        {nextMeal.label}
                      </Typography>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Award size={20} color="#34C759" />
                      <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#34C759' }}>
                        ¡Todas las 5 comidas completadas hoy!
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Timeline de puntos de comidas */}
                <Stack direction="row" spacing={0.8} mb={2} justifyContent="space-between">
                  {MEAL_STEPS.map((m, idx) => {
                    const isDone = idx < completedMealIndex;
                    const isCurrent = idx === completedMealIndex;
                    return (
                      <Tooltip key={m.id} title={m.short}>
                        <Box
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            background: isDone
                              ? '#34C759'
                              : isCurrent
                              ? 'rgba(52, 199, 89, 0.4)'
                              : 'rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.25s ease',
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Box>

              {/* Botón de acción principal con cambio dinámico de nombre */}
              {nextMeal ? (
                <button
                  onClick={handleAdvanceMeal}
                  className="apple-btn-primary"
                  style={{
                    width: '100%',
                    height: '40px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: '#34C759',
                    color: '#000000',
                  }}
                >
                  <Check size={16} /> Marcar {nextMeal.label}
                </button>
              ) : (
                <button
                  onClick={handleResetMeals}
                  className="apple-btn-secondary"
                  style={{
                    width: '100%',
                    height: '40px',
                    fontSize: '13px',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={15} /> Reiniciar Registro
                </button>
              )}
            </Box>
          </Grid>

          {/* 3. Card de Calidad de Sueño */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              className="apple-card"
              sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, #1C1C1E 100%)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
              }}
            >
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: 'rgba(168, 85, 247, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c084fc',
                      }}
                    >
                      <Moon size={18} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                      Calidad del Sueño
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      sleepQuality === 'good'
                        ? 'Bueno'
                        : sleepQuality === 'regular'
                        ? 'Regular'
                        : sleepQuality === 'bad'
                        ? 'Malo'
                        : 'Sin registrar'
                    }
                    size="small"
                    sx={{
                      background: sleepQuality ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      color: sleepQuality ? '#c084fc' : 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 2 }}>
                  ¿Cómo ha sido tu descanso de anoche? Tu recuperación influye en las cargas de hoy.
                </Typography>
              </Box>

              {/* 3 opciones táctiles */}
              <Stack direction="row" spacing={1}>
                <button
                  onClick={() => handleSelectSleep('good')}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: sleepQuality === 'good' ? '1.5px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: sleepQuality === 'good' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: sleepQuality === 'good' ? '#e9d5ff' : 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Moon size={14} /> Bueno
                </button>

                <button
                  onClick={() => handleSelectSleep('regular')}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: sleepQuality === 'regular' ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: sleepQuality === 'regular' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: sleepQuality === 'regular' ? '#fde68a' : 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Activity size={14} /> Regular
                </button>

                <button
                  onClick={() => handleSelectSleep('bad')}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: sleepQuality === 'bad' ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: sleepQuality === 'bad' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: sleepQuality === 'bad' ? '#fca5a5' : 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Minus size={14} /> Malo
                </button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Featured Workout Hero Section */}
      {spotlightWorkout ? (
        <Box
          className="apple-card"
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            border: '0.5px solid rgba(0, 122, 255, 0.3)',
            backgroundColor: '#1C1C1E',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(52, 199, 89, 0.15)',
                  color: '#34C759',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1.5,
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Pautada por tu Entrenador
              </Box>
              <Chip
                label={spotlightWorkout.category}
                size="small"
                sx={{ backgroundColor: 'rgba(120, 120, 128, 0.24)', color: '#ffffff', fontWeight: 600 }}
              />
            </Box>

            <button
              onClick={() => navigate('/dashboard/workouts')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#007AFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Todas las rutinas <ArrowRight size={14} />
            </button>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', mb: 0.6 }}>
            {spotlightWorkout.name}
          </Typography>

          <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.65)', mb: 2 }}>
            {spotlightWorkout.notes || 'Rutina asignada con seguimiento de series, cargas y descansos interactivos.'}
          </Typography>

          <Stack direction="row" spacing={2.5} sx={{ mb: 2.5 }} flexWrap="wrap">
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.75)', display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '13px' }}>
              <Dumbbell size={15} color="#007AFF" />
              {(spotlightWorkout.workout_exercises || spotlightWorkout.exercises || []).length} ejercicios
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.75)', display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '13px' }}>
              <Clock size={15} color="#FF9500" />
              ~45 - 60 min
            </Typography>
          </Stack>

          <button
            onClick={() => handleStartLiveWorkout(spotlightWorkout)}
            disabled={loadingWorkoutId === spotlightWorkout.id}
            className="apple-btn-primary"
            style={{ height: '48px', fontSize: '15px' }}
          >
            {loadingWorkoutId === spotlightWorkout.id ? (
              <CircularProgress size={18} sx={{ color: '#000000' }} />
            ) : (
              <>
                <PlayCircle size={20} />
                Iniciar Rutina en Vivo
              </>
            )}
          </button>
        </Box>
      ) : (
        <Box
          className="apple-card"
          sx={{
            p: 3.5,
            mb: 3,
            textAlign: 'center',
          }}
        >
          <Dumbbell size={40} color="#007AFF" style={{ marginBottom: '12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, color: '#ffffff' }}>
            Aún no tienes una rutina asignada
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', maxWidth: 460, mx: 'auto', mb: 2.5, lineHeight: 1.5 }}>
            Tu entrenador personal está diseñando tu plan de entrenamiento. Cuando esté listo, aparecerá aquí automáticamente.
          </Typography>
          <button
            onClick={() => navigate('/dashboard/workouts')}
            className="apple-btn-secondary"
            style={{ maxWidth: '240px', margin: '0 auto' }}
          >
            Ver Mis Entrenamientos
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
                Mis Rutinas Asignadas ({assignedWorkouts.length})
              </Typography>
              <button
                onClick={() => navigate('/dashboard/workouts')}
                className="apple-btn-secondary"
                style={{ height: '34px', fontSize: '12px', padding: '0 12px' }}
              >
                Ver Todas
              </button>
            </Box>

            {assignedWorkouts.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3, backgroundColor: 'rgba(0, 122, 255, 0.1)', color: '#47a3ff' }}>
                Tu entrenador aún no te ha asignado ninguna rutina de ejercicios.
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
                          backgroundColor: '#2C2C2E',
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
                            {workout.notes || 'Rutina personalizada prescrita por tu coach.'}
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
                          {loadingWorkoutId === workout.id ? 'Iniciando...' : 'Iniciar Rutina'}
                        </button>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Grid>

        {/* Nutrition and Coach Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            <Box className="apple-card" sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UtensilsCrossed size={18} color="#34C759" />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px' }}>
                    Mi Plan Nutricional
                  </Typography>
                </Box>
                <button
                  onClick={() => navigate('/dashboard/client-diet')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#007AFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Ver Dieta
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
                      color: '#FF9500',
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
                    Abrir Plan Nutricional
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
                    Ver Mi Dieta
                  </button>
                </Box>
              )}
            </Box>

            {/* Coach Profile Card */}
            <Box className="apple-card" sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1.5 }}>
                Tu Entrenador Asignado
              </Typography>

              {currentUser?.trainer ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      backgroundColor: '#2C2C2E',
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
                  <Chip icon={<ShieldCheck size={14} color="#34C759" />} label="Coach Personal Activo" size="small" sx={{ mb: 1.5 }} />
                  <a
                    href={`mailto:${currentUser.trainer.email}`}
                    className="apple-btn-secondary"
                    style={{ width: '100%', height: '40px', fontSize: '13px', textDecoration: 'none' }}
                  >
                    Contactar Entrenador
                  </a>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 1 }}>
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
                    <User size={22} color="#007AFF" />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Atleta en Seguimiento
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '12px', mb: 1.5 }}>
                    Tu cuenta está sincronizada para recibir entrenamientos y dietas de tu coach.
                  </Typography>
                  <button
                    onClick={() => navigate('/dashboard/profile')}
                    className="apple-btn-secondary"
                    style={{ width: '100%', height: '38px', fontSize: '13px' }}
                  >
                    Ver Mi Perfil
                  </button>
                </Box>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Modal de Entrenamiento en Vivo */}
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
    </Box>
  );
};

export default ClientHomePage;
