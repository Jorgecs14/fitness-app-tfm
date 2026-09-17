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
import {
  Flame,
  Droplets,
  Pill,
  UtensilsCrossed,
  Eye,
  Users,
  Edit3,
  Trash2,
  Apple
} from 'lucide-react';
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
  const waterLiters = diet.water_liters ? Number(diet.water_liters) : 2.5;

  let supplementsCount = 0;
  if (diet.supplement_products) {
    const raw = typeof diet.supplement_products === 'string' ? JSON.parse(diet.supplement_products) : diet.supplement_products;
    if (Array.isArray(raw)) supplementsCount = raw.length;
  }

  return (
    <Card
      className="apple-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
        position: 'relative',
        borderRadius: '20px',
        bgcolor: '#16161A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: 'rgba(52, 199, 89, 0.3)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.8 }}>
        {/* Encabezado: Calorías e Hidratación */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<Flame size={14} color="#FF9500" />}
              label={`${totalCalories > 0 ? totalCalories : (diet.calories || 2000)} kcal`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 149, 0, 0.15)',
                color: '#FF9500',
                fontWeight: 800,
                fontSize: '0.75rem',
                border: '1px solid rgba(255, 149, 0, 0.25)',
                borderRadius: '9999px',
              }}
            />

            <Chip
              icon={<Droplets size={14} color="#007AFF" />}
              label={`${waterLiters} L / día`}
              size="small"
              sx={{
                bgcolor: 'rgba(0, 122, 255, 0.15)',
                color: '#007AFF',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid rgba(0, 122, 255, 0.25)',
                borderRadius: '9999px',
              }}
            />
          </Stack>

          <Tooltip title="Ver detalles y reto diario">
            <IconButton
              size="small"
              onClick={() => onViewDetails(diet)}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                '&:hover': { color: '#007AFF', bgcolor: 'rgba(0, 122, 255, 0.15)' },
              }}
            >
              <Eye size={16} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Título de la Dieta */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 800,
            mb: 0.75,
            color: '#ffffff',
            fontSize: '1.1rem',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}
        >
          {diet.name}
        </Typography>

        {userName && (
          <Typography variant="caption" sx={{ color: '#34C759', display: 'block', mb: 1.5, fontWeight: 600 }}>
            👤 Asignado a: <strong>{userName}</strong>
          </Typography>
        )}

        {diet.description && (
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.5,
              fontSize: '0.84rem',
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

        {/* Badges de Contenido */}
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1.2,
              py: 0.4,
              borderRadius: '10px',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <UtensilsCrossed size={13} color="#34C759" />
            5 Tomas Pautadas
          </Box>

          {supplementsCount > 0 && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.2,
                py: 0.4,
                borderRadius: '10px',
                bgcolor: 'rgba(255, 149, 0, 0.1)',
                border: '1px solid rgba(255, 149, 0, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#FF9500',
              }}
            >
              <Pill size={13} />
              {supplementsCount} {supplementsCount === 1 ? 'suplemento' : 'suplementos'}
            </Box>
          )}
        </Stack>
      </CardContent>

      {/* Acciones de la Tarjeta */}
      <CardActions
        sx={{
          p: 1.8,
          pt: 1.2,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          bgcolor: 'rgba(0, 0, 0, 0.2)',
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
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { color: '#34C759', bgcolor: 'rgba(52, 199, 89, 0.15)' },
                }}
              >
                <Apple size={16} />
              </IconButton>
            </Tooltip>
          )}

          {onManageUsers && (
            <Tooltip title="Asignar Alumnos">
              <IconButton
                size="small"
                onClick={() => onManageUsers(diet)}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { color: '#007AFF', bgcolor: 'rgba(0, 122, 255, 0.15)' },
                }}
              >
                <Users size={16} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Editar Dieta">
            <IconButton
              size="small"
              onClick={() => onEdit(diet)}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { color: '#34C759', bgcolor: 'rgba(52, 199, 89, 0.15)' },
              }}
            >
              <Edit3 size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => onDelete(diet.id)}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { color: '#FF453A', bgcolor: 'rgba(255, 69, 58, 0.15)' },
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

export default DietCard;
