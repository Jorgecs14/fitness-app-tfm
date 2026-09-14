import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  TextField,
  Chip,
  Rating,
  Alert,
  Divider,
  LinearProgress,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  X,
  Clock,
  Dumbbell,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  List,
  Layers,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';
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

  const [viewMode, setViewMode] = useState<'stepper' | 'list'>('stepper');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  const [prevHistory, setPrevHistory] = useState<{ [exId: number]: { weight: number; reps: number; date?: string } }>({});

  useEffect(() => {
    if (!open) return;

    const initWorkout = async () => {
      setLoadingWorkout(true);
      try {
        let fullData = workout;
        if (!fullData?.exercises || fullData.exercises.length === 0) {
          try {
            fullData = await getWorkoutDetails(workout.id);
          } catch (e) {
            console.error('Error obteniendo detalles del workout:', e);
          }
        }
        setActiveWorkoutData(fullData);

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

  useEffect(() => {
    let interval: any = null;
    if (open && !finishModalOpen) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open, finishModalOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate([200, 100, 200]); } catch (e) {}
            }
            try {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContextClass) {
                const audioCtx = new AudioContextClass();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.4);
              }
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

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
    setSetsState((prev) => {
      const copy = [...prev];
      const target = copy[globalIndex];
      const willBeCompleted = !target.completed;
      copy[globalIndex] = { ...target, completed: willBeCompleted };

      if (willBeCompleted) {
        setIsResting(true);
        setRestTimer(90);
      }
      return copy;
    });
  };

  const handleUpdateField = (globalIndex: number, field: keyof LocalSetState, value: any) => {
    setSetsState((prev) => {
      const copy = [...prev];
      copy[globalIndex] = { ...copy[globalIndex], [field]: value };
      return copy;
    });
  };

  const handleQuickAdjust = (globalIndex: number, field: 'weight' | 'reps', delta: number) => {
    setSetsState((prev) => {
      const copy = [...prev];
      const cur = Number(copy[globalIndex][field]) || 0;
      const next = Math.max(0, cur + delta);
      copy[globalIndex] = { ...copy[globalIndex], [field]: next };
      return copy;
    });
  };

  const handleAddDropSet = (globalIndex: number) => {
    setSetsState((prev) => {
      const copy = [...prev];
      const curSet = copy[globalIndex];
      const drops = curSet.drops || [];
      const lastWeight = drops.length > 0 ? drops[drops.length - 1].weight : curSet.weight;
      const nextDropWeight = Math.max(5, Math.round(lastWeight * 0.75));
      copy[globalIndex] = {
        ...curSet,
        type: 'dropset',
        drops: [...drops, { weight: nextDropWeight, reps: 8 }],
      };
      return copy;
    });
  };

  const handleAddRestPause = (globalIndex: number) => {
    setSetsState((prev) => {
      const copy = [...prev];
      const curSet = copy[globalIndex];
      const clusters = curSet.clusters || [];
      copy[globalIndex] = {
        ...curSet,
        type: 'restpause',
        clusters: [...clusters, { reps: 4, restSec: 15 }],
      };
      return copy;
    });
  };

  const handleOpenBarCalc = (weight: number) => {
    setTargetWeightCalc(weight || 60);
    setBarCalcOpen(true);
  };

  const completedCount = setsState.filter((s) => s.completed).length;
  const totalCount = setsState.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalVolumeLifted = useMemo(() => {
    return setsState
      .filter((s) => s.completed)
      .reduce((acc, s) => {
        let vol = s.weight * s.reps;
        if (s.drops) {
          s.drops.forEach((d) => (vol += d.weight * d.reps));
        }
        if (s.clusters) {
          s.clusters.forEach((c) => (vol += s.weight * c.reps));
        }
        return acc + vol;
      }, 0);
  }, [setsState]);

  const handleFinishWorkout = async () => {
    try {
      setIsSubmitting(true);
      const payloadSets: LoggedSetData[] = setsState
        .filter((s) => s.completed)
        .map((s) => ({
          exercise_id: s.exerciseId,
          set_index: s.setIndex,
          phase: s.phase,
          type: s.type,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
          completed: true,
          drops: s.drops,
          clusters: s.clusters,
        }));

      await createLoggedSession({
        user_id: userId,
        workout_id: workout?.id,
        duration_minutes: Math.max(1, Math.round(duration / 60)),
        started_at: startedAt,
        completed_at: new Date().toISOString(),
        rating,
        notes,
        sets: payloadSets,
      });

      if (onSessionSuccess) onSessionSuccess();
      setFinishModalOpen(false);
      onClose();
    } catch (err) {
      console.error('Error guardando la sesión de entrenamiento:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: '#000000',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        {/* Cabecera Apple iOS Nav Bar */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            pt: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            bgcolor: '#161618',
            borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton color="inherit" onClick={onClose} sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.06)' }}>
              <X size={20} />
            </IconButton>
            <Box>
              <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {activeWorkoutData?.name || workout?.name || 'Entrenamiento en Vivo'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.3 }}>
                <Chip
                  icon={<Clock size={12} color="#007AFF" />}
                  label={formatTime(duration)}
                  size="small"
                  sx={{ bgcolor: 'rgba(0, 122, 255, 0.15)', color: '#007AFF', fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {completedCount}/{totalCount} series • {totalVolumeLifted.toLocaleString()} kg
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => setViewMode(viewMode === 'stepper' ? 'list' : 'stepper')}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.06)', color: '#FFFFFF' }}
            >
              {viewMode === 'stepper' ? <List size={18} /> : <Layers size={18} />}
            </IconButton>

            <Button
              variant="contained"
              size="small"
              onClick={() => setFinishModalOpen(true)}
              className="apple-button-primary"
              sx={{ fontWeight: 700, px: 2, borderRadius: '10px' }}
            >
              Finalizar
            </Button>
          </Stack>
        </Box>

        {/* Barra de progreso global */}
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 3,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            '& .MuiLinearProgress-bar': {
              bgcolor: progressPercent === 100 ? '#34C759' : '#007AFF',
            }
          }}
        />

        {/* Widget Flotante de Temporizador de Descanso Apple HIG */}
        {isResting && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              bgcolor: 'rgba(28, 28, 30, 0.92)',
              backdropFilter: 'blur(20px)',
              border: '0.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
              borderRadius: '20px',
              p: 1.5,
              px: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke={restTimer <= 10 ? '#FF453A' : '#34C759'}
                  strokeWidth="3.5"
                  strokeDasharray={113.1}
                  strokeDashoffset={113.1 - (113.1 * Math.min(60, restTimer)) / 60}
                  strokeLinecap="round"
                  transform="rotate(-90 22 22)"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <Typography sx={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF' }}>
                {restTimer}s
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                Descanso
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: restTimer <= 10 ? '#FF453A' : 'rgba(255, 255, 255, 0.5)' }}>
                {restTimer <= 10 ? '¡Próxima serie!' : 'Recuperando'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.8}>
              <Button
                size="small"
                onClick={() => setRestTimer((prev) => prev + 30)}
                sx={{
                  minWidth: 36,
                  height: 30,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              >
                +30s
              </Button>
              <Button
                size="small"
                onClick={() => setIsResting(false)}
                sx={{
                  minWidth: 44,
                  height: 30,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 59, 48, 0.15)',
                  color: '#FF453A',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              >
                Saltar
              </Button>
            </Stack>
          </Box>
        )}

        {/* Contenedor Principal */}
        <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, overflowY: 'auto', pb: 12 }}>
          {loadingWorkout ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
              <CircularProgress size={40} color="primary" />
              <Typography sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.5)' }}>Cargando ejercicios...</Typography>
            </Box>
          ) : exercisesGrouped.length === 0 ? (
            <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center', py: 6 }}>
              <Dumbbell size={48} color="rgba(255, 255, 255, 0.3)" style={{ marginBottom: 16 }} />
              <Typography variant="h6" fontWeight="800" gutterBottom>
                Esta rutina aún no tiene ejercicios asignados
              </Typography>
              <Button variant="contained" className="apple-button-primary" onClick={onClose} sx={{ mt: 2 }}>
                Volver al Panel
              </Button>
            </Box>
          ) : viewMode === 'stepper' && currentGroup ? (
            /* ===== MODO ENFOQUE (STEPPER) ===== */
            <Stack spacing={2.5} maxWidth="md" sx={{ mx: 'auto' }}>
              {/* Barra de Navegación entre Ejercicios */}
              <Box className="apple-card" sx={{ p: 1.5, px: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <IconButton
                    disabled={currentExerciseIndex === 0}
                    onClick={() => setCurrentExerciseIndex((prev) => Math.max(0, prev - 1))}
                    sx={{ color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.04)' }}
                  >
                    <ChevronLeft size={20} />
                  </IconButton>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, letterSpacing: '0.04em' }}>
                      EJERCICIO {currentExerciseIndex + 1} DE {exercisesGrouped.length}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#007AFF' }}>
                      {currentGroup.name}
                    </Typography>
                  </Box>

                  <IconButton
                    disabled={currentExerciseIndex >= exercisesGrouped.length - 1}
                    onClick={() => setCurrentExerciseIndex((prev) => Math.min(exercisesGrouped.length - 1, prev + 1))}
                    sx={{ color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.04)' }}
                  >
                    <ChevronRight size={20} />
                  </IconButton>
                </Stack>
              </Box>

              {/* Ficha Detallada del Ejercicio Actual */}
              <Box className="apple-card" sx={{ p: 2.5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1.5} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#FFFFFF' }}>
                      {currentGroup.name}
                    </Typography>
                    <Stack direction="row" spacing={0.8} sx={{ mt: 0.8 }} flexWrap="wrap">
                      {currentGroup.bodyPart && (
                        <Chip label={currentGroup.bodyPart} size="small" sx={{ bgcolor: 'rgba(0, 122, 255, 0.15)', color: '#007AFF', height: 22 }} />
                      )}
                      {currentGroup.targetMuscle && (
                        <Chip label={currentGroup.targetMuscle} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.7)', height: 22 }} />
                      )}
                      {currentGroup.equipment && (
                        <Chip label={currentGroup.equipment} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.7)', height: 22 }} />
                      )}
                    </Stack>
                  </Box>

                  {prevHistory[currentGroup.id] ? (
                    <Box sx={{ p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'rgba(52, 199, 89, 0.12)', border: '0.5px solid rgba(52, 199, 89, 0.25)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, display: 'block' }}>
                        Última Sesión:
                      </Typography>
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#34C759' }}>
                        {prevHistory[currentGroup.id].weight} kg x {prevHistory[currentGroup.id].reps} reps
                      </Typography>
                    </Box>
                  ) : null}
                </Stack>

                {currentGroup.gifUrl && (
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      bgcolor: '#161618',
                      my: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      maxHeight: 240,
                    }}
                  >
                    <img
                      src={currentGroup.gifUrl}
                      alt={currentGroup.name}
                      style={{ maxHeight: 240, maxWidth: '100%', objectFit: 'contain' }}
                      loading="eager"
                    />
                  </Box>
                )}

                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

                {/* Series del Ejercicio Optimizado para iPhone */}
                <Stack spacing={1.5}>
                  {currentGroup.sets.map(({ setItem, globalIndex }) => (
                    <Box
                      key={globalIndex}
                      sx={{
                        p: 1.8,
                        borderRadius: '14px',
                        bgcolor: setItem.completed ? 'rgba(52, 199, 89, 0.1)' : '#161618',
                        border: '0.5px solid',
                        borderColor: setItem.completed ? 'rgba(52, 199, 89, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1.5}>
                        {/* Checkbox y Serie */}
                        <Stack direction="row" alignItems="center" spacing={1.2}>
                          <Box onClick={() => handleToggleSet(globalIndex)} sx={{ cursor: 'pointer', display: 'flex' }}>
                            {setItem.completed ? (
                              <CheckCircle2 size={24} color="#34C759" />
                            ) : (
                              <Circle size={24} color="rgba(255, 255, 255, 0.25)" />
                            )}
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF' }}>
                              Serie #{setItem.setIndex}
                            </Typography>
                            <Typography variant="caption" sx={{ color: setItem.completed ? '#34C759' : 'rgba(255, 255, 255, 0.4)' }}>
                              {setItem.completed ? 'Completada' : 'Pendiente'}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Controles de Peso y Reps */}
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                          {/* Peso */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <IconButton size="small" onClick={() => handleQuickAdjust(globalIndex, 'weight', -2.5)} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              <Minus size={14} />
                            </IconButton>
                            <TextField
                              size="small"
                              label="Kg"
                              type="number"
                              value={setItem.weight}
                              onChange={(e) => handleUpdateField(globalIndex, 'weight', Number(e.target.value))}
                              sx={{ width: 75 }}
                            />
                            <IconButton size="small" onClick={() => handleQuickAdjust(globalIndex, 'weight', 2.5)} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              <Plus size={14} />
                            </IconButton>
                            <Tooltip title="Calculadora de Discos">
                              <IconButton size="small" onClick={() => handleOpenBarCalc(setItem.weight)} sx={{ color: '#007AFF' }}>
                                <Dumbbell size={16} />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          {/* Reps */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <IconButton size="small" onClick={() => handleQuickAdjust(globalIndex, 'reps', -1)} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              <Minus size={14} />
                            </IconButton>
                            <TextField
                              size="small"
                              label="Reps"
                              type="number"
                              value={setItem.reps}
                              onChange={(e) => handleUpdateField(globalIndex, 'reps', Number(e.target.value))}
                              sx={{ width: 65 }}
                            />
                            <IconButton size="small" onClick={() => handleQuickAdjust(globalIndex, 'reps', 1)} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              <Plus size={14} />
                            </IconButton>
                          </Box>

                          {/* RPE */}
                          <TextField
                            size="small"
                            label="RPE"
                            type="number"
                            value={setItem.rpe}
                            onChange={(e) => handleUpdateField(globalIndex, 'rpe', Number(e.target.value))}
                            sx={{ width: 60 }}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                {/* Acciones de Navegación del Ejercicio */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '0.5px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    {currentGroup.sets.every((s) => s.setItem.completed)
                      ? '¡Todas las series completadas!'
                      : 'Marca la serie para activar el descanso.'}
                  </Typography>

                  {currentExerciseIndex < exercisesGrouped.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={() => setCurrentExerciseIndex((prev) => prev + 1)}
                      className="apple-button-primary"
                      endIcon={<ChevronRight size={16} />}
                      sx={{ fontWeight: 700, borderRadius: '10px' }}
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => setFinishModalOpen(true)}
                      className="apple-button-primary"
                      sx={{ fontWeight: 700, borderRadius: '10px' }}
                    >
                      Terminar
                    </Button>
                  )}
                </Box>
              </Box>
            </Stack>
          ) : (
            /* ===== MODO LISTA COMPLETA ===== */
            <Stack spacing={2.5} maxWidth="md" sx={{ mx: 'auto' }}>
              {exercisesGrouped.map((group, gIdx) => (
                <Box key={group.id} className="apple-card" sx={{ p: 2.5 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF' }}>
                        {gIdx + 1}. {group.name}
                      </Typography>
                      {prevHistory[group.id] && (
                        <Typography variant="caption" sx={{ color: '#34C759', fontWeight: 600, display: 'block' }}>
                          Última sesión: {prevHistory[group.id].weight} kg x {prevHistory[group.id].reps} reps
                        </Typography>
                      )}
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setCurrentExerciseIndex(gIdx);
                        setViewMode('stepper');
                      }}
                      sx={{ borderRadius: '8px', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.15)', textTransform: 'none' }}
                    >
                      Enfocar
                    </Button>
                  </Stack>

                  <Stack spacing={1}>
                    {group.sets.map(({ setItem, globalIndex }) => (
                      <Box
                        key={globalIndex}
                        sx={{
                          p: 1.2,
                          px: 1.5,
                          borderRadius: '10px',
                          bgcolor: setItem.completed ? 'rgba(52, 199, 89, 0.1)' : '#161618',
                          border: '0.5px solid',
                          borderColor: setItem.completed ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box onClick={() => handleToggleSet(globalIndex)} sx={{ cursor: 'pointer', display: 'flex' }}>
                            {setItem.completed ? <CheckCircle2 size={18} color="#34C759" /> : <Circle size={18} color="rgba(255,255,255,0.3)" />}
                          </Box>
                          <Typography variant="body2" fontWeight="600" sx={{ color: '#FFFFFF' }}>
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
                            sx={{ width: 70 }}
                          />
                          <TextField
                            size="small"
                            label="Reps"
                            type="number"
                            value={setItem.reps}
                            onChange={(e) => handleUpdateField(globalIndex, 'reps', Number(e.target.value))}
                            sx={{ width: 65 }}
                          />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Modal de Finalización */}
        <Dialog
          open={finishModalOpen}
          onClose={() => setFinishModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            className: 'apple-card',
            sx: { borderRadius: '18px', p: 1.5 },
          }}
        >
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                bgcolor: 'rgba(52, 199, 89, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
              }}
            >
              <Award size={28} color="#34C759" />
            </Box>

            <Typography variant="h5" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.5 }}>
              ¡Sesión Finalizada!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2.5 }}>
              Buen trabajo. Se registrarán tus marcas y volumen levantado en el historial.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>Tiempo</Typography>
                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#FFFFFF' }}>{formatTime(duration)}</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>Volumen</Typography>
                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#007AFF' }}>{totalVolumeLifted.toLocaleString()} kg</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>Series</Typography>
                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#34C759' }}>{completedCount}/{totalCount}</Typography>
              </Box>
            </Box>

            <Stack spacing={2} sx={{ mb: 3, textAlign: 'left' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 0.5 }}>
                  Sensaciones y Esfuerzo
                </Typography>
                <Rating value={rating} onChange={(_, val) => setRating(val || 5)} size="large" sx={{ color: '#FF9500' }} />
              </Box>

              <TextField
                label="Notas de la sesión"
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                placeholder="Ej. Buenas sensaciones en press banca..."
              />
            </Stack>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button onClick={() => setFinishModalOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Volver
              </Button>
              <Button
                variant="contained"
                onClick={handleFinishWorkout}
                disabled={isSubmitting}
                className="apple-button-primary"
                sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Sesión'}
              </Button>
            </Stack>
          </Box>
        </Dialog>

        {barCalcOpen && (
          <BarCalculatorModal
            open={barCalcOpen}
            onClose={() => setBarCalcOpen(false)}
            initialWeight={targetWeightCalc}
          />
        )}
      </Dialog>
    </>
  );
};

export default LiveWorkoutDialog;
