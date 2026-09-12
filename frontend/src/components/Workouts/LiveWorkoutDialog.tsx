import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { WorkoutWithExercises } from '../../types/WorkoutWithExercises';
import { createLoggedSession, LoggedSetData } from '../../services/loggedSessionService';
import { BarCalculatorModal } from './BarCalculatorModal';

interface LiveWorkoutDialogProps {
  open: boolean;
  onClose: () => void;
  workout: WorkoutWithExercises;
  userId: number;
  onSessionSuccess?: () => void;
}

interface LocalSetState {
  exerciseId: number;
  exerciseName: string;
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

  // Inicializar estado de series según el workout
  useEffect(() => {
    if (open && workout && workout.exercises) {
      const initial: LocalSetState[] = [];
      workout.exercises.forEach((ex) => {
        const numSets = ex.sets || 3;
        for (let i = 1; i <= numSets; i++) {
          initial.push({
            exerciseId: ex.exercise_id || ex.id,
            exerciseName: ex.name,
            setIndex: i,
            phase: 'work',
            type: 'straight',
            weight: 50,
            reps: ex.reps || 10,
            rpe: 8,
            completed: false,
            drops: [],
            clusters: [],
          });
        }
      });
      setSetsState(initial);
      setDuration(0);
      setIsResting(false);
      setRestTimer(0);
    }
  }, [open, workout]);

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

  const handleToggleSet = (index: number) => {
    const updated = [...setsState];
    const target = updated[index];
    target.completed = !target.completed;
    setSetsState(updated);

    if (target.completed) {
      // Iniciar descansos de 60 segundos
      setRestTimer(60);
      setIsResting(true);
    }
  };

  const handleUpdateField = (index: number, field: 'weight' | 'reps' | 'rpe', value: number) => {
    const updated = [...setsState];
    updated[index][field] = value;
    setSetsState(updated);
  };

  // Añadir Drop-set a una serie (+ Drop)
  const handleAddDropSet = (index: number) => {
    const updated = [...setsState];
    const target = updated[index];
    target.type = 'dropset';
    if (!target.drops) target.drops = [];

    const lastWeight = target.drops.length > 0 ? target.drops[target.drops.length - 1].weight : target.weight;
    const newWeight = Math.round(lastWeight * 0.8 * 2) / 2; // 20% menos peso

    target.drops.push({ weight: newWeight, reps: target.reps });
    setSetsState(updated);
  };

