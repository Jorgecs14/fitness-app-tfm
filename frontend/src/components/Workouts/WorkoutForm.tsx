// Modal de creación y edición de entrenamientos con estética Apple Inset Grouped
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  MenuItem,
  Box,
  Chip,
  Grid,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  X,
  Dumbbell,
  User as UserIcon,
  Plus,
  Trash2,
  Tag,
  FileText,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { Workout } from '../../types/Workout';
import { Exercise } from '../../types/Exercise';
import { User } from '../../types/User';
import { getExercises, createExercise } from '../../services/exerciseService';
import { SelectedExercise } from '../../types/WorkoutExercise';
import { WorkoutWithExercises } from '../../types/WorkoutWithExercises';

interface WorkoutFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    workout: Omit<Workout, 'id'>,
    exercises?: SelectedExercise[]
  ) => void;
  workoutToEdit?: WorkoutWithExercises | null;
  users: User[];
}

const CATEGORIES = [
  { label: 'Fuerza', color: '#FF3B30' },
  { label: 'Hipertrofia', color: '#007AFF' },
  { label: 'Cardio', color: '#FF9500' },
  { label: 'Movilidad', color: '#34C759' },
  { label: 'Resistencia', color: '#AF52DE' },
  { label: 'Funcional', color: '#5856D6' },
  { label: 'HIIT', color: '#FF2D55' },
];

