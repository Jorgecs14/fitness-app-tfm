import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  IconButton, 
  Box, 
  Stack 
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { Diet } from '../../types/Diet';

interface DietCardProps {
  diet: Diet;
  onEdit: (diet: Diet) => void;
  onDelete: (id: number) => void;
  onManageUsers?: (diet: Diet) => void;
  userCount?: number;
}

export const DietCard = ({ diet, onEdit, onDelete, onManageUsers, userCount = 0 }: DietCardProps) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {diet.name}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(diet)}
              sx={{ p: 0.5 }}
            >
              <Iconify icon="solar:pen-bold" width={16} />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(diet.id)}
              sx={{ p: 0.5 }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
            </IconButton>
          </Stack>
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2, minHeight: 60 }}
        >
          {diet.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            icon={<Iconify icon="solar:fire-bold" width={16} />}
            label={`${diet.calories} kcal`}
            color="primary"
            variant="outlined"
            size="medium"
          />
          {onManageUsers && (
            <Chip
              icon={<Iconify icon="solar:users-group-rounded-bold" width={16} />}
              label={`${userCount} usuarios`}
              onClick={() => onManageUsers(diet)}
              sx={{ cursor: 'pointer' }}
              color="default"
              variant="outlined"
              size="medium"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};