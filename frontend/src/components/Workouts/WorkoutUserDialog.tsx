// Modal para transferir o cambiar el usuario asignado a una rutina (Apple Liquid Glass)
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  UserCheck,
  User,
  ArrowRightLeft,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { Workout } from '../../types/Workout';
import * as workoutService from '../../services/workoutService';
import * as userService from '../../services/userService';

interface WorkoutUserDialogProps {
  open: boolean;
  workout: Workout | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const WorkoutUserDialog: React.FC<WorkoutUserDialogProps> = ({
  open,
  workout,
  onClose,
  onUpdate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && workout) {
      loadData();
    }
  }, [open, workout]);

  const loadData = async () => {
    if (!workout) return;
    setLoading(true);

    try {
      const [current, all] = await Promise.all([
        workoutService.getWorkoutUser(workout.id),
        userService.getUsers(),
      ]);

      setCurrentUser(current);
      setAllUsers(Array.isArray(all) ? all : (all as any)?.data || []);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOwner = async () => {
    if (!workout || !selectedUser) return;
    setIsSubmitting(true);

    try {
      await workoutService.changeWorkoutOwner(workout.id, selectedUser.id);
      await loadData();
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(`Error al cambiar propietario: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOwner = async () => {
    if (!workout) return;

    const confirm = window.confirm(
      '¿Estás seguro de que deseas desasignar el usuario? La rutina quedará sin asignar.'
    );
    if (!confirm) return;
    setIsSubmitting(true);

    try {
      await workoutService.removeWorkoutOwner(workout.id);
      await loadData();
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(`Error al desasignar: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableUsers = allUsers.filter((u) => u.id !== currentUser?.id);

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
              bgcolor: 'rgba(0, 122, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#007AFF',
              border: '0.5px solid rgba(0, 122, 255, 0.3)',
            }}
          >
            <UserCheck size={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }} noWrap>
              Asignación: {workout?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Transferir o reasignar alumno
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#007AFF' }} />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <Alert
              severity="info"
              icon={<AlertCircle size={18} color="#007AFF" />}
              sx={{
                borderRadius: '14px',
                bgcolor: 'rgba(0, 122, 255, 0.12)',
                color: '#ffffff',
                border: '0.5px solid rgba(0, 122, 255, 0.3)',
                '& .MuiAlert-message': { fontSize: '0.82rem' },
              }}
            >
              Transferir la rutina traspasará todas sus series, repeticiones y configuraciones al nuevo alumno seleccionado.
            </Alert>

            {/* Usuario Actual */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, mb: 1, display: 'block' }}>
                Alumno Actual
              </Typography>
              {currentUser ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0, 122, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#007AFF',
                        fontWeight: 700,
                      }}
                    >
                      {currentUser.name?.charAt(0) || 'U'}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                        {currentUser.name} {currentUser.surname || ''}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                        {currentUser.email}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    label="Asignado"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(52, 199, 89, 0.15)',
                      color: '#34C759',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.5)', fontStyle: 'italic' }}>
                  Sin alumno asignado actualmente
                </Typography>
              )}
            </Box>

            {/* Reasignar Usuario */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, mb: 1, display: 'block' }}>
                Seleccionar Nuevo Alumno
              </Typography>
              <Autocomplete
                value={selectedUser}
                onChange={(_, newValue) => setSelectedUser(newValue)}
                options={availableUsers}
                getOptionLabel={(option) => `${option.name} ${option.surname || ''} (${option.email})`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Buscar por nombre o email..."
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        color: '#ffffff',
                        bgcolor: '#2C2C2E',
                        borderRadius: '12px',
                        fontSize: '16px',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                      },
                    }}
                  />
                )}
                noOptionsText="No hay otros usuarios disponibles"
              />
            </Box>
          </Stack>
        )}
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
        {currentUser && (
          <Button
            onClick={handleRemoveOwner}
            disabled={isSubmitting}
            startIcon={<Trash2 size={16} />}
            sx={{
              flex: 1,
              height: 44,
              borderRadius: '12px',
              color: '#FF453A',
              bgcolor: 'rgba(255, 59, 48, 0.12)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: 'rgba(255, 59, 48, 0.2)' },
            }}
          >
            Desasignar
          </Button>
        )}

        <Button
          onClick={handleChangeOwner}
          disabled={!selectedUser || isSubmitting}
          variant="contained"
          startIcon={<ArrowRightLeft size={16} />}
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
          Transferir Rutina
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutUserDialog;
