// Creador avanzado de rutinas para el cliente con estética Apple iOS Liquid Glass
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Wand2,
  Sparkles,
  X,
  Search,
  Plus,
  Trash2,
  Check,
  Dumbbell,
  ArrowRight,
  Layers,
  Flame,
} from 'lucide-react';
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

const STARTER_TEMPLATES = [
  {
    title: '💪 Empuje (Push Day)',
    category: 'Hipertrofia',
    notes: 'Enfocada en pectoral, deltoides anterior y tríceps.',
    color: '#007AFF',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 8 },
      { name: 'Dumbbell Incline Bench Press', sets: 3, reps: 10 },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10 },
      { name: 'Cable Triceps Pushdown', sets: 3, reps: 12 },
    ],
  },
  {
    title: '🧗 Tirón (Pull Day)',
    category: 'Hipertrofia',
    notes: 'Enfocada en dorsal, deltoides posterior, trapecios y bíceps.',
    color: '#AF52DE',
    exercises: [
      { name: 'Cable Lat Pulldown', sets: 4, reps: 10 },
      { name: 'Barbell Bent Over Row', sets: 4, reps: 8 },
      { name: 'Cable Face Pull', sets: 3, reps: 15 },
      { name: 'Barbell Biceps Curl', sets: 3, reps: 10 },
    ],
  },
  {
    title: '🦵 Piernas y Core (Leg Day)',
    category: 'Fuerza',
    notes: 'Enfocada en cuádriceps, isquios, glúteos y pantorrillas.',
    color: '#FF3B30',
    exercises: [
      { name: 'Barbell Full Squat', sets: 4, reps: 8 },
      { name: 'Barbell Romanian Deadlift', sets: 4, reps: 10 },
      { name: 'Leg Press', sets: 3, reps: 12 },
      { name: 'Standing Calf Raises', sets: 4, reps: 15 },
    ],
  },
  {
    title: '⚡ Full Body Integral',
    category: 'Movilidad',
    notes: 'Rutina integral de cuerpo completo para fuerza y salud metabólica.',
    color: '#34C759',
    exercises: [
      { name: 'Barbell Full Squat', sets: 3, reps: 8 },
      { name: 'Barbell Bench Press', sets: 3, reps: 8 },
      { name: 'Cable Lat Pulldown', sets: 3, reps: 10 },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10 },
    ],
  },
];

