import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Chip, Stack } from '@mui/material';

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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>🏋️ Calculador de Discos por Lado</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
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

          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Discos a cargar en CADA LADO de la barra:
            </Typography>

            {platesNeeded.length === 0 ? (
              <Typography variant="body2" color="error.main" fontWeight="bold">
                Solo la barra vacía ({barWeight}kg) o peso menor.
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" gap={1}>
                {platesNeeded.map((p, idx) => (
                  <Chip
                    key={idx}
                    label={`${p} kg`}
                    color="primary"
                    sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2, px: 1 }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Entendido</Button>
      </DialogActions>
    </Dialog>
  );
};
