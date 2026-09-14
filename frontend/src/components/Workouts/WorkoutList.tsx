import { useState } from 'react';
import {
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
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Dumbbell,
  Play,
  QrCode,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
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
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Cargando entrenamientos...</Typography>
      </Box>
    );
  }

  if (workouts.length === 0) {
    return (
      <Box
        className="apple-card"
        sx={{
          textAlign: 'center',
          py: 6,
          px: 3,
          maxWidth: 480,
          mx: 'auto',
          my: 4,
        }}
      >
        <Dumbbell size={48} color="rgba(255, 255, 255, 0.3)" style={{ marginBottom: 16 }} />
        <Typography variant="h6" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.5 }}>
          No hay entrenamientos
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          Prueba a cambiar el filtro de búsqueda o crea una nueva rutina.
        </Typography>
      </Box>
    );
  }

  const paginatedWorkouts = workouts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ pb: 8 }}>
      {/* Selector de Modo de Visualización (Grid vs Tabla) */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2.5 }}>
        <ToggleButtonGroup
          value={displayMode}
          exclusive
          onChange={(_, val) => val && setDisplayMode(val)}
          size="small"
          sx={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '0.5px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            p: '2px',
            '& .MuiToggleButton-root': {
              borderRadius: '8px',
              px: 1.2,
              py: 0.4,
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              '&.Mui-selected': {
                background: '#FFFFFF',
                color: '#000000',
                fontWeight: 700,
              },
            },
          }}
        >
          <ToggleButton value="grid">
            <LayoutGrid size={14} style={{ marginRight: 4 }} />
            Cuadrícula
          </ToggleButton>
          <ToggleButton value="table">
            <ListIcon size={14} style={{ marginRight: 4 }} />
            Tabla
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Renderizado Condicional */}
      {displayMode === 'grid' ? (
        <Grid container spacing={2.5}>
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
        <Box className="apple-card" sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Categoría</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Ejercicios</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWorkouts.map((workout) => (
                  <TableRow
                    key={workout.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' },
                      '& td': { borderBottom: '0.5px solid rgba(255, 255, 255, 0.04)' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#FFFFFF' }}>
                        {workout.name}
                      </Typography>
                      {workout.notes && (
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                          {workout.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        {getUserName(workout.user_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workout.category || 'General'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 22,
                          bgcolor: 'rgba(0, 122, 255, 0.15)',
                          color: '#007AFF',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<Dumbbell size={12} color="#FFFFFF" />}
                        label={workout.workout_exercises?.length || workout.exercises?.length || 0}
                        size="small"
                        sx={{ fontWeight: 600, height: 22, bgcolor: 'rgba(255, 255, 255, 0.06)', color: '#FFFFFF' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                        {onStartLiveWorkout && (
                          <Tooltip title="Iniciar">
                            <IconButton
                              size="small"
                              onClick={() => onStartLiveWorkout(workout)}
                              sx={{ color: '#34C759', bgcolor: 'rgba(52, 199, 89, 0.15)' }}
                            >
                              <Play size={14} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onShareQr && (
                          <Tooltip title="Compartir QR">
                            <IconButton
                              size="small"
                              onClick={() => onShareQr(workout)}
                              sx={{ color: '#FF9500' }}
                            >
                              <QrCode size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Ver">
                          <IconButton size="small" onClick={() => onViewDetails(workout)} sx={{ color: '#007AFF' }}>
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => onEdit(workout)} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            <Edit2 size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => onDelete(workout.id)} sx={{ color: '#FF3B30' }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Paginación */}
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
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            '& .MuiSvgIcon-root': { color: '#FFFFFF' }
          }}
        />
      </Box>
    </Box>
  );
};

export default WorkoutList;