export const WorkoutForm: React.FC<WorkoutFormProps> = ({
  open,
  onClose,
  onSubmit,
  workoutToEdit,
  users,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    user_id: '' as number | '',
    name: '',
    category: 'Hipertrofia',
    notes: '',
  });

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentSets, setCurrentSets] = useState('3');
  const [currentReps, setCurrentReps] = useState('10');
  const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    execution_time: '60',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (workoutToEdit) {
      setFormData({
        user_id: workoutToEdit.user_id,
        name: workoutToEdit.name,
        category: workoutToEdit.category || 'Hipertrofia',
        notes: workoutToEdit.notes || '',
      });

      if (workoutToEdit.exercises && Array.isArray(workoutToEdit.exercises)) {
        const initialExercises = workoutToEdit.exercises.map((ex) => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
        }));
        setSelectedExercises(initialExercises);
      } else if (workoutToEdit.workout_exercises && Array.isArray(workoutToEdit.workout_exercises)) {
        const initialExercises = workoutToEdit.workout_exercises.map((ex) => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
        }));
        setSelectedExercises(initialExercises);
      }
    } else {
      setFormData({
        user_id: users.length > 0 ? users[0].id : '',
        name: '',
        category: 'Hipertrofia',
        notes: '',
      });
      setSelectedExercises([]);
    }
    setErrors([]);
    setCurrentExercise('');
    setCurrentSets('3');
    setCurrentReps('10');
    setShowNewExerciseForm(false);
  }, [workoutToEdit, open, users]);

  const loadExercises = async () => {
    try {
      const data = await getExercises();
      setExercises(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch (error) {
      console.error('Error cargando ejercicios:', error);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    if (!formData.user_id) newErrors.push('Debes seleccionar un usuario asignado');
    if (!formData.name.trim()) newErrors.push('El nombre de la rutina es obligatorio');
    if (!formData.category.trim()) newErrors.push('La categoría es obligatoria');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleAddExercise = () => {
    if (!currentExercise || !currentSets || !currentReps) {
      setErrors(['Selecciona un ejercicio e indica series y repeticiones']);
      return;
    }

    const exerciseId = parseInt(currentExercise);
    if (selectedExercises.some((e) => e.exercise_id === exerciseId)) {
      setErrors(['Este ejercicio ya está añadido a la rutina']);
      return;
    }

    setSelectedExercises((prev) => [
      ...prev,
      {
        exercise_id: exerciseId,
        sets: parseInt(currentSets) || 3,
        reps: parseInt(currentReps) || 10,
      },
    ]);

    setCurrentExercise('');
    setErrors([]);
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises((prev) => prev.filter((e) => e.exercise_id !== exerciseId));
  };

  const handleCreateExercise = async () => {
    if (!newExercise.name.trim()) {
      setErrors(['El nombre del nuevo ejercicio es obligatorio']);
      return;
    }

    try {
      setIsCreatingExercise(true);
      const created = await createExercise({
        name: newExercise.name.trim(),
        description: newExercise.description.trim(),
        execution_time: parseInt(newExercise.execution_time) || 60,
      });

      await loadExercises();
      setCurrentExercise(created.id.toString());
      setNewExercise({ name: '', description: '', execution_time: '60' });
      setShowNewExerciseForm(false);
      setErrors([]);
    } catch (error) {
      console.error('Error al crear ejercicio:', error);
      setErrors(['No se pudo guardar el ejercicio']);
    } finally {
      setIsCreatingExercise(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit(
      {
        user_id: formData.user_id as number,
        name: formData.name.trim(),
        category: formData.category.trim(),
        notes: formData.notes.trim(),
      },
      selectedExercises
    );

    onClose();
  };

  const getExerciseName = (exerciseId: number) => {
    const found = exercises.find((e) => e.id === exerciseId);
    return found ? found.name : `Ejercicio #${exerciseId}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              {workoutToEdit ? 'Editar Rutina' : 'Nueva Rutina'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Configuración de entrenamiento y ejercicios asignados
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
          {errors.length > 0 && (
            <Alert
              severity="error"
              sx={{
                borderRadius: '14px',
                bgcolor: 'rgba(255, 59, 48, 0.15)',
                color: '#FF453A',
                border: '0.5px solid rgba(255, 59, 48, 0.3)',
              }}
            >
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Sección 1: Datos Principales Inset Grouped */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#1C1C1E',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tag size={16} color="#007AFF" /> Información de la Rutina
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                  Usuario Asignado *
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.user_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, user_id: Number(e.target.value) }))}
                  InputProps={{
                    sx: {
                      color: '#ffffff',
                      bgcolor: '#2C2C2E',
                      borderRadius: '12px',
                      fontSize: '16px',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    },
                  }}
                >
                  <MenuItem value="">Seleccionar usuario</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} {u.surname || ''} ({u.email})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                  Nombre de la Rutina *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Ej: Empuje e Hipertrofia A"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  InputProps={{
                    sx: {
                      color: '#ffffff',
                      bgcolor: '#2C2C2E',
                      borderRadius: '12px',
                      fontSize: '16px',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    },
                  }}
                />
              </Grid>

              {/* Selector de Categoría Apple Pills */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 1, display: 'block', fontWeight: 500 }}>
                  Categoría / Objetivo
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = formData.category.toLowerCase() === cat.label.toLowerCase();
                    return (
                      <Chip
                        key={cat.label}
                        label={cat.label}
                        onClick={() => setFormData((prev) => ({ ...prev, category: cat.label }))}
                        icon={isSelected ? <Check size={14} color="#ffffff" /> : undefined}
                        sx={{
                          bgcolor: isSelected ? cat.color : '#2C2C2E',
                          color: '#ffffff',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.8rem',
                          height: 32,
                          borderRadius: '16px',
                          border: isSelected ? 'none' : '0.5px solid rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            bgcolor: isSelected ? cat.color : '#3A3A3C',
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                  Pautas y Notas para el Alumno (Opcional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Instrucciones sobre descansos, RPE o tempos..."
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  InputProps={{
                    sx: {
                      color: '#ffffff',
                      bgcolor: '#2C2C2E',
                      borderRadius: '12px',
                      fontSize: '16px',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Sección 2: Ejercicios Asignados Inset Grouped */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#1C1C1E',
              border: '0.5px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Dumbbell size={16} color="#34C759" /> Ejercicios Asignados ({selectedExercises.length})
              </Typography>
            </Box>

            {selectedExercises.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#2C2C2E',
                  borderRadius: '14px',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  mb: 2.5,
                }}
              >
                <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.85rem' }}>
                  No has añadido ningún ejercicio aún. Utiliza el selector inferior para agregarlos.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1} sx={{ mb: 2.5 }}>
                {selectedExercises.map((item, idx) => (
                  <Box
                    key={`${item.exercise_id}-${idx}`}
                    sx={{
                      p: 1.5,
                      px: 2,
                      borderRadius: '14px',
                      bgcolor: '#2C2C2E',
                      border: '0.5px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff', lineHeight: 1.2 }} noWrap>
                        {getExerciseName(item.exercise_id)}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip
                          label={`${item.sets} series`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(0, 122, 255, 0.15)',
                            color: '#007AFF',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 20,
                          }}
                        />
                        <Chip
                          label={`${item.reps} reps`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(52, 199, 89, 0.15)',
                            color: '#34C759',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 20,
                          }}
                        />
                      </Stack>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => handleRemoveExercise(item.exercise_id)}
                      sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.15)' } }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Añadir Ejercicio rápido */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: '#2C2C2E',
                border: '0.5px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'rgba(235, 235, 245, 0.8)', mb: 1.5, display: 'block' }}>
                Agregar ejercicio a la rutina
              </Typography>

              <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={currentExercise}
                    onChange={(e) => setCurrentExercise(e.target.value)}
                    InputProps={{
                      sx: {
                        color: '#ffffff',
                        bgcolor: '#1C1C1E',
                        borderRadius: '10px',
                        fontSize: '16px',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                      },
                    }}
                  >
                    <MenuItem value="">Seleccionar ejercicio existente</MenuItem>
                    {exercises.map((ex) => (
                      <MenuItem key={ex.id} value={ex.id}>
                        {ex.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 6, sm: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Series"
                    value={currentSets}
                    onChange={(e) => setCurrentSets(e.target.value)}
                    inputProps={{ min: 1, max: 20 }}
                    InputProps={{
                      sx: {
                        color: '#ffffff',
                        bgcolor: '#1C1C1E',
                        borderRadius: '10px',
                        fontSize: '16px',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Reps"
                    value={currentReps}
                    onChange={(e) => setCurrentReps(e.target.value)}
                    inputProps={{ min: 1, max: 100 }}
                    InputProps={{
                      sx: {
                        color: '#ffffff',
                        bgcolor: '#1C1C1E',
                        borderRadius: '10px',
                        fontSize: '16px',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddExercise}
                    disabled={!currentExercise}
                    sx={{
                      bgcolor: '#007AFF',
                      color: '#ffffff',
                      borderRadius: '10px',
                      fontWeight: 600,
                      height: 40,
                      textTransform: 'none',
                      fontSize: '0.85rem',
                      '&:hover': { bgcolor: '#0062cc' },
                    }}
                  >
                    Añadir
                  </Button>
                </Grid>
              </Grid>

              {/* Botón para crear nuevo ejercicio si no existe */}
              <Box sx={{ mt: 1.5 }}>
                {!showNewExerciseForm ? (
                  <Button
                    size="small"
                    startIcon={<Plus size={14} />}
                    onClick={() => setShowNewExerciseForm(true)}
                    sx={{
                      color: '#007AFF',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      p: 0,
                    }}
                  >
                    ¿No encuentras el ejercicio? Créalo aquí
                  </Button>
                ) : (
                  <Collapse in={showNewExerciseForm}>
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: '#1C1C1E',
                        border: '0.5px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#ffffff', mb: 1, display: 'block' }}>
                        Nuevo Ejercicio Rápido
                      </Typography>
                      <Stack spacing={1.5}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Nombre del ejercicio (Ej: Sentadilla Búlgara)"
                          value={newExercise.name}
                          onChange={(e) => setNewExercise((p) => ({ ...p, name: e.target.value }))}
                          InputProps={{
                            sx: {
                              color: '#ffffff',
                              bgcolor: '#2C2C2E',
                              borderRadius: '8px',
                              fontSize: '16px',
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Descripción / Músculo principal"
                          value={newExercise.description}
                          onChange={(e) => setNewExercise((p) => ({ ...p, description: e.target.value }))}
                          InputProps={{
                            sx: {
                              color: '#ffffff',
                              bgcolor: '#2C2C2E',
                              borderRadius: '8px',
                              fontSize: '16px',
                            },
                          }}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleCreateExercise}
                            disabled={isCreatingExercise || !newExercise.name.trim()}
                            sx={{
                              bgcolor: '#34C759',
                              color: '#000000',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderRadius: '8px',
                              '&:hover': { bgcolor: '#2eb34f' },
                            }}
                          >
                            Guardar y Seleccionar
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setShowNewExerciseForm(false)}
                            sx={{ color: 'rgba(235, 235, 245, 0.6)', textTransform: 'none' }}
                          >
                            Cancelar
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Collapse>
                )}
              </Box>
            </Box>
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
          onClick={handleSubmit}
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
          {workoutToEdit ? 'Guardar Cambios' : 'Crear Rutina'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutForm;