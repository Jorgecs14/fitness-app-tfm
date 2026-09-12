import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Button,
  Stack,
  Tooltip,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { WorkoutWithExercises } from '../../types/WorkoutWithExercises';

interface WorkoutCardProps {
  workout: WorkoutWithExercises;
  userName?: string;
  onEdit: (workout: WorkoutWithExercises) => void;
  onDelete: (id: number) => void;
  onViewDetails: (workout: WorkoutWithExercises) => void;
  onManageExercises?: (workout: WorkoutWithExercises) => void;
  onManageUser?: (workout: WorkoutWithExercises) => void;
  onStartLiveWorkout?: (workout: WorkoutWithExercises) => void;
  onShareQr?: (workout: WorkoutWithExercises) => void;
}

export const WorkoutCard = ({
  workout,
  userName,
  onEdit,
  onDelete,
  onViewDetails,
  onManageExercises,
  onManageUser,
  onStartLiveWorkout,
  onShareQr,
}: WorkoutCardProps) => {
  const getCategoryConfig = (category: string) => {
    switch (category.toLowerCase()) {
      case 'strength':
      case 'fuerza':
        return { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)', label: 'Fuerza' };
      case 'hipertrofia':
      case 'hypertrophy':
        return { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', label: 'Hipertrofia' };
      case 'cardio':
        return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', label: 'Cardio' };
      case 'flexibility':
      case 'flexibilidad':
      case 'movilidad':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Movilidad' };
      case 'endurance':
      case 'resistencia':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'Resistencia' };
      default:
        return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', label: category || 'Rutina' };
    }
  };

  const cat = getCategoryConfig(workout.category || '');
  const exerciseCount = workout.workout_exercises?.length || workout.exercises?.length || 0;

  return (
    <Card
      className="liquid-glass-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
        position: 'relative',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Encabezado: Categoría y Acceso Rápido QR */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip
            label={cat.label}
            size="small"
            sx={{
              bgcolor: cat.bg,
              color: cat.color,
              fontWeight: 700,
              fontSize: '0.75rem',
              border: `1px solid ${cat.color}40`,
              borderRadius: '9999px',
            }}
          />

          <Stack direction="row" spacing={0.5}>
            {onShareQr && (
              <Tooltip title="Compartir vía QR">
                <IconButton
                  size="small"
                  onClick={() => onShareQr(workout)}
                  sx={{
                    color: 'text.secondary',
                    bgcolor: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { color: 'warning.main', bgcolor: 'rgba(245, 158, 11, 0.15)' },
                  }}
                >
                  <Iconify icon="eva:qr-code-fill" width={16} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Ver detalles completos">
              <IconButton
                size="small"
                onClick={() => onViewDetails(workout)}
                sx={{
                  color: 'text.secondary',
                  bgcolor: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': { color: 'primary.main', bgcolor: 'rgba(2, 132, 199, 0.15)' },
                }}
              >
                <Iconify icon="solar:eye-bold" width={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Título de la Rutina */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            color: '#0f172a',
            fontSize: '1.15rem',
            lineHeight: 1.3,
          }}
        >
          {workout.name}
        </Typography>

        {userName && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
            👤 Asignado a: <strong>{userName}</strong>
          </Typography>
        )}

        {workout.notes && (
          <Typography
            variant="body2"
            sx={{
              color: '#475569',
              lineHeight: 1.5,
              fontSize: '0.875rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {workout.notes}
          </Typography>
        )}

        {/* Métricas de la Rutina */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: '12px',
              bgcolor: 'rgba(241, 245, 249, 0.8)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <Iconify icon="solar:dumbbell-bold" width={16} sx={{ color: '#0284c7' }} />
            {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
          </Box>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: '12px',
              bgcolor: 'rgba(241, 245, 249, 0.8)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: '#f59e0b' }} />
            ~{Math.max(30, exerciseCount * 9)} min
          </Box>
        </Box>
      </CardContent>

      {/* Acciones de la Tarjeta */}
      <CardActions
        sx={{
          p: 2,
          pt: 1.5,
          borderTop: '1px solid rgba(226, 232, 240, 0.6)',
          bgcolor: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(12px)',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {onStartLiveWorkout ? (
          <Button
            variant="contained"
            size="small"
            onClick={() => onStartLiveWorkout(workout)}
            startIcon={<Iconify icon="solar:play-circle-bold" width={18} />}
            sx={{
              borderRadius: '9999px',
              px: 2,
              py: 0.75,
              fontWeight: 700,
              fontSize: '0.82rem',
              bgcolor: '#0f172a',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
              '&:hover': {
                bgcolor: '#0284c7',
                boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)',
              },
            }}
          >
            Iniciar
          </Button>
        ) : (
          <Box />
        )}

        <Stack direction="row" spacing={0.5} alignItems="center">
          {onManageExercises && (
            <Tooltip title="Configurar Ejercicios">
              <IconButton
                size="small"
                onClick={() => onManageExercises(workout)}
                sx={{
                  color: '#475569',
                  '&:hover': { color: '#0284c7', bgcolor: 'rgba(2, 132, 199, 0.1)' },
                }}
              >
                <Iconify icon="solar:dumbbell-bold" width={16} />
              </IconButton>
            </Tooltip>
          )}

          {onManageUser && (
            <Tooltip title="Asignar Usuario">
              <IconButton
                size="small"
                onClick={() => onManageUser(workout)}
                sx={{
                  color: '#475569',
                  '&:hover': { color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)' },
                }}
              >
                <Iconify icon="solar:user-bold" width={16} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => onEdit(workout)}
              sx={{
                color: '#475569',
                '&:hover': { color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.1)' },
              }}
            >
              <Iconify icon="solar:pen-bold" width={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => onDelete(workout.id)}
              sx={{
                color: '#475569',
                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );
};


