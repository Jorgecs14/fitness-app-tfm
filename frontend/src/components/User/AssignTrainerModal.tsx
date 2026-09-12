import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { User } from '../../types/User';
import { getTrainers, assignTrainer } from '../../services/userService';

interface AssignTrainerModalProps {
  open: boolean;
  onClose: () => void;
  client: User | null;
  onUpdated: () => void;
}

export const AssignTrainerModal: React.FC<AssignTrainerModalProps> = ({
  open,
  onClose,
  client,
  onUpdated,
}) => {
  const [trainers, setTrainers] = useState<User[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadTrainers();
      if (client) {
        setSelectedTrainerId(client.trainer_id || '');
      }
    }
  }, [open, client]);

  const loadTrainers = async () => {
    try {
      const data = await getTrainers();
      setTrainers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      await assignTrainer(client.id, selectedTrainerId ? Number(selectedTrainerId) : null);
      setLoading(false);
      onClose();
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Error asignando entrenador');
      setLoading(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>🤝 Asignar Entrenador Personal</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Selecciona el Entrenador Personal responsable para el cliente <strong>{client.name} {client.surname}</strong>:
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            select
            label="Entrenador Personal"
            value={selectedTrainerId}
            onChange={(e) => setSelectedTrainerId(e.target.value as number | '')}
            fullWidth
          >
            <MenuItem value="">
              <em>Sin Entrenador Asignado (General)</em>
            </MenuItem>
            {trainers.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name} {t.surname} ({t.email})
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Asignación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
