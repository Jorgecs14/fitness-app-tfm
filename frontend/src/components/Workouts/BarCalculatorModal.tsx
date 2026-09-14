import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Chip, Stack } from '@mui/material';
import { Iconify } from '../../utils/iconify';

interface BarCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  targetWeight?: number;
}

export const BarCalculatorModal: React.FC<BarCalculatorModalProps> = ({ open, onClose, targetWeight = 60 }) => {
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.92) 100%)',
          backdropFilter: 'blur(32px) saturate(210%)',
          WebkitBackdropFilter: 'blur(32px) saturate(210%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '24px',
          color: '#ffffff',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.25)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.2, color: '#ffffff' }}>
        <Iconify icon="solar:dumbbell-large-bold" width={24} sx={{ color: '#22d3ee' }} />
        Calculador de Discos (Por Lado)
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Peso Total Objetivo (kg)"
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            fullWidth
          />
          <TextField
            label="Peso de la Barra (kg)"
            type="number"
            value={barWeight}
            onChange={(e) => setBarWeight(Number(e.target.value))}
            fullWidth
          />

          <Box
            sx={{
              p: 2.5,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block', mb: 1.5, fontWeight: 700, letterSpacing: '0.04em' }}>
              DISCOS A CARGAR EN CADA EXTREMO:
            </Typography>

            {platesNeeded.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#f43f5e', fontWeight: 800 }}>
                Barra olímpica sola ({barWeight}kg) o peso objetivo menor.
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" gap={1}>
                {platesNeeded.map((p, idx) => (
                  <Chip
                    key={idx}
                    label={`${p} kg`}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      py: 2.2,
                      px: 1.2,
                      background: 'rgba(6, 182, 212, 0.2)',
                      color: '#22d3ee',
                      border: '1px solid rgba(34, 211, 238, 0.45)',
                      borderRadius: '9999px',
                      boxShadow: '0 0 14px rgba(6, 182, 212, 0.3)',
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button
          onClick={onClose}
          fullWidth
          variant="contained"
          sx={{
            py: 1.2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.95rem',
            boxShadow: '0 8px 20px rgba(6, 182, 212, 0.4)',
          }}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

