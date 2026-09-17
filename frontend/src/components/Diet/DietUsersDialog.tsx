// Modal de asignación de usuarios a una dieta con diseño Apple Liquid Glass
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
  IconButton,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Users,
  UserPlus,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { Diet } from '../../types/Diet';
import * as dietService from '../../services/dietService';
import * as userService from '../../services/userService';

interface DietUsersDialogProps {
  open: boolean;
  diet: Diet | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const DietUsersDialog: React.FC<DietUsersDialogProps> = ({
  open,
  diet,
  onClose,
  onUpdate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && diet) {
      loadData();
    }
  }, [open, diet]);

  const loadData = async () => {
    if (!diet) return;
    setLoading(true);

    try {
      const [assigned, loggedInUser] = await Promise.all([
        dietService.getDietUsers(diet.id),
        userService.getCurrentUser(),
      ]);

      let all: any[] = [];
      if (loggedInUser && (loggedInUser.role === 'trainer' || loggedInUser.role === 'entrenador')) {
        all = await userService.getTrainerClients(loggedInUser.id);
      } else {
        all = await userService.getUsers();
      }

      setAssignedUsers(Array.isArray(assigned) ? assigned : []);
      setAllUsers(Array.isArray(all) ? all : (all as any)?.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (!diet || !selectedUser) return;
    setIsSubmitting(true);

    try {
      await dietService.assignUserToDiet(diet.id, selectedUser.id);
      setSelectedUser(null);
      await loadData();
      onUpdate();
    } catch (error: any) {
      alert(`Error al asignar usuario: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!diet) return;
    try {
      await dietService.removeUserFromDiet(diet.id, userId);
      await loadData();
      onUpdate();
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const availableUsers = allUsers.filter(
    (u) => !assignedUsers.some((assigned) => assigned.id === u.id)
  );

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
            <Users size={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }} noWrap>
              Alumnos Asignados
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              {diet?.name}
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#34C759' }} />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* Asignar nuevo alumno Inset Grouped */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, mb: 1, display: 'block' }}>
                Asignar a un Alumno
              </Typography>
              <Autocomplete
                value={selectedUser}
                onChange={(_, newValue) => setSelectedUser(newValue)}
                options={availableUsers}
                getOptionLabel={(option) => `${option.name} ${option.surname || ''} (${option.email})`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Buscar alumno..."
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

              <Button
                variant="contained"
                onClick={handleAssignUser}
                disabled={!selectedUser || isSubmitting}
                startIcon={<UserPlus size={16} />}
                sx={{
                  mt: 1.5,
                  height: 44,
                  bgcolor: '#34C759',
                  color: '#000000',
                  fontWeight: 700,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { bgcolor: '#2eb34f' },
                  '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.2)' },
                }}
                fullWidth
              >
                Asignar Plan
              </Button>
            </Box>

            {/* Listado de Alumnos con esta dieta */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 1.5 }}>
                Alumnos Siguiendo esta Dieta ({assignedUsers.length})
              </Typography>

              {assignedUsers.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.5)', py: 2, textAlign: 'center' }}>
                  No hay alumnos asignados a esta pauta nutricional.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {assignedUsers.map((user) => (
                    <Box
                      key={user.id}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: '#2C2C2E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }} noWrap>
                          {user.name} {user.surname || ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)' }} noWrap>
                          {user.email}
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => handleRemoveUser(user.id)}
                        sx={{ color: '#FF453A', bgcolor: 'rgba(255, 69, 58, 0.1)', '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.2)' } }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
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
        }}
      >
        <Button
          fullWidth
          onClick={onClose}
          sx={{
            height: 44,
            borderRadius: '12px',
            bgcolor: '#007AFF',
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: '#0062cc' },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DietUsersDialog;