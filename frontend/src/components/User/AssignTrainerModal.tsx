// Modal para asignar entrenador personal a un cliente con estética Apple Liquid Glass
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Stack,
  Alert,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Users,
  Dumbbell,
  X,
  Check,
} from 'lucide-react';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      setTrainers(Array.isArray(data) ? data : (data as any)?.data || []);
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#000000',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          maxHeight: { xs: '100%', sm: '80vh' },
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
            <Dumbbell size={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }} noWrap>
              Asignar Entrenador
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }} noWrap>
              {client.name} {client.surname || ''}
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

      {/* Contenido */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#000000', overflowY: 'auto' }}>
        <Stack spacing={2.5}>
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: '14px',
                bgcolor: 'rgba(255, 59, 48, 0.15)',
                color: '#FF453A',
                border: '0.5px solid rgba(255, 59, 48, 0.3)',
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#1C1C1E',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, mb: 1, display: 'block' }}>
              Entrenador Responsable
            </Typography>
            <TextField
              select
              fullWidth
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value as number | '')}
              InputProps={{
                sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
              }}
            >
              <MenuItem value="">
                <em>Sin Entrenador Asignado (General)</em>
              </MenuItem>
              {trainers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} {t.surname || ''} ({t.email})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>
      </DialogContent>

      {/* Footer */}
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
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{
            flex: 2,
            height: 44,
            borderRadius: '12px',
            bgcolor: '#007AFF',
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
            '&:hover': { bgcolor: '#0062cc' },
          }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTrainerModal;
