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
import {
  Play,
  QrCode,
  Eye,
  Dumbbell,
  Clock,
  User,
  Edit2,
  Trash2,
  Sliders,
} from 'lucide-react';
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
        return { color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)', label: 'Fuerza' };
      case 'hipertrofia':
      case 'hypertrophy':
        return { color: '#007AFF', bg: 'rgba(0, 122, 255, 0.15)', label: 'Hipertrofia' };
      case 'cardio':
        return { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)', label: 'Cardio' };
      case 'flexibility':
      case 'flexibilidad':
      case 'movilidad':
        return { color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)', label: 'Movilidad' };
      case 'endurance':
      case 'resistencia':
        return { color: '#AF52DE', bg: 'rgba(175, 82, 222, 0.15)', label: 'Resistencia' };
      default:
        return { color: 'rgba(255, 255, 255, 0.7)', bg: 'rgba(255, 255, 255, 0.08)', label: category || 'Rutina' };
    }
  };

  const cat = getCategoryConfig(workout.category || '');
  const exerciseCount = workout.workout_exercises?.length || workout.exercises?.length || 0;

  return (
    <Card
      className="apple-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'rgba(0, 122, 255, 0.3)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        {/* Encabezado: Categoría y Acceso Rápido QR */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Chip
            label={cat.label}
            size="small"
            sx={{
              bgcolor: cat.bg,
              color: cat.color,
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 22,
            }}
          />

          <Stack direction="row" spacing={0.5}>
            {onShareQr && (
              <Tooltip title="Compartir vía QR">
                <IconButton
                  size="small"
                  onClick={() => onShareQr(workout)}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                    '&:hover': { color: '#FF9500', bgcolor: 'rgba(255, 149, 0, 0.15)' },
                  }}
                >
                  <QrCode size={16} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Ver Detalles">
              <IconButton
                size="small"
                onClick={() => onViewDetails(workout)}
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                  '&:hover': { color: '#007AFF', bgcolor: 'rgba(0, 122, 255, 0.15)' },
                }}
              >
                <Eye size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Título de la Rutina */}
        <Typography
          variant="subtitle1"
          fontWeight="800"
          sx={{
            color: '#FFFFFF',
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          {workout.name}
        </Typography>

        {userName && (
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 1 }}>
            Asignado a: <strong style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{userName}</strong>
          </Typography>
        )}

        {workout.notes && (
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: 1.4,
              fontSize: '0.8rem',
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
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 'auto', flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1.2,
              py: 0.4,
              borderRadius: '8px',
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <Dumbbell size={14} color="#007AFF" />
            {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
          </Box>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1.2,
              py: 0.4,
              borderRadius: '8px',
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <Clock size={14} color="#FF9500" />
            ~{Math.max(30, exerciseCount * 9)} min
          </Box>
        </Box>
      </CardContent>

      {/* Acciones de la Tarjeta */}
      <CardActions
        sx={{
          p: 1.5,
          px: 2,
          borderTop: '0.5px solid rgba(255, 255, 255, 0.06)',
          bgcolor: 'rgba(22, 22, 24, 0.6)',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {onStartLiveWorkout ? (
          <Button
            variant="contained"
            size="small"
            onClick={() => onStartLiveWorkout(workout)}
            startIcon={<Play size={14} />}
            className="apple-button-primary"
            sx={{
              borderRadius: '8px',
              px: 1.8,
              py: 0.6,
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'none',
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
                  color: 'rgba(255, 255, 255, 0.6)',
                  '&:hover': { color: '#007AFF' },
                }}
              >
                <Sliders size={16} />
              </IconButton>
            </Tooltip>
          )}

          {onManageUser && (
            <Tooltip title="Asignar Usuario">
              <IconButton
                size="small"
                onClick={() => onManageUser(workout)}
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  '&:hover': { color: '#AF52DE' },
                }}
              >
                <User size={16} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => onEdit(workout)}
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                '&:hover': { color: '#FF9500' },
              }}
            >
              <Edit2 size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => onDelete(workout.id)}
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                '&:hover': { color: '#FF3B30' },
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default WorkoutCard;
