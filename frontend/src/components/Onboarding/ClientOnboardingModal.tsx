import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Chip,
  MenuItem,
  CircularProgress,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import {
  User,
  Heart,
  Ruler,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Flame,
  Dumbbell
} from 'lucide-react';
import { completeOnboarding } from '../../services/userService';
import { User as UserType } from '../../types/User';

interface ClientOnboardingModalProps {
  open: boolean;
  user: UserType;
  onComplete: (updatedUser: UserType) => void;
}

export const ClientOnboardingModal: React.FC<ClientOnboardingModalProps> = ({
  open,
  user,
  onComplete
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Biometría & Perfil
    gender: user.gender || 'male',
    birth_date: user.birth_date ? user.birth_date.split('T')[0] : '1998-01-01',
    height: user.height ? String(user.height) : '',
    weight: user.weight ? String(user.weight) : '',
    activity_level: user.activity_level || 'moderate',
    fitness_goal: user.fitness_goal || 'fat_loss',

    // Step 2: Medidas de Inicio
    chest_measurement: '',
    waist_measurement: '',
    hip_measurement: '',
    thigh_measurement: '',
    bicep_measurement: '',

    // Step 3: Ficha Médica & Preferencias
    allergies: '',
    food_intolerances: '',
    injuries_conditions: '',
    disliked_foods: '',
    training_days: '5',
    observations: ''
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.height || !formData.weight || !formData.birth_date) {
        setError('Por favor, completa tu altura, peso y fecha de nacimiento.');
        return;
      }
      if (Number(formData.height) < 100 || Number(formData.height) > 250) {
        setError('Por favor, introduce una estatura válida en centímetros (ej. 175).');
        return;
      }
      if (Number(formData.weight) < 30 || Number(formData.weight) > 300) {
        setError('Por favor, introduce un peso corporal válido en kg (ej. 78.5).');
        return;
      }
    }

    if (step === 2) {
      if (!formData.waist_measurement) {
        setError('Por favor, introduce al menos tu medida de cintura (en cm) para tu punto de partida.');
        return;
      }
    }

    setStep((prev) => Math.min(3, prev + 1));
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);
      setError(null);

      // Calcular factor de actividad preciso para la calculadora y sincronizar
      let activityFactor = 1.55; // default 3-5 días moderado
      const days = parseInt(formData.training_days, 10) || 5;
      if (days <= 2) activityFactor = 1.375;
      else if (days <= 5) activityFactor = 1.55;
      else activityFactor = 1.725;

      let goalKey = 'lose';
      if (formData.fitness_goal === 'muscle_gain') goalKey = 'gain';
      else if (formData.fitness_goal === 'maintenance' || formData.fitness_goal === 'health') goalKey = 'maintain';

      let computedAge = 25;
      if (formData.birth_date) {
        const birth = new Date(formData.birth_date);
        const diffMs = Date.now() - birth.getTime();
        const ageDt = new Date(diffMs);
        computedAge = Math.abs(ageDt.getUTCFullYear() - 1970) || 25;
      }

      // Guardar sincronización directa en localStorage para la Calculadora de Calorías
      try {
        localStorage.setItem(
          `calc_meta_${user.id}`,
          JSON.stringify({
            gender: formData.gender,
            activity: activityFactor,
            goal: goalKey,
            weight: formData.weight,
            height: formData.height,
            age: String(computedAge),
            training_days: formData.training_days
          })
        );
      } catch (e) {}

      // Mapear activity_level adecuado para el backend
      const mappedActivityLevel = days >= 6 ? 'very_active' : days >= 3 ? 'moderate' : 'light';

      const payload = {
        ...formData,
        activity_level: mappedActivityLevel
      };

      const res = await completeOnboarding(user.id, payload);
      if (res.success && res.user) {
        onComplete(res.user);
      } else {
        onComplete({
          ...user,
          ...payload,
          weight: formData.weight ? Number(formData.weight) : user.weight,
          height: formData.height ? Number(formData.height) : user.height,
          onboarding_completed: true
        });
      }
    } catch (err: any) {
      console.error('Error enviando onboarding:', err);
      setError(err.message || 'Error al guardar tu ficha inicial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      disableEscapeKeyDown
      scroll="paper"
      PaperProps={{
        className: 'apple-card',
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          background: 'linear-gradient(180deg, #1C1C1E 0%, #121214 100%)',
          border: { xs: 'none', sm: '1px solid rgba(0, 122, 255, 0.3)' },
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? '100dvh' : 'auto',
          maxHeight: isMobile ? '100dvh' : '88vh',
          m: { xs: 0, sm: 2.5 },
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with Step Progress */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          pb: 1.8,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(28, 28, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          flexShrink: 0,
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : 2.5
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.2} flexWrap="wrap" gap={1}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 122, 255, 0.4)',
                flexShrink: 0
              }}
            >
              <Sparkles size={18} color="#FFFFFF" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: '#FFFFFF', fontSize: { xs: '1rem', sm: '1.2rem' }, lineHeight: 1.2 }}>
                Bienvenido, {user?.name || 'Atleta'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.72rem' }}>
                Ficha Inicial de Anamnesis y Punto de Partida
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`Paso ${step} de 3`}
            size="small"
            sx={{
              background: 'rgba(0, 122, 255, 0.15)',
              color: '#007AFF',
              fontWeight: 800,
              border: '1px solid rgba(0, 122, 255, 0.3)',
              height: 24,
              fontSize: '0.72rem'
            }}
          />
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={(step / 3) * 100}
          sx={{
            height: 5,
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #007AFF 0%, #34C759 100%)',
              borderRadius: 3
            }
          }}
        />

        {/* Step Tabs Subtitle */}
        <Stack direction="row" spacing={1} mt={1.2} justifyContent="space-between">
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.68rem', sm: '0.75rem' }, color: step >= 1 ? '#007AFF' : 'rgba(255, 255, 255, 0.3)' }}>
            1. Biometría
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.68rem', sm: '0.75rem' }, color: step >= 2 ? '#007AFF' : 'rgba(255, 255, 255, 0.3)' }}>
            2. Medidas Inicio
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.68rem', sm: '0.75rem' }, color: step >= 3 ? '#007AFF' : 'rgba(255, 255, 255, 0.3)' }}>
            3. Ficha Médica
          </Typography>
        </Stack>
      </Box>

      {/* Content Body with Fluid Touch Scroll */}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          pb: { xs: 5, sm: 4 },
          bgcolor: '#121214',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          flex: 1,
          minHeight: 0
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.85rem' }}>
            {error}
          </Alert>
        )}

        {/* ========================================================
            PASO 1: Biometría & Perfil Base
        ======================================================== */}
        {step === 1 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.95rem' }}>
              <User size={18} color="#007AFF" />
              Datos Fisiológicos y Objetivos
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2.5, fontSize: '0.82rem', lineHeight: 1.4 }}>
              Tu entrenador utilizará estos datos para calcular tu gasto calórico basal (BMR), hidratación y pautas de entrenamiento.
            </Typography>

            <Grid container spacing={2}>
              {/* Sexo Biológico */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.8, display: 'block' }}>
                  Sexo Biológico
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: formData.gender === 'male' ? '1.5px solid #007AFF' : '0.5px solid rgba(255, 255, 255, 0.1)',
                        background: formData.gender === 'male' ? 'rgba(0, 122, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        transition: 'all 0.15s ease',
                        minHeight: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" fontWeight="800" sx={{ color: formData.gender === 'male' ? '#007AFF' : '#FFFFFF' }}>
                        🧔 Hombre
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: formData.gender === 'female' ? '1.5px solid #FF2D55' : '0.5px solid rgba(255, 255, 255, 0.1)',
                        background: formData.gender === 'female' ? 'rgba(255, 45, 85, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        transition: 'all 0.15s ease',
                        minHeight: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" fontWeight="800" sx={{ color: formData.gender === 'female' ? '#FF2D55' : '#FFFFFF' }}>
                        👩 Mujer
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Fecha de Nacimiento */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Fecha de Nacimiento
                </Typography>
                <TextField
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange('birth_date')}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                />
              </Grid>

              {/* Estatura */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Estatura (cm) *
                </Typography>
                <TextField
                  type="number"
                  placeholder="ej. 178"
                  value={formData.height}
                  onChange={handleChange('height')}
                  inputProps={{ inputMode: 'numeric' }}
                  fullWidth
                  required
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                />
              </Grid>

              {/* Peso Inicial */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Peso (kg) *
                </Typography>
                <TextField
                  type="number"
                  placeholder="ej. 82.5"
                  value={formData.weight}
                  onChange={handleChange('weight')}
                  inputProps={{ step: '0.1', inputMode: 'decimal' }}
                  fullWidth
                  required
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                />
              </Grid>

              {/* Objetivo Principal */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Objetivo Principal con tu Entrenador
                </Typography>
                <TextField
                  select
                  value={formData.fitness_goal}
                  onChange={handleChange('fitness_goal')}
                  fullWidth
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                >
                  <MenuItem value="fat_loss">🔥 Pérdida de Grasa & Definición</MenuItem>
                  <MenuItem value="muscle_gain">💪 Ganancia Muscular & Volumen</MenuItem>
                  <MenuItem value="maintenance">⚖️ Mantenimiento & Recomposición Corporal</MenuItem>
                  <MenuItem value="health">🏃 Rendimiento Deportivo & Salud General</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ========================================================
            PASO 2: Medidas Corporales (Punto de Partida)
        ======================================================== */}
        {step === 2 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.95rem' }}>
              <Ruler size={18} color="#34C759" />
              Medidas Corporales de Inicio (cm)
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2.5, fontSize: '0.82rem', lineHeight: 1.4 }}>
              Anota tus perímetros con una cinta métrica. Quedarán fijadas en <strong>"Mi Punto de Partida"</strong> para medir cuántos centímetros reduces a lo largo del tiempo.
            </Typography>

            <Grid container spacing={2}>
              {/* Cintura (Obligatoria) */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    background: 'rgba(52, 199, 89, 0.08)',
                    border: '1px solid rgba(52, 199, 89, 0.3)'
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#34C759', mb: 0.5 }}>
                    📏 Cintura / Perímetro Abdominal (cm) *
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 1 }}>
                    Medir horizontalmente a la altura del ombligo en posición neutra.
                  </Typography>
                  <TextField
                    type="number"
                    placeholder="ej. 86.0"
                    value={formData.waist_measurement}
                    onChange={handleChange('waist_measurement')}
                    inputProps={{ step: '0.1', inputMode: 'decimal' }}
                    fullWidth
                    required
                    InputProps={{ sx: { bgcolor: '#1C1C1E', borderRadius: '10px', fontSize: '16px' } }}
                  />
                </Box>
              </Grid>

              {/* Pecho */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Pecho / Torso (cm)
                </Typography>
                <TextField
                  type="number"
                  placeholder="ej. 102.0"
                  value={formData.chest_measurement}
                  onChange={handleChange('chest_measurement')}
                  inputProps={{ step: '0.1', inputMode: 'decimal' }}
                  fullWidth
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                  helperText="Bajo axilas en máxima espiración"
                />
              </Grid>

              {/* Cadera */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Cadera / Glúteo (cm)
                </Typography>
                <TextField
                  type="number"
                  placeholder="ej. 98.5"
                  value={formData.hip_measurement}
                  onChange={handleChange('hip_measurement')}
                  inputProps={{ step: '0.1', inputMode: 'decimal' }}
                  fullWidth
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                  helperText="Zona de mayor relieve del glúteo"
                />
              </Grid>

              {/* Muslo */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Muslo Superior (cm)
                </Typography>
                <TextField
                  type="number"
                  placeholder="ej. 58.0"
                  value={formData.thigh_measurement}
                  onChange={handleChange('thigh_measurement')}
                  inputProps={{ step: '0.1', inputMode: 'decimal' }}
                  fullWidth
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                  helperText="Medir en tercio superior del muslo"
                />
              </Grid>

              {/* Bíceps */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Bíceps en Flexión (cm)
                </Typography>
                <TextField
                  type="number"
                  placeholder="ej. 36.5"
                  value={formData.bicep_measurement}
                  onChange={handleChange('bicep_measurement')}
                  inputProps={{ step: '0.1', inputMode: 'decimal' }}
                  fullWidth
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                  helperText="Brazo a 90° apretando bíceps"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ========================================================
            PASO 3: Ficha Médica, Lesiones & Preferencias
        ======================================================== */}
        {step === 3 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.95rem' }}>
              <Heart size={18} color="#FF9500" />
              Ficha Médica y Preferencias del Atleta
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2.5, fontSize: '0.82rem', lineHeight: 1.4 }}>
              Permite a tu entrenador adaptar tus alimentos sin alérgenos molestos y descartar ejercicios lesivos para ti.
            </Typography>

            <Grid container spacing={2}>
              {/* Días por semana */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    background: 'rgba(0, 122, 255, 0.08)',
                    border: '1px solid rgba(0, 122, 255, 0.3)'
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#007AFF', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Dumbbell size={16} />
                    Días por Semana que vas a Entrenar
                  </Typography>
                  <TextField
                    select
                    value={formData.training_days}
                    onChange={handleChange('training_days')}
                    fullWidth
                    InputProps={{ sx: { bgcolor: '#1C1C1E', borderRadius: '10px', fontSize: '16px' } }}
                  >
                    <MenuItem value="2">2 Días por semana</MenuItem>
                    <MenuItem value="3">3 Días por semana (Full Body)</MenuItem>
                    <MenuItem value="4">4 Días por semana (Torso / Pierna)</MenuItem>
                    <MenuItem value="5">5 Días por semana (Push / Pull / Legs + Torso)</MenuItem>
                    <MenuItem value="6">6 Días por semana (Atleta Avanzado)</MenuItem>
                  </TextField>
                </Box>
              </Grid>

              {/* Alergias */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Alergias Conocidas
                </Typography>
                <TextField
                  placeholder="ej. Frutos secos, marisco, polen (o 'Ninguna')"
                  value={formData.allergies}
                  onChange={handleChange('allergies')}
                  fullWidth
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                />
              </Grid>

              {/* Intolerancias */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Intolerancias Alimentarias
                </Typography>
                <TextField
                  placeholder="ej. Lactosa, gluten, fructosa (o 'Ninguna')"
                  value={formData.food_intolerances}
                  onChange={handleChange('food_intolerances')}
                  fullWidth
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                />
              </Grid>

              {/* Lesiones */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Lesiones o Molestias Articulares Previas
                </Typography>
                <TextField
                  placeholder="ej. Molestia lumbar en sentadilla, tendón rotuliano izquierdo, hombro derecho..."
                  value={formData.injuries_conditions}
                  onChange={handleChange('injuries_conditions')}
                  fullWidth
                  multiline
                  rows={2}
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                />
              </Grid>

              {/* Alimentos que no gustan */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Alimentos Rechazados (No deseados)
                </Typography>
                <TextField
                  placeholder="ej. Hígado, queso azul, brócoli, atún..."
                  value={formData.disliked_foods}
                  onChange={handleChange('disliked_foods')}
                  fullWidth
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                />
              </Grid>

              {/* Observaciones */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Notas u Horarios para tu Entrenador
                </Typography>
                <TextField
                  placeholder="ej. Entreno a las 7:00 am en ayunas, trabajo a turnos..."
                  value={formData.observations}
                  onChange={handleChange('observations')}
                  fullWidth
                  multiline
                  rows={2}
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '16px' } }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      {/* Fixed Footer Actions */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(28, 28, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 14px)' : 2.5,
          gap: 1.5
        }}
      >
        {step > 1 ? (
          <Button
            variant="outlined"
            onClick={handlePrevStep}
            disabled={loading}
            startIcon={<ArrowLeft size={16} />}
            sx={{
              borderRadius: '12px',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              px: { xs: 2, sm: 2.5 },
              minHeight: 44,
              fontSize: '0.88rem'
            }}
          >
            Anterior
          </Button>
        ) : (
          <Box />
        )}

        {step < 3 ? (
          <Button
            variant="contained"
            onClick={handleNextStep}
            endIcon={<ArrowRight size={16} />}
            className="apple-button-primary"
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              px: { xs: 3, sm: 3.5 },
              minHeight: 44,
              fontSize: '0.9rem'
            }}
          >
            Siguiente Paso
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={18} />}
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              px: { xs: 3, sm: 3.5 },
              minHeight: 44,
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #34C759 0%, #28CD41 100%)',
              boxShadow: '0 8px 25px rgba(52, 199, 89, 0.4)'
            }}
          >
            {loading ? 'Guardando...' : 'Finalizar y Entrar'}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default ClientOnboardingModal;
