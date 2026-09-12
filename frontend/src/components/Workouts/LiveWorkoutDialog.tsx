import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  Card,
  CardContent,
  Checkbox,
  TextField,
  Chip,
  Rating,
  Alert,
  Divider,
  LinearProgress,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { createLoggedSession, getUserLoggedSessions, LoggedSetData } from '../../services/loggedSessionService';
import { getWorkoutDetails } from '../../services/workoutService';
import { BarCalculatorModal } from './BarCalculatorModal';

interface LiveWorkoutDialogProps {
  open: boolean;
  onClose: () => void;
  workout: any;
  userId: number;
  onSessionSuccess?: () => void;
}

interface LocalSetState {
  exerciseId: number;
  exerciseName: string;
  bodyPart?: string;
  targetMuscle?: string;
  equipment?: string;
  gifUrl?: string;
  setIndex: number;
  phase: 'work' | 'warmup';
  type: 'straight' | 'dropset' | 'restpause';
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
  drops?: Array<{ weight: number; reps: number }>;
  clusters?: Array<{ reps: number; restSec: number }>;
}

export const LiveWorkoutDialog: React.FC<LiveWorkoutDialogProps> = ({
  open,
  onClose,
  workout,
  userId,
  onSessionSuccess,
}) => {
  const [loadingWorkout, setLoadingWorkout] = useState<boolean>(false);
  const [activeWorkoutData, setActiveWorkoutData] = useState<any>(null);
  const [setsState, setSetsState] = useState<LocalSetState[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [barCalcOpen, setBarCalcOpen] = useState<boolean>(false);
  const [targetWeightCalc, setTargetWeightCalc] = useState<number>(60);
  const [finishModalOpen, setFinishModalOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [startedAt] = useState<string>(new Date().toISOString());

  // Modo de visualización: 'stepper' (paso a paso enfocado) o 'list' (ver todos los ejercicios)
  const [viewMode, setViewMode] = useState<'stepper' | 'list'>('stepper');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  // Historial de cargas previas por exercise_id
  const [prevHistory, setPrevHistory] = useState<{ [exId: number]: { weight: number; reps: number; date?: string } }>({});

  // Cargar ejercicios completos y sesiones anteriores cuando se abre el diálogo
  useEffect(() => {
    if (!open) return;

    const initWorkout = async () => {
      setLoadingWorkout(true);
      try {
        let fullData = workout;
        // Si no vienen los ejercicios o viene la lista vacía, consultar detalles de la rutina
        if (!fullData?.exercises || fullData.exercises.length === 0) {
          try {
            fullData = await getWorkoutDetails(workout.id);
          } catch (e) {
            console.error('Error obteniendo detalles del workout:', e);
          }
        }
        setActiveWorkoutData(fullData);

        // Extraer lista de ejercicios
        const exerciseList = fullData?.exercises || fullData?.workout_exercises || [];
        const initialSets: LocalSetState[] = [];

        exerciseList.forEach((item: any) => {
          const exInfo = item.exercises || item;
          const exId = exInfo.id || item.exercise_id || item.id;
          const exName = exInfo.name || item.name || 'Ejercicio';
          const numSets = Number(item.sets) || 3;
          const targetReps = Number(item.reps) || 10;

          for (let i = 1; i <= numSets; i++) {
            initialSets.push({
              exerciseId: exId,
              exerciseName: exName,
              bodyPart: exInfo.body_part || item.body_part,
              targetMuscle: exInfo.target_muscle || item.target_muscle,
              equipment: exInfo.equipment || item.equipment,
              gifUrl: exInfo.gif_url || item.gif_url,
              setIndex: i,
              phase: 'work',
              type: 'straight',
              weight: 50,
              reps: targetReps,
              rpe: 8,
              completed: false,
              drops: [],
              clusters: [],
            });
          }
        });

        setSetsState(initialSets);
        setDuration(0);
        setIsResting(false);
        setRestTimer(0);
        setCurrentExerciseIndex(0);

        // Cargar historial previo de sesiones para ver qué pesos levantó antes
        try {
          const sessions = await getUserLoggedSessions(userId);
          const historyMap: { [exId: number]: { weight: number; reps: number; date?: string } } = {};
          sessions.forEach((sess) => {
            const allSets = sess.logged_sets || sess.sets || [];
            allSets.forEach((s) => {
              if (s.exercise_id && (!historyMap[s.exercise_id] || s.completed)) {
                historyMap[s.exercise_id] = {
                  weight: s.weight,
                  reps: s.reps,
                  date: sess.completed_at || sess.started_at,
                };
              }
            });
          });
          setPrevHistory(historyMap);

          // Si hay historial previo, auto-rellenar el peso inicial sugerido
          initialSets.forEach((s) => {
            if (historyMap[s.exerciseId]?.weight) {
              s.weight = historyMap[s.exerciseId].weight;
            }
          });
        } catch (e) {
          console.log('No se pudo cargar historial previo:', e);
        }
      } catch (err) {
        console.error('Error inicializando sesión en vivo:', err);
      } finally {
        setLoadingWorkout(false);
      }
    };

    initWorkout();
  }, [open, workout, userId]);

  // Cronómetro del entrenamiento en vivo
  useEffect(() => {
    let interval: any = null;
    if (open && !finishModalOpen) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open, finishModalOpen]);

  // Cronómetro de descanso entre series
  useEffect(() => {
    let interval: any = null;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  // Agrupar series por ejercicio
  const exercisesGrouped = useMemo(() => {
    const list: Array<{
      id: number;
      name: string;
      bodyPart?: string;
      targetMuscle?: string;
      equipment?: string;
      gifUrl?: string;
      sets: Array<{ setItem: LocalSetState; globalIndex: number }>;
    }> = [];

    setsState.forEach((item, globalIndex) => {
      let group = list.find((g) => g.id === item.exerciseId);
      if (!group) {
        group = {
          id: item.exerciseId,
          name: item.exerciseName,
          bodyPart: item.bodyPart,
          targetMuscle: item.targetMuscle,
          equipment: item.equipment,
          gifUrl: item.gifUrl,
          sets: [],
        };
        list.push(group);
      }
      group.sets.push({ setItem: item, globalIndex });
    });

    return list;
  }, [setsState]);

  const currentGroup = exercisesGrouped[currentExerciseIndex] || null;

  const handleToggleSet = (globalIndex: number) => {
    const updated = [...setsState];
    const target = updated[globalIndex];
    target.completed = !target.completed;
    setSetsState(updated);

    if (target.completed) {
      // Iniciar descanso de 60 segundos por defecto
      setRestTimer(60);
      setIsResting(true);
    }
  };

  const handleUpdateField = (globalIndex: number, field: 'weight' | 'reps' | 'rpe', value: number) => {
    const updated = [...setsState];
    updated[globalIndex][field] = Math.max(0, value);
    setSetsState(updated);
  };

  const handleQuickAdjust = (globalIndex: number, field: 'weight' | 'reps', delta: number) => {
    const updated = [...setsState];
    const current = updated[globalIndex][field];
    updated[globalIndex][field] = Math.max(0, Math.round((current + delta) * 2) / 2);
    setSetsState(updated);
  };

  const handleAddDropSet = (globalIndex: number) => {
    const updated = [...setsState];
    const target = updated[globalIndex];
    target.type = 'dropset';
    if (!target.drops) target.drops = [];

    const lastWeight = target.drops.length > 0 ? target.drops[target.drops.length - 1].weight : target.weight;
    const newWeight = Math.max(2.5, Math.round(lastWeight * 0.8 * 2) / 2);

    target.drops.push({ weight: newWeight, reps: target.reps });
    setSetsState(updated);
  };

  const handleAddRestPause = (globalIndex: number) => {
    const updated = [...setsState];
    const target = updated[globalIndex];
    target.type = 'restpause';
    if (!target.clusters) target.clusters = [];

    target.clusters.push({ reps: Math.max(1, Math.floor(target.reps / 2)), restSec: 15 });
    setSetsState(updated);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenBarCalc = (weight: number) => {
    setTargetWeightCalc(weight);
    setBarCalcOpen(true);
  };

  const handleFinishWorkout = async () => {
    setIsSubmitting(true);
    try {
      const completedSets: LoggedSetData[] = setsState
        .filter((s) => s.completed)
        .map((s, idx) => ({
          exercise_id: s.exerciseId,
          set_order: idx + 1,
          phase: s.phase,
          type: s.type,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
          completed: true,
          extra_data: {
            drops: s.drops,
            clusters: s.clusters,
          },
        }));

      await createLoggedSession({
        user_id: userId,
        workout_id: workout.id,
        name: activeWorkoutData?.name || workout.name || 'Sesión de entrenamiento',
        started_at: startedAt,
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
        notes,
        rating,
        sets: completedSets.length > 0 ? completedSets : setsState.map((s, idx) => ({
          exercise_id: s.exerciseId,
          set_order: idx + 1,
          phase: s.phase,
          type: s.type,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
          completed: true,
        })),
      });

      setIsSubmitting(false);
      setFinishModalOpen(false);
      onClose();
      if (onSessionSuccess) onSessionSuccess();
    } catch (err) {
      console.error('Error finalizando entrenamiento:', err);
      setIsSubmitting(false);
    }
  };

  // Porcentaje total de series completadas
  const completedCount = setsState.filter((s) => s.completed).length;
  const totalCount = setsState.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullScreen>
        {/* Cabecera del Reproductor de Entrenamiento */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#161c24',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 10,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton color="inherit" onClick={onClose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🏋️ {activeWorkoutData?.name || workout?.name || 'Entrenamiento en Vivo'}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip
                  icon={<Iconify icon="solar:clock-circle-bold" />}
                  label={formatTime(duration)}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 'bold' }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Progreso: {completedCount}/{totalCount} series ({progressPercent}%)
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
              startIcon={<Iconify icon={viewMode === 'stepper' ? 'solar:list-bold' : 'solar:play-bold'} />}
              onClick={() => setViewMode(viewMode === 'stepper' ? 'list' : 'stepper')}
            >
              {viewMode === 'stepper' ? 'Ver Todos' : 'Modo Enfoque'}
            </Button>

            <Button
              variant="contained"
              color="success"
              size="medium"
              onClick={() => setFinishModalOpen(true)}
              sx={{ fontWeight: 'bold', px: 2.5 }}
              startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            >
              Finalizar Sesión
            </Button>
          </Stack>
        </Box>

        {/* Barra de progreso global del entrenamiento */}
        <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 6, bgcolor: '#212b36' }} color="success" />

        {/* Barra Flotante de Temporizador de Descanso */}
        {isResting && (
          <Alert
            severity="info"
            icon={false}
            sx={{
              borderRadius: 0,
              bgcolor: '#00a76f',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0, 167, 111, 0.4)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                ⏳ Descanso Restante: {formatTime(restTimer)}
              </Typography>
              <Button size="small" variant="outlined" color="inherit" onClick={() => setRestTimer((prev) => prev + 15)}>
                +15s
              </Button>
              <Button size="small" variant="outlined" color="inherit" onClick={() => setRestTimer((prev) => prev + 30)}>
                +30s
              </Button>
              <Button size="small" variant="contained" sx={{ bgcolor: 'white', color: '#007867', fontWeight: 'bold' }} onClick={() => setIsResting(false)}>
                Saltar Descanso
              </Button>
            </Stack>
          </Alert>
        )}

        {/* Contenedor Principal */}
        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f4f6f8', flexGrow: 1, overflowY: 'auto' }}>
          {loadingWorkout ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
              <CircularProgress size={50} color="primary" />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Cargando ejercicios de la rutina...</Typography>
            </Box>
          ) : exercisesGrouped.length === 0 ? (
            <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', py: 6 }}>
              <Iconify icon="solar:dumbbell-large-minimalistic-broken" width={64} height={64} sx={{ color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Esta rutina aún no tiene ejercicios asignados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Añade ejercicios a esta rutina desde el gestor o el creador de rutinas para comenzar a registrar series.
              </Typography>
              <Button variant="contained" color="primary" onClick={onClose}>
                Volver al Panel
              </Button>
            </Box>
          ) : viewMode === 'stepper' && currentGroup ? (
            /* ===== MODO ENFOQUE (PASO A PASO - STEPPER) ===== */
            <Stack spacing={3} maxWidth="md" sx={{ mx: 'auto' }}>
              {/* Barra de Navegación entre Ejercicios */}
              <Card sx={{ borderRadius: 3, p: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
                    disabled={currentExerciseIndex === 0}
                    onClick={() => setCurrentExerciseIndex((prev) => Math.max(0, prev - 1))}
                  >
                    Anterior
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      EJERCICIO {currentExerciseIndex + 1} DE {exercisesGrouped.length}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {currentGroup.name}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
                    disabled={currentExerciseIndex >= exercisesGrouped.length - 1}
                    onClick={() => setCurrentExerciseIndex((prev) => Math.min(exercisesGrouped.length - 1, prev + 1))}
                  >
                    Siguiente
                  </Button>
                </Stack>
              </Card>

              {/* Ficha Detallada del Ejercicio Actual */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="text.primary">
                        {currentGroup.name}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" gap={0.5}>
                        {currentGroup.bodyPart && (
                          <Chip icon={<Iconify icon="solar:body-bold" />} label={currentGroup.bodyPart} size="small" color="primary" variant="outlined" />
                        )}
                        {currentGroup.targetMuscle && (
                          <Chip label={`Músculo: ${currentGroup.targetMuscle}`} size="small" color="secondary" />
                        )}
                        {currentGroup.equipment && (
                          <Chip icon={<Iconify icon="solar:dumbbell-bold" />} label={currentGroup.equipment} size="small" />
                        )}
                      </Stack>
                    </Box>

                    {/* Referencia de Sobrecarga Progresiva: Historial previo */}
                    {prevHistory[currentGroup.id] ? (
                      <Alert severity="success" icon={<Iconify icon="solar:chart-square-bold" />} sx={{ py: 0.5, borderRadius: 2 }}>
                        <Typography variant="caption" fontWeight="bold" display="block">
                          ÚLTIMA SESIÓN:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {prevHistory[currentGroup.id].weight} kg x {prevHistory[currentGroup.id].reps} reps
                        </Typography>
                      </Alert>
                    ) : (
                      <Chip label="Primera vez registrando este ejercicio" size="small" variant="outlined" />
                    )}
                  </Stack>

                  {/* Animación / Video del Ejercicio */}
                  {currentGroup.gifUrl ? (
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 3,
                        overflow: 'hidden',
                        bgcolor: '#0a0f1d',
                        border: '1px solid #1e293b',
                        my: 2.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 220,
                        maxHeight: 320,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      }}
                    >
                      <img
                        src={currentGroup.gifUrl}
                        alt={currentGroup.name}
                        style={{
                          maxHeight: 320,
                          maxWidth: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                        loading="eager"
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                        }}
                      >
                        <Chip
                          icon={<Iconify icon="solar:play-circle-bold" width={16} sx={{ color: '#22c55e !important' }} />}
                          label="Demostración Técnica en Video"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(15, 23, 42, 0.85)',
                            color: 'white',
                            backdropFilter: 'blur(6px)',
                            fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.15)',
                          }}
                        />
                      </Box>
                    </Box>
                  ) : null}

                  <Divider sx={{ my: 2 }} />

                  {/* Tabla de Series de este Ejercicio */}
                  <Stack spacing={2}>
                    {currentGroup.sets.map(({ setItem, globalIndex }) => (
                      <Box
                        key={globalIndex}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: setItem.completed ? '#f0fdf4' : 'background.paper',
                          border: '2px solid',
                          borderColor: setItem.completed ? '#22c55e' : '#e2e8f0',
                          transition: 'all 0.2s ease',
                          boxShadow: setItem.completed ? '0 4px 12px rgba(34, 197, 94, 0.15)' : 'none',
                        }}
                      >
                        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" spacing={2}>
                          {/* Checkbox de serie completada */}
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Checkbox
                              checked={setItem.completed}
                              onChange={() => handleToggleSet(globalIndex)}
                              color="success"
                              sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                            />
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Serie #{setItem.setIndex}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {setItem.completed ? '✅ Completada' : 'Pendiente'}
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Inputs de Peso y Repeticiones con ajuste rápido */}
                          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
                            {/* Input de Peso */}
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <IconButton size="small" onClick={() => handleQuickAdjust(globalIndex, 'weight', -2.5)}>
                                <Iconify icon="solar:minus-circle-bold" />
                              </IconButton>
                              <TextField
                                size="small"
                                label="Kg"
                                type="number"
                                value={setItem.weight}
                                onChange={(e) => handleUpdateField(globalIndex, 'weight', Number(e.target.value))}
                                sx={{ width: 85 }}
                              />
                              <IconButton size="small" onClick={() => handleQuickAdjust(globalIndex, 'weight', 2.5)}>
                                <Iconify icon="solar:add-circle-bold" />
                              </IconButton>
                              <Tooltip title="Calculadora de Discos en Barra">
                                <IconButton size="small" color="primary" onClick={() => handleOpenBarCalc(setItem.weight)}>
                                  <Iconify icon="mdi:weight-lifter" />
                                </IconButton>
                              </Tooltip>
                            </Stack>

                            {/* Input de Repeticiones */}
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <IconButton size="small" onClick={() => handleQuickAdjust(globalIndex, 'reps', -1)}>
                                <Iconify icon="solar:minus-circle-bold" />
                              </IconButton>
                              <TextField
                                size="small"
                                label="Reps"
                                type="number"
                                value={setItem.reps}
                                onChange={(e) => handleUpdateField(globalIndex, 'reps', Number(e.target.value))}
                                sx={{ width: 75 }}
                              />
                              <IconButton size="small" onClick={() => handleQuickAdjust(globalIndex, 'reps', 1)}>
                                <Iconify icon="solar:add-circle-bold" />
                              </IconButton>
                            </Stack>

                            {/* RPE */}
                            <TextField
                              size="small"
                              label="RPE (1-10)"
                              type="number"
                              value={setItem.rpe}
                              onChange={(e) => handleUpdateField(globalIndex, 'rpe', Number(e.target.value))}
                              sx={{ width: 80 }}
                            />
                          </Stack>

                          {/* Botones de Intensificación */}
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" variant="outlined" color="secondary" onClick={() => handleAddDropSet(globalIndex)}>
                              + Drop
                            </Button>
                            <Button size="small" variant="outlined" color="warning" onClick={() => handleAddRestPause(globalIndex)}>
                              + Rest-Pause
                            </Button>
                          </Stack>
                        </Stack>

                        {/* Renders de Sub-filas para DropSets */}
                        {setItem.drops && setItem.drops.length > 0 && (
                          <Box sx={{ ml: 4, mt: 1.5, p: 1.5, bgcolor: '#fdf4ff', borderRadius: 1.5, borderLeft: '3px solid #d946ef' }}>
                            <Typography variant="caption" fontWeight="bold" color="secondary">
                              🔥 Bajadas Drop-Set:
                            </Typography>
                            {setItem.drops.map((drop, dIdx) => (
                              <Typography key={dIdx} variant="body2" sx={{ mt: 0.5 }}>
                                Bajada #{dIdx + 1}: <strong>{drop.weight} kg</strong> x {drop.reps} reps
                              </Typography>
                            ))}
                          </Box>
                        )}

                        {/* Renders de Sub-filas para Rest-Pause */}
                        {setItem.clusters && setItem.clusters.length > 0 && (
                          <Box sx={{ ml: 4, mt: 1.5, p: 1.5, bgcolor: '#fffbeb', borderRadius: 1.5, borderLeft: '3px solid #f59e0b' }}>
                            <Typography variant="caption" fontWeight="bold" color="warning.main">
                              ⚡ Ráfagas Rest-Pause (15s descanso):
                            </Typography>
                            {setItem.clusters.map((cluster, cIdx) => (
                              <Typography key={cIdx} variant="body2" sx={{ mt: 0.5 }}>
                                Ráfaga #{cIdx + 1}: {cluster.reps} reps
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>

                  {/* Acciones de Navegación del Ejercicio */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {currentGroup.sets.every((s) => s.setItem.completed)
                        ? '🎉 ¡Todas las series completadas para este ejercicio!'
                        : 'Marca cada serie conforme la termines para registrar el descanso.'}
                    </Typography>

                    {currentExerciseIndex < exercisesGrouped.length - 1 ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        endIcon={<Iconify icon="solar:arrow-right-bold" />}
                        onClick={() => setCurrentExerciseIndex((prev) => prev + 1)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        Pasar al Siguiente Ejercicio
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        endIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                        onClick={() => setFinishModalOpen(true)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        Terminar Rutina
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          ) : (
            /* ===== MODO LISTA COMPLETA (OVERVIEW) ===== */
            <Stack spacing={3} maxWidth="md" sx={{ mx: 'auto' }}>
              {exercisesGrouped.map((group, gIdx) => (
                <Card key={group.id} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
                      {group.gifUrl && (
                        <Box
                          component="img"
                          src={group.gifUrl}
                          alt={group.name}
                          sx={{
                            width: { xs: '100%', sm: 88 },
                            height: 88,
                            borderRadius: 2,
                            objectFit: 'contain',
                            bgcolor: '#0a0f1d',
                            border: '1px solid #1e293b',
                            flexShrink: 0,
                          }}
                          loading="lazy"
                        />
                      )}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {gIdx + 1}. {group.name}
                        </Typography>
                        {prevHistory[group.id] && (
                          <Typography variant="caption" color="success.main" fontWeight="bold" display="block">
                            Última sesión: {prevHistory[group.id].weight} kg x {prevHistory[group.id].reps} reps
                          </Typography>
                        )}
                        <Stack direction="row" spacing={0.8} sx={{ mt: 0.5 }} flexWrap="wrap">
                          {group.bodyPart && (
                            <Chip label={group.bodyPart} size="small" variant="outlined" />
                          )}
                          {group.equipment && (
                            <Chip label={group.equipment} size="small" />
                          )}
                        </Stack>
                      </Box>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setCurrentExerciseIndex(gIdx);
                          setViewMode('stepper');
                        }}
                      >
                        Enfocar Ejercicio
                      </Button>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1.5}>
                      {group.sets.map(({ setItem, globalIndex }) => (
                        <Box
                          key={globalIndex}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: setItem.completed ? '#f0fdf4' : 'background.paper',
                            border: '1px solid',
                            borderColor: setItem.completed ? '#22c55e' : '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Checkbox checked={setItem.completed} onChange={() => handleToggleSet(globalIndex)} color="success" />
                            <Typography variant="body2" fontWeight="bold">
                              Serie #{setItem.setIndex}
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              size="small"
                              label="Kg"
                              type="number"
                              value={setItem.weight}
                              onChange={(e) => handleUpdateField(globalIndex, 'weight', Number(e.target.value))}
                              sx={{ width: 80 }}
                            />
                            <TextField
                              size="small"
                              label="Reps"
                              type="number"
                              value={setItem.reps}
                              onChange={(e) => handleUpdateField(globalIndex, 'reps', Number(e.target.value))}
                              sx={{ width: 70 }}
                            />
                            <TextField
                              size="small"
                              label="RPE"
                              type="number"
                              value={setItem.rpe}
                              onChange={(e) => handleUpdateField(globalIndex, 'rpe', Number(e.target.value))}
                              sx={{ width: 65 }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Dialog>

      {/* Modal de Calculadora de Discos en Barra */}
      <BarCalculatorModal open={barCalcOpen} onClose={() => setBarCalcOpen(false)} targetWeight={targetWeightCalc} />

      {/* Modal de Finalización y Evaluación */}
      <Dialog open={finishModalOpen} onClose={() => setFinishModalOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
          <Iconify icon="solar:cup-star-bold" width={56} height={56} sx={{ color: '#16a34a', mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="#166534">
            ¡Entrenamiento Completado!
          </Typography>
          <Typography variant="body2" color="#15803d">
            Has entrenado durante <strong>{formatTime(duration)}</strong> completando {completedCount} series.
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                ¿Cómo calificarías tu esfuerzo y sensaciones hoy?
              </Typography>
              <Rating value={rating} onChange={(_, val) => setRating(val || 5)} size="large" />
            </Box>

            <TextField
              label="Notas del entrenamiento (pesos clave, fatiga, molestias o sensaciones)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              placeholder="Ej: Muy buenas sensaciones en press banca, subí 2.5 kg con respecto a la semana pasada..."
            />
          </Stack>
        </Box>

        <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: '#f8fafc' }}>
          <Button onClick={() => setFinishModalOpen(false)}>Continuar Entrenando</Button>
          <Button variant="contained" color="success" onClick={handleFinishWorkout} disabled={isSubmitting} sx={{ fontWeight: 'bold' }}>
            {isSubmitting ? 'Guardando...' : 'Guardar y Registrar Historial'}
          </Button>
        </Box>
      </Dialog>
    </>
  );
};
