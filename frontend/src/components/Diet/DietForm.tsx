// Modal de creación y edición de Dietas con diseño Apple Inset Grouped
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  UtensilsCrossed,
  X,
  Flame,
  FileText,
  Tag,
  Check,
} from 'lucide-react';
import { Diet } from '../../types/Diet';
import { User } from '../../types/User';

interface DietFormProps {
  open: boolean;
  dietToEdit?: Diet | null;
  users?: User[];
  onClose: () => void;
  onSubmit: (diet: Partial<Diet>) => void;
}

const CALORIE_PRESETS = [1600, 1800, 2000, 2200, 2500, 3000];

export const DietForm: React.FC<DietFormProps> = ({
  open,
  dietToEdit,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState<Partial<Diet>>({
    name: '',
    description: '',
    calories: 2000,
  });

  useEffect(() => {
    if (dietToEdit) {
      setFormData({
        name: dietToEdit.name || '',
        description: dietToEdit.description || '',
        calories: dietToEdit.calories || 2000,
      });
    } else {
      setFormData({ name: '', description: '', calories: 2000 });
    }
  }, [dietToEdit, open]);

  const handleChange = (field: keyof Diet) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = field === 'calories' ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!formData.name?.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#000000',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          maxHeight: { xs: '100%', sm: '85vh' },
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
              bgcolor: 'rgba(52, 199, 89, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34C759',
              border: '0.5px solid rgba(52, 199, 89, 0.3)',
            }}
          >
            <UtensilsCrossed size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              {dietToEdit ? 'Editar Pauta Nutricional' : 'Nueva Pauta Nutricional'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Objetivos calóricos y distribución
            </Typography>
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
        <Stack spacing={2.5}>
          {/* Card Inset Grouped */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#1C1C1E',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                  Nombre del Plan / Dieta *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Ej: Dieta de Definición 2.000 kcal"
                  value={formData.name || ''}
                  onChange={handleChange('name')}
                  InputProps={{
                    sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                  Calorías Objetivo Diarias (Kcal)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="2000"
                  value={formData.calories || ''}
                  onChange={handleChange('calories')}
                  InputProps={{
                    sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                  }}
                />

                {/* Presets rápidos de calorías */}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {CALORIE_PRESETS.map((cal) => (
                    <Chip
                      key={cal}
                      label={`${cal} kcal`}
                      size="small"
                      onClick={() => setFormData((prev) => ({ ...prev, calories: cal }))}
                      sx={{
                        bgcolor: formData.calories === cal ? '#34C759' : '#2C2C2E',
                        color: formData.calories === cal ? '#000000' : '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        border: '0.5px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                  Pautas y Recomendaciones
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Instrucciones sobre hidratación, timing o suplementación..."
                  value={formData.description || ''}
                  onChange={handleChange('description')}
                  InputProps={{
                    sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                  }}
                />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      {/* Footer Botones Apple */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
          bgcolor: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 12px)' : 2,
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: '12px',
            color: '#ffffff',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.name?.trim()}
          variant="contained"
          sx={{
            flex: 2,
            height: 44,
            borderRadius: '12px',
            bgcolor: '#34C759',
            color: '#000000',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: '0 4px 14px rgba(52, 199, 89, 0.3)',
            '&:hover': { bgcolor: '#2eb34f' },
          }}
        >
          {dietToEdit ? 'Guardar Cambios' : 'Crear Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DietForm;