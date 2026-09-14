import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Chip
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { DietWithFoods } from '../../types/DietWithFoods';
import { calculateDietCalories, formatCalories } from '../../utils/dietUtils';
import { DietMealChecklist } from './DietMealChecklist';
import { DietVisualPdfModal } from './DietVisualPdfModal';

interface DietDetailProps {
  open: boolean;
  diet: DietWithFoods;
  onClose: () => void;
}

export const DietDetail = ({ open, diet, onClose }: DietDetailProps) => {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const totalCalories = calculateDietCalories(diet);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:chef-hat-bold-duotone" width={28} style={{ color: '#0284c7' }} />
            <Typography variant="h6" fontWeight="bold">
              Detalle & Retos de Dieta: {diet.name}
            </Typography>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:document-bold-duotone" width={20} />}
            onClick={() => setPdfModalOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Generar PDF Visual
          </Button>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: 'transparent' }}>
          <Box sx={{ mb: 3, p: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2.5, border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {diet.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {diet.description || 'Sin observaciones.'}
                </Typography>
              </Box>

              <Chip
                icon={<Iconify icon="solar:fire-bold" width={18} />}
                label={`Calorías: ${formatCalories(totalCalories)}`}
                color="error"
                sx={{ fontWeight: 'bold' }}
              />
            </Stack>
          </Box>

          <DietMealChecklist diet={diet} userId={1} readOnly={false} />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <DietVisualPdfModal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        diet={diet}
      />
    </>
  );
};