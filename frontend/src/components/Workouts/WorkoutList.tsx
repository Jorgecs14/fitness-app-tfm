import { useState } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TableContainer,
  Box,
  Chip,
  IconButton,
  TablePagination,
  Grid,
  Stack,
  Button,
  Tooltip,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { WorkoutWithExercises } from '../../types/WorkoutWithExercises';
import { User } from '../../types/User';
import { WorkoutCard } from './WorkoutCard';

interface WorkoutListProps {
  workouts: WorkoutWithExercises[];
  users: User[];
  onEdit: (workout: WorkoutWithExercises) => void;
  onDelete: (id: number) => void;
  onViewDetails: (workout: WorkoutWithExercises) => void;
  onManageExercises: (workout: WorkoutWithExercises) => void;
  onManageUser: (workout: WorkoutWithExercises) => void;
  onStartLiveWorkout?: (workout: WorkoutWithExercises) => void;
  onShareQr?: (workout: WorkoutWithExercises) => void;
  loading?: boolean;
}

export const WorkoutList = ({ 
  workouts, 
  users,
  onEdit, 
  onDelete, 
  onViewDetails, 
  onManageExercises, 
  onManageUser,
  onStartLiveWorkout,
  onShareQr,
  loading 
}: WorkoutListProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');

  // Function to get user name by ID
  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} ${user.surname}` : `Usuario #${userId}`;
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Cargando entrenamientos...</Typography>
      </Box>
    );
  }

  if (workouts.length === 0) {
    return (
      <Box
        className="liquid-glass-card"
        sx={{
          textAlign: 'center',
          py: 8,
          px: 3,
          maxWidth: 500,
          mx: 'auto',
          my: 4,
        }}
      >
        <Iconify icon="solar:dumbbell-large-minimalistic-broken" width={54} height={54} sx={{ color: '#94a3b8', mb: 2 }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1 }}>
          No hay entrenamientos que coincidan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prueba a cambiar el término de búsqueda o añade una nueva rutina haciendo clic en "Nuevo Entrenamiento".
        </Typography>
      </Box>
    );
  }

  const paginatedWorkouts = workouts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Selector de Modo de Visualización (Grid vs Tabla) */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2.5 }}>
        <Box
          sx={{
            display: 'inline-flex',
            bgcolor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '9999px',
            p: 0.5,
          }}
        >
          <Tooltip title="Vista en Cuadrícula">
            <IconButton
              size="small"
              onClick={() => setDisplayMode('grid')}
              sx={{
                bgcolor: displayMode === 'grid' ? '#0f172a' : 'transparent',
                color: displayMode === 'grid' ? '#ffffff' : '#64748b',
                '&:hover': {
                  bgcolor: displayMode === 'grid' ? '#0f172a' : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              <Iconify icon="solar:widget-2-bold" width={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Vista en Tabla">
            <IconButton
              size="small"
              onClick={() => setDisplayMode('table')}
              sx={{
                bgcolor: displayMode === 'table' ? '#0f172a' : 'transparent',
                color: displayMode === 'table' ? '#ffffff' : '#64748b',
                '&:hover': {
                  bgcolor: displayMode === 'table' ? '#0f172a' : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              <Iconify icon="solar:list-bold" width={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Renderizado Condicional: Cuadrícula Liquid Glass o Tabla */}
      {displayMode === 'grid' ? (
        <Grid container spacing={3}>
          {paginatedWorkouts.map((workout) => (
            <Grid key={workout.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <WorkoutCard
                workout={workout}
                userName={getUserName(workout.user_id)}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
                onManageExercises={onManageExercises}
                onManageUser={onManageUser}
                onStartLiveWorkout={onStartLiveWorkout}
                onShareQr={onShareQr}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card className="liquid-glass-card" sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(241, 245, 249, 0.6)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Categoría</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Ejercicios</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWorkouts.map((workout) => (
                  <TableRow key={workout.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.6)' } }}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a' }}>
                        {workout.name}
                      </Typography>
                      {workout.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {workout.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        {getUserName(workout.user_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workout.category}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: '9999px',
                          bgcolor: 'rgba(2, 132, 199, 0.1)',
                          color: '#0284c7',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<Iconify icon="solar:dumbbell-bold" width={14} />}
                        label={workout.workout_exercises?.length || workout.exercises?.length || 0}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: '9999px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                        {onStartLiveWorkout && (
                          <Tooltip title="Iniciar en Vivo">
                            <IconButton
                              size="small"
                              onClick={() => onStartLiveWorkout(workout)}
                              sx={{ color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)' }}
                            >
                              <Iconify icon="solar:play-circle-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onShareQr && (
                          <Tooltip title="Compartir QR">
                            <IconButton
                              size="small"
                              onClick={() => onShareQr(workout)}
                              sx={{ color: '#f59e0b' }}
                            >
                              <Iconify icon="eva:qr-code-fill" width={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" onClick={() => onViewDetails(workout)} sx={{ color: '#0284c7' }}>
                            <Iconify icon="solar:eye-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => onEdit(workout)} sx={{ color: '#475569' }}>
                            <Iconify icon="solar:pen-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => onDelete(workout.id)} sx={{ color: '#ef4444' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Paginación Liquid Glass */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <TablePagination
          component="div"
          count={workouts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[6, 9, 18, 36]}
          labelRowsPerPage="Por página:"
          sx={{
            bgcolor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        />
      </Box>
    </Box>
  );
};