  // Añadir Rest-Pause a una serie (+ Burst)
  const handleAddRestPause = (index: number) => {
    const updated = [...setsState];
    const target = updated[index];
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
        name: workout.name || 'Sesión completada',
        started_at: startedAt,
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
        notes,
        rating,
        sets: completedSets,
      });

      setIsSubmitting(false);
      setFinishModalOpen(false);
      onClose();
      if (onSessionSuccess) onSessionSuccess();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Agrupar por ejercicio para renderizar
  const exercisesGrouped: { [exId: number]: { name: string; sets: { setItem: LocalSetState; globalIndex: number }[] } } = {};
  setsState.forEach((item, index) => {
    if (!exercisesGrouped[item.exerciseId]) {
      exercisesGrouped[item.exerciseId] = { name: item.exerciseName, sets: [] };
    }
    exercisesGrouped[item.exerciseId].sets.push({ setItem: item, globalIndex: index });
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} fullScreen>
        {/* Cabecera del Reproductor de Entrenamiento */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton color="inherit" onClick={onClose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                🏋️ {workout?.name || 'Entrenamiento en Vivo'}
              </Typography>
              <Typography variant="caption" opacity={0.9}>
                ⏱️ Tiempo Transcurrido: <strong>{formatTime(duration)}</strong>
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() => setFinishModalOpen(true)}
            sx={{ fontWeight: 'bold' }}
            startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          >
            Finalizar Entrenamiento
          </Button>
        </Box>

        {/* Barra Flotante de Temporizador de Descanso */}
        {isResting && (
          <Alert
            severity="info"
            icon={false}
            sx={{
              borderRadius: 0,
              bgcolor: '#0288d1',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                ⏳ Descanso Restante: {formatTime(restTimer)}
              </Typography>
              <Button size="small" variant="outlined" color="inherit" onClick={() => setRestTimer((prev) => prev + 15)}>
                +15s
              </Button>
              <Button size="small" variant="outlined" color="inherit" onClick={() => setRestTimer((prev) => prev + 30)}>
                +30s
              </Button>
              <Button size="small" variant="contained" color="warning" onClick={() => setIsResting(false)}>
                Saltar Descanso
              </Button>
            </Stack>
          </Alert>
        )}

        {/* Cuerpo con la Lista de Ejercicios y Series */}
        <DialogContent sx={{ p: 3, bgcolor: '#f4f6f8' }}>
          <Stack spacing={3} maxWidth="md" sx={{ mx: 'auto' }}>
            {Object.values(exercisesGrouped).map((group) => (
              <Card key={group.name} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                    {group.name}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    {group.sets.map(({ setItem, globalIndex }) => (
                      <Box
                        key={globalIndex}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: setItem.completed ? '#e8f5e9' : 'background.paper',
                          border: '1px solid',
                          borderColor: setItem.completed ? '#81c784' : '#e0e0e0',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between" flexWrap="wrap" gap={1}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Checkbox
                              checked={setItem.completed}
                              onChange={() => handleToggleSet(globalIndex)}
                              color="success"
                            />
                            <Typography variant="subtitle2" fontWeight="bold">
                              Serie #{setItem.setIndex}
                            </Typography>
                            {setItem.type === 'dropset' && <Chip label="Drop-Set" size="small" color="secondary" />}
                            {setItem.type === 'restpause' && <Chip label="Rest-Pause" size="small" color="warning" />}
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              size="small"
                              label="Peso (kg)"
                              type="number"
                              value={setItem.weight}
                              onChange={(e) => handleUpdateField(globalIndex, 'weight', Number(e.target.value))}
                              sx={{ width: 90 }}
                            />
                            <IconButton size="small" onClick={() => handleOpenBarCalc(setItem.weight)}>
                              <Iconify icon="mdi:weight-lifter" />
                            </IconButton>

                            <TextField
                              size="small"
                              label="Reps"
                              type="number"
                              value={setItem.reps}
                              onChange={(e) => handleUpdateField(globalIndex, 'reps', Number(e.target.value))}
                              sx={{ width: 80 }}
                            />

                            <TextField
                              size="small"
                              label="RPE"
                              type="number"
                              value={setItem.rpe}
                              onChange={(e) => handleUpdateField(globalIndex, 'rpe', Number(e.target.value))}
                              sx={{ width: 75 }}
                            />
                          </Stack>

                          {/* Botones de Intensificadores */}
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              onClick={() => handleAddDropSet(globalIndex)}
                            >
                              + Drop
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleAddRestPause(globalIndex)}
                            >
                              + Burst
                            </Button>
                          </Stack>
                        </Stack>

                        {/* Renders de Sub-filas para DropSets */}
                        {setItem.drops && setItem.drops.length > 0 && (
                          <Box sx={{ ml: 4, mt: 1, p: 1, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                            <Typography variant="caption" fontWeight="bold" color="secondary">
                              Bajadas Drop-Set:
                            </Typography>
                            {setItem.drops.map((drop, dIdx) => (
                              <Typography key={dIdx} variant="body2">
                                Bajada #{dIdx + 1}: <strong>{drop.weight} kg</strong> x {drop.reps} reps
                              </Typography>
                            ))}
                          </Box>
                        )}

                        {/* Renders de Sub-filas para Rest-Pause */}
                        {setItem.clusters && setItem.clusters.length > 0 && (
                          <Box sx={{ ml: 4, mt: 1, p: 1, bgcolor: '#fff3e0', borderRadius: 1 }}>
                            <Typography variant="caption" fontWeight="bold" color="warning.main">
                              Ráfagas Rest-Pause (15s rest):
                            </Typography>
                            {setItem.clusters.map((cluster, cIdx) => (
                              <Typography key={cIdx} variant="body2">
                                Ráfaga #{cIdx + 1}: {cluster.reps} reps
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Modal de Calculadora de Discos */}
      <BarCalculatorModal open={barCalcOpen} onClose={() => setBarCalcOpen(false)} targetWeight={targetWeightCalc} />

      {/* Modal de Confirmación y Evaluación del Entrenamiento */}
      <Dialog open={finishModalOpen} onClose={() => setFinishModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>🎉 Finalizar Entrenamiento</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body1">
              ¡Gran trabajo! Has completado el entrenamiento en <strong>{formatTime(duration)}</strong>.
            </Typography>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                ¿Cómo te has sentido en la sesión?
              </Typography>
              <Rating value={rating} onChange={(_, val) => setRating(val || 5)} size="large" />
            </Box>

            <TextField
              label="Notas de la sesión (sensaciones, molestias, observaciones)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinishModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleFinishWorkout} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar y Cerrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
