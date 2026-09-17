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
  Chip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ChefHat,
  Flame,
  Droplets,
  FileDown,
  X,
  Pill,
  ExternalLink
} from 'lucide-react';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const totalCalories = calculateDietCalories(diet);
  const waterLiters = diet.water_liters ? Number(diet.water_liters) : 2.5;

  let supplements: any[] = [];
  if (diet.supplement_products) {
    const raw = typeof diet.supplement_products === 'string' ? JSON.parse(diet.supplement_products) : diet.supplement_products;
    if (Array.isArray(raw)) supplements = raw;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: '#0A0A0C',
            backgroundImage: 'none',
            color: '#ffffff',
            borderRadius: { xs: 0, sm: '24px' },
            border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
            boxShadow: '0 32px 80px rgba(0, 0, 0, 0.9)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: { xs: 2, sm: 2.5 },
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            bgcolor: 'rgba(22, 22, 26, 0.85)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: 'rgba(0, 122, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#007AFF',
              }}
            >
              <ChefHat size={20} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#ffffff' }}>
                {diet.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Detalles del plan, retos diarios y suplementación
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={<FileDown size={16} />}
              onClick={() => setPdfModalOpen(true)}
              className="apple-button-primary"
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem' }}
            >
              Exportar PDF
            </Button>
            <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <X size={18} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#0A0A0C' }}>
          {/* Card Resumen */}
          <Box
            sx={{
              mb: 3,
              p: 2.5,
              bgcolor: '#16161A',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#ffffff' }}>
                  {diet.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.65)', mt: 0.5, maxWidth: 500 }}>
                  {diet.description || 'Pautas de nutrición prescritas.'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  icon={<Flame size={14} color="#FF9500" />}
                  label={`${totalCalories > 0 ? totalCalories : (diet.calories || 2000)} kcal`}
                  sx={{ bgcolor: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 800, borderRadius: '10px' }}
                />

                <Chip
                  icon={<Droplets size={14} color="#007AFF" />}
                  label={`${waterLiters} L / día`}
                  sx={{ bgcolor: 'rgba(0, 122, 255, 0.15)', color: '#007AFF', fontWeight: 700, borderRadius: '10px' }}
                />
              </Stack>
            </Stack>
          </Box>

          {/* Suplementación si tiene */}
          {supplements.length > 0 && (
            <Box
              sx={{
                mb: 3,
                p: 2.5,
                bgcolor: '#16161A',
                borderRadius: '20px',
                border: '1px solid rgba(255, 149, 0, 0.25)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#FF9500', fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pill size={18} /> Suplementación Recomendada ({supplements.length})
              </Typography>

              <Stack spacing={1.5}>
                {supplements.map((supp, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      bgcolor: '#1E1E24',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight={800} sx={{ color: '#ffffff' }}>
                            {supp.name}
                          </Typography>
                          {supp.timing && (
                            <Chip size="small" label={supp.timing} sx={{ bgcolor: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 700, fontSize: '0.72rem' }} />
                          )}
                          {supp.dosage && (
                            <Chip size="small" label={supp.dosage} sx={{ bgcolor: 'rgba(52, 199, 89, 0.15)', color: '#34C759', fontWeight: 700, fontSize: '0.72rem' }} />
                          )}
                        </Stack>
                        {supp.observations && (
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block', mt: 0.5 }}>
                            {supp.observations}
                          </Typography>
                        )}
                      </Box>

                      {supp.url && (
                        <a
                          href={supp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#007AFF',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <ExternalLink size={13} /> Enlace de compra
                        </a>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <DietMealChecklist diet={diet} userId={1} readOnly={true} />
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'rgba(22, 22, 26, 0.85)' }}>
          <Button
            onClick={onClose}
            sx={{
              borderRadius: '12px',
              color: '#ffffff',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {pdfModalOpen && (
        <DietVisualPdfModal
          open={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          diet={diet}
        />
      )}
    </>
  );
};

export default DietDetail;