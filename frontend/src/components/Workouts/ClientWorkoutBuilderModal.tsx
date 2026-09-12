import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  InputAdornment,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { getExercises, getExerciseCategories, ExerciseQueryParams } from '../../services/exerciseService';
import { createWorkout, addExercisesToWorkout } from '../../services/workoutService';
import { Exercise } from '../../types/Exercise';

interface ClientWorkoutBuilderModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  onSuccess: () => void;
}

interface RoutineItem {
  exercise_id: number;
  name: string;
  body_part?: string;
  equipment?: string;
  sets: number;
  reps: number;
}

// Plantillas prediseñadas estilo OpenGym
const STARTER_TEMPLATES = [
  {
    title: '💪 Empuje (Push Day)',
    category: 'Hipertrofia',
    notes: 'Enfocada en pectoral, deltoides anterior y tríceps.',
    exercises: [
      { name: 'Barbell Bench Press', body_part: 'chest', equipment: 'barbell', sets: 4, reps: 8 },
      { name: 'Dumbbell Incline Bench Press', body_part: 'chest', equipment: 'dumbbell', sets: 3, reps: 10 },
      { name: 'Dumbbell Shoulder Press', body_part: 'shoulders', equipment: 'dumbbell', sets: 3, reps: 10 },
      { name: 'Cable Triceps Pushdown', body_part: 'arms', equipment: 'cable', sets: 3, reps: 12 },
    ],
  },
  {
    title: '🧗 Tirón (Pull Day)',
    category: 'Hipertrofia',
    notes: 'Enfocada en dorsal, deltoides posterior, trapecios y bíceps.',
    exercises: [
      { name: 'Cable Lat Pulldown', body_part: 'back', equipment: 'cable', sets: 4, reps: 10 },
      { name: 'Barbell Bent Over Row', body_part: 'back', equipment: 'barbell', sets: 4, reps: 8 },
      { name: 'Cable Face Pull', body_part: 'shoulders', equipment: 'cable', sets: 3, reps: 15 },
      { name: 'Barbell Biceps Curl', body_part: 'arms', equipment: 'barbell', sets: 3, reps: 10 },
    ],
  },
  {
    title: '🦵 Piernas y Core (Leg Day)',
    category: 'Fuerza',
    notes: 'Enfocada en cuádriceps, isquios, glúteos y pantorrillas.',
    exercises: [
      { name: 'Barbell Full Squat', body_part: 'legs', equipment: 'barbell', sets: 4, reps: 8 },
      { name: 'Barbell Romanian Deadlift', body_part: 'legs', equipment: 'barbell', sets: 4, reps: 10 },
      { name: 'Leg Press', body_part: 'legs', equipment: 'machine', sets: 3, reps: 12 },
      { name: 'Standing Calf Raises', body_part: 'calves', equipment: 'bodyweight', sets: 4, reps: 15 },
    ],
  },
  {
    title: '⚡ Full Body 3 Días',
    category: 'Acondicionamiento',
    notes: 'Rutina integral de cuerpo completo para fuerza y salud metabólica.',
    exercises: [
      { name: 'Barbell Full Squat', body_part: 'legs', equipment: 'barbell', sets: 3, reps: 8 },
      { name: 'Barbell Bench Press', body_part: 'chest', equipment: 'barbell', sets: 3, reps: 8 },
      { name: 'Cable Lat Pulldown', body_part: 'back', equipment: 'cable', sets: 3, reps: 10 },
      { name: 'Dumbbell Shoulder Press', body_part: 'shoulders', equipment: 'dumbbell', sets: 3, reps: 10 },
    ],
  },
];