export const ClientWorkoutBuilderModal: React.FC<ClientWorkoutBuilderModalProps> = ({
  open,
  onClose,
  userId,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Hipertrofia');
  const [notes, setNotes] = useState<string>('');
  const [selectedExercises, setSelectedExercises] = useState<RoutineItem[]>([]);

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

  useEffect(() => {
    if (!open) return;
    loadCategories();
    fetchExercises();
  }, [open]);

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
      const params: ExerciseQueryParams = { limit: 25 };
      if (searchQuery) params.search = searchQuery;
      if (selectedBodyPart) params.body_part = selectedBodyPart;
      if (selectedEquipment) params.equipment = selectedEquipment;

      const res = await getExercises(params);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
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

  const handleUpdateItem = (exerciseId: number, field: 'sets' | 'reps', val: number) => {
    setSelectedExercises((prev) =>
      prev.map((item) => (item.exercise_id === exerciseId ? { ...item, [field]: val } : item))
    );
  };

  const handleSelectTemplate = async (template: (typeof STARTER_TEMPLATES)[0]) => {
    setName(template.title.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s()]/g, '').trim());
    setCategory(template.category);
    setNotes(template.notes);
    setLoadingExercises(true);

    try {
      const loadedItems: RoutineItem[] = [];
      for (const tEx of template.exercises) {
        const res = await getExercises({ search: tEx.name, limit: 1 });
        const list = Array.isArray(res) ? res : (res as any)?.data || [];
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
      setActiveTab(0);
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
      const newWorkout = await createWorkout({
        user_id: userId,
        name: name.trim(),
        category,
        notes: notes.trim(),
      });

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
            <Wand2 size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              Creador de Rutinas
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Personalizadas o con plantillas Pro
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

      {/* Selector de Pestañas Apple Segmented */}
      <Box sx={{ p: 2, px: { xs: 2, sm: 3 }, bgcolor: '#000000', borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
        <Box
          sx={{
            display: 'flex',
            bgcolor: '#1C1C1E',
            p: '4px',
            borderRadius: '14px',
            border: '0.5px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Box
            onClick={() => setActiveTab(0)}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              borderRadius: '10px',
              cursor: 'pointer',
              bgcolor: activeTab === 0 ? '#2C2C2E' : 'transparent',
              color: activeTab === 0 ? '#ffffff' : 'rgba(235, 235, 245, 0.6)',
              fontWeight: activeTab === 0 ? 700 : 500,
              fontSize: '0.85rem',
              transition: 'all 0.15s ease',
            }}
          >
            Diseñar Mi Rutina
          </Box>
          <Box
            onClick={() => setActiveTab(1)}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              borderRadius: '10px',
              cursor: 'pointer',
              bgcolor: activeTab === 1 ? '#007AFF' : 'transparent',
              color: '#ffffff',
              fontWeight: activeTab === 1 ? 700 : 500,
              fontSize: '0.85rem',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <Sparkles size={14} /> Plantillas Pro
          </Box>
        </Box>
      </Box>

      {/* Contenido con Scroll */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#000000', overflowY: 'auto' }}>
        {errorMsg && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '14px',
              bgcolor: 'rgba(255, 59, 48, 0.15)',
              color: '#FF453A',
              border: '0.5px solid rgba(255, 59, 48, 0.3)',
            }}
          >
            {errorMsg}
          </Alert>
        )}

        {activeTab === 0 ? (
          <Stack spacing={2.5}>
            {/* Información Básica */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Nombre de la Rutina *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej: Empuje y Tríceps Avanzado"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Categoría
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  >
                    <MenuItem value="Hipertrofia">Hipertrofia</MenuItem>
                    <MenuItem value="Fuerza">Fuerza</MenuItem>
                    <MenuItem value="Cardio">Cardio</MenuItem>
                    <MenuItem value="Movilidad">Movilidad</MenuItem>
                    <MenuItem value="Resistencia">Resistencia</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Notas personales
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Consejos de descanso, sensaciones o tempos..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Ejercicios Seleccionados */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Layers size={16} color="#34C759" /> Ejercicios en mi Rutina ({selectedExercises.length})
              </Typography>

              {selectedExercises.length === 0 ? (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: '#2C2C2E',
                    borderRadius: '14px',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                    Añade ejercicios utilizando el buscador inferior.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {selectedExercises.map((item, idx) => (
                    <Box
                      key={item.exercise_id}
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        bgcolor: '#2C2C2E',
                        border: '0.5px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                          {idx + 1}. {item.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveExercise(item.exercise_id)}
                          sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.15)' } }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>

                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Series"
                            value={item.sets}
                            onChange={(e) => handleUpdateItem(item.exercise_id, 'sets', Number(e.target.value) || 1)}
                            InputProps={{
                              sx: { color: '#ffffff', bgcolor: '#1C1C1E', borderRadius: '10px', fontSize: '16px' },
                            }}
                            InputLabelProps={{ sx: { color: 'rgba(235, 235, 245, 0.6)' } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Reps"
                            value={item.reps}
                            onChange={(e) => handleUpdateItem(item.exercise_id, 'reps', Number(e.target.value) || 1)}
                            InputProps={{
                              sx: { color: '#ffffff', bgcolor: '#1C1C1E', borderRadius: '10px', fontSize: '16px' },
                            }}
                            InputLabelProps={{ sx: { color: 'rgba(235, 235, 245, 0.6)' } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Buscador de Ejercicios */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Search size={16} color="#007AFF" /> Biblioteca de Ejercicios
              </Typography>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar ejercicio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={selectedBodyPart}
                    onChange={(e) => setSelectedBodyPart(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  >
                    <MenuItem value="">Todos los músculos</MenuItem>
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
                    fullWidth
                    size="small"
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  >
                    <MenuItem value="">Cualquier equipo</MenuItem>
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
                  <CircularProgress size={28} sx={{ color: '#007AFF' }} />
                </Box>
              ) : availableExercises.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.5)', textAlign: 'center', py: 2 }}>
                  No se encontraron ejercicios con estos filtros.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 260, overflowY: 'auto', pr: 0.5 }}>
                  <Stack spacing={1}>
                    {availableExercises.map((ex) => {
                      const isAdded = selectedExercises.some((item) => item.exercise_id === ex.id);
                      return (
                        <Box
                          key={ex.id}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: '#2C2C2E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1.5,
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff' }} noWrap>
                              {ex.name}
                            </Typography>
                            {ex.body_part && (
                              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.5)' }}>
                                {ex.body_part} {ex.equipment ? `• ${ex.equipment}` : ''}
                              </Typography>
                            )}
                          </Box>

                          <Button
                            size="small"
                            variant="contained"
                            disabled={isAdded}
                            onClick={() => handleAddExercise(ex)}
                            sx={{
                              bgcolor: isAdded ? 'rgba(52, 199, 89, 0.2)' : '#007AFF',
                              color: isAdded ? '#34C759' : '#ffffff',
                              borderRadius: '8px',
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              height: 32,
                              '&:hover': { bgcolor: '#0062cc' },
                            }}
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
          /* Pestaña: Plantillas Pro */
          <Stack spacing={2}>
            <Alert
              severity="info"
              sx={{
                borderRadius: '14px',
                bgcolor: 'rgba(0, 122, 255, 0.12)',
                color: '#ffffff',
                border: '0.5px solid rgba(0, 122, 255, 0.3)',
              }}
            >
              Selecciona una rutina probada. Se cargará de inmediato en tu creador para que puedas afinarla.
            </Alert>

            <Grid container spacing={2}>
              {STARTER_TEMPLATES.map((tmpl, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '20px',
                      bgcolor: '#1C1C1E',
                      border: '0.5px solid rgba(255, 255, 255, 0.08)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'rgba(0, 122, 255, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.5 }}>
                      {tmpl.title}
                    </Typography>
                    <Chip
                      label={tmpl.category}
                      size="small"
                      sx={{
                        bgcolor: `${tmpl.color}20`,
                        color: tmpl.color,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        width: 'fit-content',
                        mb: 1.5,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 2, fontSize: '0.85rem' }}>
                      {tmpl.notes}
                    </Typography>

                    <Stack spacing={0.5} sx={{ mb: 2.5, flexGrow: 1 }}>
                      {tmpl.exercises.map((e, eIdx) => (
                        <Typography key={eIdx} variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.8)' }}>
                          • {e.name} ({e.sets}×{e.reps})
                        </Typography>
                      ))}
                    </Stack>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleSelectTemplate(tmpl)}
                      startIcon={<Sparkles size={16} />}
                      sx={{
                        bgcolor: '#007AFF',
                        color: '#ffffff',
                        fontWeight: 700,
                        borderRadius: '12px',
                        textTransform: 'none',
                        height: 40,
                        '&:hover': { bgcolor: '#0062cc' },
                      }}
                    >
                      Cargar Rutina
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
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
          onClick={handleSaveRoutine}
          disabled={isSubmitting || selectedExercises.length === 0 || !name.trim()}
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
          {isSubmitting ? 'Guardando...' : 'Guardar en Mis Rutinas'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientWorkoutBuilderModal;
