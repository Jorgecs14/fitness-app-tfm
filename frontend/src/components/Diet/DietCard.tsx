import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { DietWithFoods } from '../../types/DietWithFoods';
import { calculateDietCalories, formatCalories } from '../../utils/dietUtils';

interface DietCardProps {
  diet: DietWithFoods;
  userName?: string;
  onEdit: (diet: DietWithFoods) => void;
  onDelete: (id: number) => void;
  onViewDetails: (diet: DietWithFoods) => void;
  onManageFoods?: (diet: DietWithFoods) => void;
  onManageUsers?: (diet: DietWithFoods) => void;
}

export const DietCard = ({
  diet,
  userName,
  onEdit,
  onDelete,
  onViewDetails,
  onManageFoods,
  onManageUsers,
}: DietCardProps) => {
  const foodsCount = diet.diet_foods?.length ?? diet.foods?.length ?? 0;
  const totalCalories = calculateDietCalories(diet);

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
        {/* Encabezado: Calorías y Alimentos */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip
            icon={<Iconify icon="solar:fire-bold" width={16} sx={{ color: '#f59e0b !important' }} />}
            label={formatCalories(totalCalories)}
            size="small"
            sx={{
              bgcolor: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '9999px',
            }}
          />

          <Tooltip title="Ver detalles">
            <IconButton
              size="small"
              onClick={() => onViewDetails(diet)}
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
        </Box>

        {/* Título de la Dieta */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            color: '#f8fafc',
            fontSize: '1.15rem',
            lineHeight: 1.3,
          }}
        >
          {diet.name}
        </Typography>

        {userName && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
            👤 Asignado a: <strong>{userName}</strong>
          </Typography>
        )}

        {diet.description && (
          <Typography
            variant="body2"
            sx={{
              color: '#94a3b8',
              lineHeight: 1.5,
              fontSize: '0.875rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {diet.description}
          </Typography>
        )}

        {/* Alimentos Contenidos */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: '12px',
              bgcolor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#f8fafc',
            }}
          >
            <Iconify icon="solar:apple-bold" width={16} sx={{ color: '#10b981' }} />
            {foodsCount} {foodsCount === 1 ? 'alimento' : 'alimentos'}
          </Box>
        </Box>
      </CardContent>

      {/* Acciones de la Tarjeta */}
      <CardActions
        sx={{
          p: 2,
          pt: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(12px)',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          {onManageFoods && (
            <Tooltip title="Gestionar Alimentos">
              <IconButton
                size="small"
                onClick={() => onManageFoods(diet)}
                sx={{
                  color: '#94a3b8',
                  '&:hover': { color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.15)' },
                }}
              >
                <Iconify icon="solar:plate-bold" width={16} />
              </IconButton>
            </Tooltip>
          )}

          {onManageUsers && (
            <Tooltip title="Gestionar Usuarios">
              <IconButton
                size="small"
                onClick={() => onManageUsers(diet)}
                sx={{
                  color: '#94a3b8',
                  '&:hover': { color: '#22d3ee', bgcolor: 'rgba(34, 211, 238, 0.15)' },
                }}
              >
                <Iconify icon="solar:users-group-rounded-bold" width={16} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => onEdit(diet)}
              sx={{
                color: '#94a3b8',
                '&:hover': { color: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.15)' },
              }}
            >
              <Iconify icon="solar:pen-bold" width={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => onDelete(diet.id)}
              sx={{
                color: '#94a3b8',
                '&:hover': { color: '#f43f5e', bgcolor: 'rgba(244, 63, 94, 0.15)' },
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