export const ClientWorkoutBuilderModal: React.FC<ClientWorkoutBuilderModalProps> = ({
  open,
  onClose,
  userId,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = Crear personalizado, 1 = Plantillas
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Hipertrofia');
  const [notes, setNotes] = useState<string>('');
  const [selectedExercises, setSelectedExercises] = useState<RoutineItem[]>([]);

  // Búsqueda de ejercicios
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<{ bodyParts: string[]; equipments: string[] }>({
    bodyParts: [],
    equipments: [],
  });
  const [loadingExercises, setLoadingExercises] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar categorías y ejercicios iniciales
  useEffect(() => {
    if (!open) return;
    loadCategories();
    fetchExercises();
  }, [open]);

  // Buscar ejercicios al cambiar filtros
  useEffect(() => {
    if (!open) return;
    const delayDebounce = setTimeout(() => {
      fetchExercises();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedBodyPart, selectedEquipment]);

  const loadCategories = async () => {
    try {
      const data = await getExerciseCategories();
      setCategories({
        bodyParts: data.bodyParts || [],
        equipments: data.equipments || [],
      });
    } catch (e) {
      console.log('Error cargando categorías:', e);
    }
  };

  const fetchExercises = async () => {
    setLoadingExercises(true);
    try {
      const params: ExerciseQueryParams = {
        limit: 25,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedBodyPart) params.body_part = selectedBodyPart;
      if (selectedEquipment) params.equipment = selectedEquipment;

      const res = await getExercises(params);
      const list = Array.isArray(res) ? res : res.data || [];
      setAvailableExercises(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleAddExercise = (ex: Exercise) => {
    if (selectedExercises.some((item) => item.exercise_id === ex.id)) return;
    setSelectedExercises((prev) => [
      ...prev,
      {
        exercise_id: ex.id,
        name: ex.name,
        body_part: ex.body_part,
        equipment: ex.equipment,
        sets: 3,
        reps: 10,
      },
    ]);
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises((prev) => prev.filter((item) => item.exercise_id !== exerciseId));
  };

  const handleUpdateItem = (exerciseId: number, field: 'sets' | 'reps', value: number) => {
    setSelectedExercises((prev) =>
      prev.map((item) => (item.exercise_id === exerciseId ? { ...item, [field]: Math.max(1, value) } : item))
    );
  };

  // Cargar una plantilla prediseñada
  const handleSelectTemplate = async (template: (typeof STARTER_TEMPLATES)[0]) => {
    setName(template.title.replace(/^[^\w\s]+/, '').trim());
    setCategory(template.category);
    setNotes(template.notes);

    try {
      setLoadingExercises(true);
      // Buscar los IDs reales en la base de datos para cada ejercicio de la plantilla
      const loadedItems: RoutineItem[] = [];
      for (const tEx of template.exercises) {
        const res = await getExercises({ search: tEx.name, limit: 1 });
        const list = Array.isArray(res) ? res : res.data || [];
        if (list.length > 0) {
          loadedItems.push({
            exercise_id: list[0].id,
            name: list[0].name,
            body_part: list[0].body_part,
            equipment: list[0].equipment,
            sets: tEx.sets,
            reps: tEx.reps,
          });
        }
      }
      setSelectedExercises(loadedItems);
      setActiveTab(0); // Cambiar a la pestaña de edición para que el usuario pueda afinarla
    } catch (e) {
      console.error('Error cargando plantilla:', e);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleSaveRoutine = async () => {
    if (!name.trim()) {
      setErrorMsg('Por favor, ingresa un nombre para la rutina.');
      return;
    }
    if (selectedExercises.length === 0) {
      setErrorMsg('Debes añadir al menos 1 ejercicio a la rutina.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Crear el workout en la base de datos
      const newWorkout = await createWorkout({
        user_id: userId,
        name: name.trim(),
        category,
        notes: notes.trim(),
      });

      // 2. Asociar los ejercicios seleccionados
      const exercisesPayload = selectedExercises.map((item) => ({
        exercise_id: item.exercise_id,
        sets: item.sets,
        reps: item.reps,
      }));

      await addExercisesToWorkout(newWorkout.id, exercisesPayload);

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al guardar la rutina.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="bold">
          🛠️ Creador de Rutinas Personalizadas
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 3 }}>
          <Tab icon={<Iconify icon="solar:pen-new-square-bold" />} label="Diseñar Mi Rutina" />
          <Tab icon={<Iconify icon="solar:magic-stick-3-bold" />} label="Plantillas Rápidas (OpenGym)" />
        </Tabs>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {activeTab === 0 ? (
          /* Pestaña: Diseñar Rutina */
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="Nombre de la Rutina"
                  placeholder="Ej: Empuje e Hipertrofia de Pectoral"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Categoría"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="Hipertrofia">Hipertrofia</MenuItem>
                  <MenuItem value="Fuerza">Fuerza</MenuItem>
                  <MenuItem value="Pérdida de Grasa">Pérdida de Grasa</MenuItem>
                  <MenuItem value="Acondicionamiento">Acondicionamiento</MenuItem>
                  <MenuItem value="Calistenia / Casa">Calistenia / Casa</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Notas u Objetivo de la Sesión"
                  placeholder="Ej: Realizar 2 min de descanso en básicos y 90s en accesorios..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Ejercicios seleccionados en la rutina */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  📋 Ejercicios en esta Rutina ({selectedExercises.length})
                </Typography>
                {selectedExercises.length > 0 && (
                  <Button size="small" color="error" onClick={() => setSelectedExercises([])}>
                    Limpiar lista
                  </Button>
                )}
              </Stack>

              {selectedExercises.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Aún no has añadido ejercicios. Búscalos abajo entre los 1,300+ ejercicios de la biblioteca y pulsa "+ Añadir".
                </Alert>
              ) : (
                <Stack spacing={1.5}>
                  {selectedExercises.map((item, idx) => (
                    <Card key={item.exercise_id} variant="outlined" sx={{ borderRadius: 2, p: 1.5, bgcolor: '#fafafa' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1.5}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {idx + 1}. {item.name}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            {item.body_part && <Chip label={item.body_part} size="small" variant="outlined" />}
                            {item.equipment && <Chip label={item.equipment} size="small" />}
                          </Stack>
                        </Box>

                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <TextField
                            size="small"
                            label="Series"
                            type="number"
                            value={item.sets}
                            onChange={(e) => handleUpdateItem(item.exercise_id, 'sets', Number(e.target.value))}
                            sx={{ width: 80 }}
                          />
                          <TextField
                            size="small"
                            label="Reps"
                            type="number"
                            value={item.reps}
                            onChange={(e) => handleUpdateItem(item.exercise_id, 'reps', Number(e.target.value))}
                            sx={{ width: 80 }}
                          />
                          <IconButton color="error" size="small" onClick={() => handleRemoveExercise(item.exercise_id)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Explorador y Buscador de Ejercicios */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                🔍 Buscar en la Biblioteca de Ejercicios (1,300+ disponibles)
              </Typography>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    placeholder="Buscar ejercicio por nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:magnifer-linear" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    select
                    size="small"
                    label="Grupo Muscular"
                    value={selectedBodyPart}
                    onChange={(e) => setSelectedBodyPart(e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {categories.bodyParts.map((bp) => (
                      <MenuItem key={bp} value={bp}>
                        {bp}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    select
                    size="small"
                    label="Equipamiento"
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {categories.equipments.map((eq) => (
                      <MenuItem key={eq} value={eq}>
                        {eq}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              {/* Lista de Resultados */}
              {loadingExercises ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={32} />
                </Box>
              ) : availableExercises.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No se encontraron ejercicios con estos filtros.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
                  <Stack spacing={1}>
                    {availableExercises.map((ex) => {
                      const isAdded = selectedExercises.some((item) => item.exercise_id === ex.id);
                      return (
                        <Box
                          key={ex.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1.5,
                            '&:hover': { bgcolor: '#f8fafc' },
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            {(ex.gif_url || ex.image_url) && (
                              <Box
                                component="img"
                                src={ex.gif_url || ex.image_url}
                                alt={ex.name}
                                sx={{
                                  width: 52,
                                  height: 52,
                                  borderRadius: 1.5,
                                  objectFit: 'contain',
                                  bgcolor: '#0a0f1d',
                                  border: '1px solid #cbd5e1',
                                  flexShrink: 0,
                                }}
                                loading="lazy"
                              />
                            )}
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {ex.name}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                {ex.body_part && <Chip label={ex.body_part} size="small" variant="outlined" />}
                                {ex.equipment && <Chip label={ex.equipment} size="small" />}
                              </Stack>
                            </Box>
                          </Stack>

                          <Button
                            size="small"
                            variant={isAdded ? 'outlined' : 'contained'}
                            color={isAdded ? 'success' : 'primary'}
                            disabled={isAdded}
                            startIcon={<Iconify icon={isAdded ? 'eva:checkmark-fill' : 'eva:plus-fill'} />}
                            onClick={() => handleAddExercise(ex)}
                          >
                            {isAdded ? 'Añadido' : 'Añadir'}
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        ) : (
          /* Pestaña: Plantillas Rápidas */
          <Stack spacing={2.5}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Selecciona una rutina prediseñada probada por entrenadores. Se cargará en tu creador para que puedas usarla de inmediato o personalizarla.
            </Alert>

            <Grid container spacing={2}>
              {STARTER_TEMPLATES.map((tmpl, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Card sx={{ borderRadius: 2.5, height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {tmpl.title}
                      </Typography>
                      <Chip label={tmpl.category} size="small" color="primary" sx={{ mb: 1.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {tmpl.notes}
                      </Typography>

                      <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        EJERCICIOS INCLUIDOS:
                      </Typography>
                      <Stack spacing={0.5} sx={{ mb: 2 }}>
                        {tmpl.exercises.map((e, eIdx) => (
                          <Typography key={eIdx} variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            • {e.name} ({e.sets}x{e.reps})
                          </Typography>
                        ))}
                      </Stack>

                      <Button
                        variant="contained"
                        fullWidth
                        color="success"
                        startIcon={<Iconify icon="solar:download-square-bold" />}
                        onClick={() => handleSelectTemplate(tmpl)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        Cargar Esta Rutina
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, px: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveRoutine}
          disabled={isSubmitting || selectedExercises.length === 0 || !name.trim()}
          startIcon={<Iconify icon="solar:diskette-bold" />}
          sx={{ fontWeight: 'bold' }}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar y Añadir a Mis Rutinas'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
