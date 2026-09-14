// Gestor de ejercicios por rutina con diseño híbrido Apple Inset (Cards en móvil, Table en desktop)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Stack,
  Autocomplete,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dumbbell,
  Plus,
  Trash2,
  X,
  Clock,
  Flame,
  Check,
  Timer,
  Weight,
  Layers,
  Repeat,
} from 'lucide-react';
import { Exercise } from '../../types/Exercise';
import { WorkoutExerciseDetail } from '../../types/WorkoutExercise';
import * as exerciseService from '../../services/exerciseService';

interface WorkoutExercisesManagerProps {
  workoutName: string;
  exercises: WorkoutExerciseDetail[];
  open: boolean;
  onClose: () => void;
  onSave: (exercises: WorkoutExerciseDetail[]) => void;
}

interface SelectedExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  rest_time?: number;
  notes?: string;
}

export const WorkoutExercisesManager: React.FC<WorkoutExercisesManagerProps> = ({
  workoutName,
  exercises,
  open,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    sets: 3,
    reps: 10,
    weight: 0,
    duration: 0,
    rest_time: 60,
    notes: '',
  });

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (open) {
      const convertedExercises: SelectedExercise[] = exercises.map((ex) => ({
        exercise: {
          id: ex.exercise_id,
          name: ex.name,
          description: ex.description,
          executionTime: ex.execution_time,
        },
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        notes: '',
      }));
      setSelectedExercises(convertedExercises);
    }
  }, [open, exercises]);

  const loadExercises = async () => {
    try {
      const data = await exerciseService.getExercises();
      setAvailableExercises(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const handleAddExercise = () => {
    if (!selectedExercise) return;

    const newExercise: SelectedExercise = {
      exercise: selectedExercise,
      sets: exerciseForm.sets || 3,
      reps: exerciseForm.reps || 10,
      weight: exerciseForm.weight || undefined,
      duration: exerciseForm.duration || undefined,
      rest_time: exerciseForm.rest_time || undefined,
      notes: exerciseForm.notes || undefined,
    };

    setSelectedExercises([...selectedExercises, newExercise]);
    setSelectedExercise(null);
    setExerciseForm({
      sets: 3,
      reps: 10,
      weight: 0,
      duration: 0,
      rest_time: 60,
      notes: '',
    });
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index: number, field: keyof SelectedExercise, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handleSave = () => {
    const convertedExercises: WorkoutExerciseDetail[] = selectedExercises.map((ex) => ({
      link_id: 0,
      exercise_id: ex.exercise.id,
      sets: ex.sets,
      reps: ex.reps,
      name: ex.exercise.name,
      description: ex.exercise.description,
      execution_time: ex.exercise.executionTime || 0,
    }));

    onSave(convertedExercises);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#000000',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          maxHeight: { xs: '100%', sm: '92vh' },
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
            <Dumbbell size={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }} noWrap>
              {workoutName || 'Gestionar Ejercicios'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Series, repeticiones y cargas de la rutina
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
        <Stack spacing={3}>
          {/* Card Inset para Agregar Ejercicio */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#1C1C1E',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Plus size={16} color="#007AFF" /> Añadir Ejercicio a la Lista
            </Typography>

            <Grid container spacing={1.5} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete
                  options={availableExercises}
                  getOptionLabel={(option) => option.name}
                  value={selectedExercise}
                  onChange={(_, value) => setSelectedExercise(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Buscar ejercicio..."
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
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Series"
                  value={exerciseForm.sets}
                  onChange={(e) => setExerciseForm((p) => ({ ...p, sets: parseInt(e.target.value) || 0 }))}
                  inputProps={{ min: 1, max: 50 }}
                  InputProps={{
                    sx: {
                      color: '#ffffff',
                      bgcolor: '#2C2C2E',
                      borderRadius: '12px',
                      fontSize: '16px',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    },
                  }}
                  InputLabelProps={{ sx: { color: 'rgba(235, 235, 245, 0.6)' } }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Reps"
                  value={exerciseForm.reps}
                  onChange={(e) => setExerciseForm((p) => ({ ...p, reps: parseInt(e.target.value) || 0 }))}
                  inputProps={{ min: 1, max: 100 }}
                  InputProps={{
                    sx: {
                      color: '#ffffff',
                      bgcolor: '#2C2C2E',
                      borderRadius: '12px',
                      fontSize: '16px',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    },
                  }}
                  InputLabelProps={{ sx: { color: 'rgba(235, 235, 245, 0.6)' } }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Peso (kg)"
                  value={exerciseForm.weight || ''}
                  placeholder="0"
                  onChange={(e) => setExerciseForm((p) => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
                  inputProps={{ min: 0, step: 0.5 }}
                  InputProps={{
                    sx: {
                      color: '#ffffff',
                      bgcolor: '#2C2C2E',
                      borderRadius: '12px',
                      fontSize: '16px',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    },
                  }}
                  InputLabelProps={{ sx: { color: 'rgba(235, 235, 245, 0.6)' } }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddExercise}
                  disabled={!selectedExercise}
                  startIcon={<Plus size={16} />}
                  sx={{
                    height: 52,
                    bgcolor: '#007AFF',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': { bgcolor: '#0062cc' },
                    '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.2)' },
                  }}
                >
                  Añadir
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Listado de Ejercicios */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Layers size={16} color="#34C759" /> Ejercicios Configurados ({selectedExercises.length})
            </Typography>

            {selectedExercises.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#1C1C1E',
                  borderRadius: '20px',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                }}
              >
                <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  No hay ejercicios en esta rutina todavía. Selecciona uno arriba para comenzar.
                </Typography>
              </Box>
            ) : isMobile ? (
              /* Vista Móvil: Apple Inset Cards */
              <Stack spacing={1.5}>
                {selectedExercises.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      bgcolor: '#1C1C1E',
                      border: '0.5px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                          {item.exercise.name}
                        </Typography>
                        {item.exercise.description && (
                          <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)', display: 'block', mt: 0.25 }} noWrap>
                            {item.exercise.description}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveExercise(index)}
                        sx={{ color: '#FF453A', bgcolor: 'rgba(255, 69, 58, 0.1)', '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.2)' } }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>

                    {/* Inputs táctiles en Grid */}
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 4 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.7rem' }}>
                          Series
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={item.sets}
                          onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                          InputProps={{
                            sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '10px', fontSize: '16px' },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 4 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.7rem' }}>
                          Reps
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={item.reps}
                          onChange={(e) => handleUpdateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                          InputProps={{
                            sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '10px', fontSize: '16px' },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 4 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.7rem' }}>
                          Peso (kg)
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="0"
                          value={item.weight || ''}
                          onChange={(e) => handleUpdateExercise(index, 'weight', parseFloat(e.target.value) || undefined)}
                          InputProps={{
                            sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '10px', fontSize: '16px' },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            ) : (
              /* Vista Desktop: Tabla Inset Liquid Glass */
              <TableContainer
                sx={{
                  borderRadius: '20px',
                  bgcolor: '#1C1C1E',
                  border: '0.5px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
                        Ejercicio
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, borderBottomColor: 'rgba(255, 255, 255, 0.08)', width: 100 }}>
                        Series
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, borderBottomColor: 'rgba(255, 255, 255, 0.08)', width: 100 }}>
                        Reps
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, borderBottomColor: 'rgba(255, 255, 255, 0.08)', width: 110 }}>
                        Peso (kg)
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, borderBottomColor: 'rgba(255, 255, 255, 0.08)', width: 80 }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedExercises.map((item, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                        <TableCell sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.06)' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                            {item.exercise.name}
                          </Typography>
                          {item.exercise.description && (
                            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                              {item.exercise.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.06)' }}>
                          <TextField
                            size="small"
                            type="number"
                            value={item.sets}
                            onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                            InputProps={{
                              sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '8px', fontSize: '15px' },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.06)' }}>
                          <TextField
                            size="small"
                            type="number"
                            value={item.reps}
                            onChange={(e) => handleUpdateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                            InputProps={{
                              sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '8px', fontSize: '15px' },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.06)' }}>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="kg"
                            value={item.weight || ''}
                            onChange={(e) => handleUpdateExercise(index, 'weight', parseFloat(e.target.value) || undefined)}
                            InputProps={{
                              sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '8px', fontSize: '15px' },
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.06)' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExercise(index)}
                            sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.15)' } }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Stack>
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
          onClick={handleSave}
          variant="contained"
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
          Guardar Configuración
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutExercisesManager;
