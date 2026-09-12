import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField, Alert, IconButton, Tooltip, Stack } from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { WorkoutWithExercises } from '../../types/WorkoutWithExercises';

interface QrShareModalProps {
  open: boolean;
  onClose: () => void;
  workout: WorkoutWithExercises | null;
}

export const QrShareModal: React.FC<QrShareModalProps> = ({ open, onClose, workout }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!workout) return null;

  // Generar objeto JSON compacto para compartir la rutina
  const sharePayload = JSON.stringify({
    n: workout.name,
    c: workout.category,
    ex: workout.exercises?.map((e) => ({
      name: e.name,
      sets: e.sets,
      reps: e.reps,
    })),
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sharePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(sharePayload)}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>📱 Compartir Rutina por QR / Código</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Escanea este código QR desde la app para transferir la rutina <strong>"{workout.name}"</strong> a tu alumno.
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <img src={qrImageUrl} alt="Código QR de la Rutina" style={{ width: 220, height: 220, display: 'block' }} />
          </Box>

          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" color="text.secondary">
              O copia el código JSON compacto:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <TextField value={sharePayload} size="small" fullWidth readOnly inputProps={{ style: { fontSize: '0.8rem' } }} />
              <Tooltip title={copied ? '¡Copiado!' : 'Copiar al portapapeles'}>
                <IconButton color="primary" onClick={handleCopyCode}>
                  <Iconify icon={copied ? 'eva:checkmark-fill' : 'eva:copy-fill'} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {copied && <Alert severity="success">¡Código copiado al portapapeles!</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};
