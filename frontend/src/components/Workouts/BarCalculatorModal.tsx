import React, { useState } from 'react';
import { Dialog, DialogContent, Typography, Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import { Dumbbell, X } from 'lucide-react';

interface BarCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  targetWeight?: number;
}

export const BarCalculatorModal: React.FC<BarCalculatorModalProps> = ({ open, onClose, targetWeight = 60 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [weight, setWeight] = useState<number>(targetWeight);
  const [barWeight, setBarWeight] = useState<number>(20); // Barra olímpica estándar 20kg

  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];

  const calculatePlates = () => {
    let remaining = (weight - barWeight) / 2;
    if (remaining <= 0) return [];

    const result: number[] = [];
    for (const plate of availablePlates) {
      while (remaining >= plate) {
        result.push(plate);
        remaining -= plate;
      }
    }
    return result;
  };

  const platesNeeded = calculatePlates();

  const getPlateColor = (plate: number) => {
    switch (plate) {
      case 25: return { bg: '#e02424', text: '#ffffff' }; // Rojo olímpico
      case 20: return { bg: '#1c64f2', text: '#ffffff' }; // Azul olímpico
      case 15: return { bg: '#e3a008', text: '#000000' }; // Amarillo olímpico
      case 10: return { bg: '#057a55', text: '#ffffff' }; // Verde olímpico
      case 5:  return { bg: '#ffffff', text: '#000000' }; // Blanco
      default: return { bg: '#4b5563', text: '#ffffff' };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        className: isMobile ? 'apple-sheet-paper' : 'apple-card',
        sx: {
          backgroundColor: '#1c1c1e !important',
          border: '0.5px solid rgba(255, 255, 255, 0.1) !important',
          p: 0,
          m: isMobile ? 0 : 2,
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 0 : 'auto',
          maxHeight: '90vh'
        }
      }}
    >
      {isMobile && <div className="apple-sheet-handle" />}

      <Box sx={{ p: 2.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Dumbbell size={20} color="#007aff" />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '17px', color: '#ffffff' }}>
            Calculador de Discos
          </Typography>
        </Box>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(120, 120, 128, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(235, 235, 245, 0.6)'
          }}
        >
          <X size={16} />
        </button>
      </Box>

      <DialogContent sx={{ px: 2.5, py: 1.5 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600 }}>
              Peso Objetivo Total (kg)
            </Typography>
            <input
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="fitness-input"
              placeholder="Ej: 80"
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600 }}>
              Peso de la Barra (kg)
            </Typography>
            <input
              type="number"
              value={barWeight || ''}
              onChange={(e) => setBarWeight(Number(e.target.value))}
              className="fitness-input"
              placeholder="20"
            />
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: 'rgba(120, 120, 128, 0.16)',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center'
            }}
          >
            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, mb: 1.2 }}>
              DISCOS POR LADO:
            </Typography>

            {platesNeeded.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#ff9500', fontWeight: 600 }}>
                {weight <= barWeight ? `Solo la barra vacía (${barWeight}kg)` : 'Introduce un peso mayor'}
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" gap={1}>
                {platesNeeded.map((p, idx) => {
                  const plateColor = getPlateColor(p);
                  return (
                    <Box
                      key={idx}
                      sx={{
                        backgroundColor: plateColor.bg,
                        color: plateColor.text,
                        fontWeight: 700,
                        fontSize: '13px',
                        py: 0.8,
                        px: 1.5,
                        borderRadius: 2,
                        minWidth: '42px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                      }}
                    >
                      {p} kg
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <Box sx={{ p: 2.5, pt: 1 }}>
        <button onClick={onClose} className="apple-btn-blue">
          Listo
        </button>
      </Box>
    </Dialog>
  );
};

export default BarCalculatorModal;
