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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '../utils/iconify';
import { getCurrentUser } from '../services/userService';
import { getWorkouts } from '../services/workoutService';
import { getDiets, getDietUsers } from '../services/dietService';
import { getUserLoggedSessions, LoggedSessionData } from '../services/loggedSessionService';
import { User } from '../types/User';
import { Workout } from '../types/Workout';
import { Diet } from '../types/Diet';
import { LiveWorkoutDialog } from '../components/Workouts/LiveWorkoutDialog';
import { BodyHeatmap } from '../components/Analytics/BodyHeatmap';
import { calculateMuscleRecovery } from '../lib/recovery';

export const ClientHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignedWorkouts, setAssignedWorkouts] = useState<Workout[]>([]);
  const [assignedDiet, setAssignedDiet] = useState<Diet | null>(null);
  const [loggedSessions, setLoggedSessions] = useState<LoggedSessionData[]>([]);
  const [activeLiveWorkout, setActiveLiveWorkout] = useState<any | null>(null);
  const [liveWorkoutOpen, setLiveWorkoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Cargar rutinas asignadas a este cliente
      const workouts = await getWorkouts();
      const userWorkouts = workouts.filter((w) => w.user_id === user.id);
      setAssignedWorkouts(userWorkouts);

      // Cargar dietas asignadas a este cliente
      const diets = await getDiets();
      let matchedDiet: Diet | null = null;
      for (const d of diets) {
        const dietUsers = await getDietUsers(d.id);
        if (dietUsers.some((u: any) => u.id === user.id)) {
          matchedDiet = d;
          break;
        }
      }
      setAssignedDiet(matchedDiet);

      // Cargar historial de ejecuciones en vivo
      try {
        const sessions = await getUserLoggedSessions(user.id);
        setLoggedSessions(sessions);
      } catch (e) {
        console.log('No logged sessions found:', e);
      }
    } catch (err) {
      console.error('Error cargando datos del cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLiveWorkout = (workout: Workout) => {
    setActiveLiveWorkout(workout);
    setLiveWorkoutOpen(true);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando panel del alumno...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Banner de Bienvenida */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #00a76f 0%, #007867 100%)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0, 167, 111, 0.25)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              ¡Hola, {currentUser?.name}! 👋
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5, opacity: 0.9 }}>
              Bienvenido a tu panel de entrenamiento personalizado. Aquí tienes tu plan del día.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="warning"
            size="large"
            startIcon={<Iconify icon="solar:camera-add-bold" />}
            onClick={() => navigate('/dashboard/submit-progress')}
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            Subir Reporte Semanal
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Tarjeta de Entrenador Personal Asignado */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">
                TU ENTRENADOR PERSONAL
              </Typography>
              <Divider sx={{ my: 1.5 }} />

              {currentUser?.trainer ? (
                <Stack spacing={2} alignItems="center">
                  <Avatar
                    sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 'bold' }}
                  >
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

                  <Chip
                    icon={<Iconify icon="solar:shield-check-bold" />}
                    label="Entrenador Asignado"
                    color="success"
                    size="small"
                  />

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="eva:email-fill" />}
                    href={`mailto:${currentUser.trainer.email}`}
                  >
                    Contactar por Email
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aún no tienes un Entrenador Personal asignado directamente.
                  </Typography>
                  <Chip label="Equipo de Entrenadores General" color="default" sx={{ mt: 2 }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sección de Rutinas Asignadas */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🏋️ Mis Rutinas de Entrenamiento
                </Typography>
                <Chip label={`${assignedWorkouts.length} Rutinas`} color="primary" size="small" />
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {assignedWorkouts.length === 0 ? (
                <Alert severity="info">
                  No tienes rutinas asignadas actualmente. Tu entrenador te asignará una muy pronto.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {assignedWorkouts.map((workout) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={workout.id}>
                      <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {workout.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {workout.notes || 'Sin descripción'}
                        </Typography>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Chip label={workout.category} size="small" color="secondary" />

                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<Iconify icon="eva:play-circle-fill" />}
                            onClick={() => handleStartLiveWorkout(workout)}
                            sx={{ fontWeight: 'bold' }}
                          >
                            Entrenar Ya
                          </Button>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen de Mi Dieta Asignada */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🥗 Mi Plan de Alimentación
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {assignedDiet ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {assignedDiet.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {assignedDiet.description}
                  </Typography>

                  <Chip
                    icon={<Iconify icon="solar:fire-bold" />}
                    label={`${assignedDiet.calories} Kcal Diarias`}
                    color="primary"
                    sx={{ fontWeight: 'bold', mb: 2 }}
                  />

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/dashboard/client-diet')}
                    startIcon={<Iconify icon="eva:eye-fill" />}
                  >
                    Ver Menú y Alimentos Completo
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No tienes una dieta asignada en este momento.
                </Typography>
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
    </Box>
  );
};

export default ClientHomePage;
