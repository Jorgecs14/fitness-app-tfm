// Modal de detalle de rutina con diseño Apple Liquid Glass y chips de métricas
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Chip,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dumbbell,
  X,
  Layers,
  Repeat,
  Clock,
  CheckCircle2,
  FileText,
  Tag,
} from 'lucide-react';
import { getWorkoutWithExercises } from '../../services/workoutService';
import { WorkoutWithExercises } from '../../types/WorkoutWithExercises';

interface Props {
  workoutId: number;
  open: boolean;
  onClose: () => void;
}

export const WorkoutDetail: React.FC<Props> = ({ workoutId, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkout = async () => {
      if (!open) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getWorkoutWithExercises(workoutId);
        setWorkout(data);
      } catch (err) {
        setError('No se pudo cargar el entrenamiento');
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [workoutId, open]);

  const getCategoryConfig = (category: string) => {
    switch ((category || '').toLowerCase()) {
      case 'strength':
      case 'fuerza':
        return { color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)' };
      case 'hipertrofia':
      case 'hypertrophy':
        return { color: '#007AFF', bg: 'rgba(0, 122, 255, 0.15)' };
      case 'cardio':
        return { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' };
      case 'flexibility':
      case 'movilidad':
        return { color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)' };
      default:
        return { color: '#007AFF', bg: 'rgba(0, 122, 255, 0.15)' };
    }
  };

  const cat = getCategoryConfig(workout?.category || '');
  const exerciseList = workout?.exercises || workout?.workout_exercises || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#000000',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          maxHeight: { xs: '100%', sm: '90vh' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header Apple Liquid Glass */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: cat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: cat.color,
              border: `0.5px solid ${cat.color}40`,
            }}
          >
            <Dumbbell size={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }} noWrap>
              {workout ? workout.name : 'Detalle del Entrenamiento'}
            </Typography>
            {workout?.category && (
              <Chip
                label={workout.category}
                size="small"
                sx={{
                  bgcolor: cat.bg,
                  color: cat.color,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 20,
                  mt: 0.25,
                }}
              />
            )}
          </Box>
        </Stack>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'rgba(235, 235, 245, 0.8)',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Contenido con Scroll */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#000000', overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#007AFF' }} />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{
              borderRadius: '14px',
              bgcolor: 'rgba(255, 59, 48, 0.15)',
              color: '#FF453A',
              border: '0.5px solid rgba(255, 59, 48, 0.3)',
            }}
          >
            {error}
          </Alert>
        ) : workout ? (
          <Stack spacing={3}>
            {/* Notas Inset Grouped */}
            {workout.notes && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  bgcolor: '#1C1C1E',
                  border: '0.5px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileText size={16} color="#007AFF" /> Indicaciones y Pautas
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.8)', lineHeight: 1.6 }}>
                  {workout.notes}
                </Typography>
              </Box>
            )}

            {/* Listado de Ejercicios */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Layers size={16} color="#34C759" /> Ejercicios ({exerciseList.length})
              </Typography>

              {exerciseList.length === 0 ? (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: '#1C1C1E',
                    borderRadius: '20px',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    No hay ejercicios configurados en esta rutina
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {exerciseList.map((ex: any, index: number) => (
                    <Box
                      key={ex.link_id || index}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: '#1C1C1E',
                        border: '0.5px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'rgba(0, 122, 255, 0.15)',
                          color: '#007AFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          border: '0.5px solid rgba(0, 122, 255, 0.3)',
                        }}
                      >
                        {index + 1}
                      </Box>

                      {ex.gif_url && (
                        <Box
                          component="img"
                          src={ex.gif_url}
                          alt={ex.name}
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '12px',
                            objectFit: 'contain',
                            bgcolor: '#000000',
                            border: '0.5px solid rgba(255, 255, 255, 0.1)',
                            flexShrink: 0,
                          }}
                          loading="lazy"
                        />
                      )}

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.5 }} noWrap>
                          {ex.name}
                        </Typography>
                        {ex.description && (
                          <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)', display: 'block', mb: 1 }} noWrap>
                            {ex.description}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            icon={<Repeat size={12} color="#007AFF" />}
                            label={`${ex.sets || 3} series`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(0, 122, 255, 0.15)',
                              color: '#007AFF',
                              fontWeight: 600,
                              fontSize: '0.72rem',
                              height: 22,
                            }}
                          />
                          <Chip
                            icon={<CheckCircle2 size={12} color="#34C759" />}
                            label={`${ex.reps || 10} reps`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(52, 199, 89, 0.15)',
                              color: '#34C759',
                              fontWeight: 600,
                              fontSize: '0.72rem',
                              height: 22,
                            }}
                          />
                          {ex.execution_time > 0 && (
                            <Chip
                              icon={<Clock size={12} color="#FF9500" />}
                              label={`${ex.execution_time}s`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255, 149, 0, 0.15)',
                                color: '#FF9500',
                                fontWeight: 600,
                                fontSize: '0.72rem',
                                height: 22,
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        ) : null}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
          bgcolor: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 12px)' : 2,
        }}
      >
        <Button
          fullWidth
          onClick={onClose}
          sx={{
            height: 44,
            borderRadius: '12px',
            bgcolor: '#007AFF',
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: '#0062cc' },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutDetail;
