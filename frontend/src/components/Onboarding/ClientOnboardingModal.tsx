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
  LinearProgress
} from '@mui/material';
import {
  User,
  Heart,
  Ruler,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft
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
    training_days: '4',
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
        setError('Por favor, introduce al menos tu medida de cintura para el seguimiento antropométrico.');
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

      const res = await completeOnboarding(user.id, formData);
      if (res.success && res.user) {
        onComplete(res.user);
      } else {
        onComplete({
          ...user,
          ...formData,
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
      disableEscapeKeyDown
      PaperProps={{
        className: 'apple-card',
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          background: 'linear-gradient(180deg, #1C1C1E 0%, #121214 100%)',
          border: '1px solid rgba(0, 122, 255, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          m: { xs: 1.5, sm: 3 },
          maxHeight: '92vh'
        }
      }}
    >
      {/* Header with Step Progress */}
      <Box sx={{ p: { xs: 2.5, sm: 3.5 }, pb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 122, 255, 0.4)'
              }}
            >
              <Sparkles size={20} color="#FFFFFF" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: '#FFFFFF', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Bienvenido a LifeBoost, {user?.name || 'Atleta'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Ficha de Anamnesis y Punto de Partida Inicial
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
              border: '1px solid rgba(0, 122, 255, 0.3)'
            }}
          />
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={(step / 3) * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #007AFF 0%, #34C759 100%)',
              borderRadius: 3
            }
          }}
        />

        {/* Step Tabs Subtitle */}
        <Stack direction="row" spacing={2} mt={1.5} justifyContent="space-between">
          <Typography variant="caption" sx={{ fontWeight: 700, color: step >= 1 ? '#007AFF' : 'rgba(255, 255, 255, 0.3)' }}>
            1. Biometría & Objetivos
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: step >= 2 ? '#007AFF' : 'rgba(255, 255, 255, 0.3)' }}>
            2. Medidas Iniciales
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: step >= 3 ? '#007AFF' : 'rgba(255, 255, 255, 0.3)' }}>
            3. Ficha Médica & Preferencias
          </Typography>
        </Stack>
      </Box>

      {/* Content Body */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* ========================================================
            PASO 1: Biometría & Perfil Base
        ======================================================== */}
        {step === 1 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <User size={18} color="#007AFF" />
              Datos Fisiológicos y Objetivos
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3, fontSize: '0.85rem' }}>
              Estos datos permitirán a tu entrenador calcular tu gasto energético basal (TDEE), agua diaria y macronutrientes.
            </Typography>

            <Grid container spacing={2.5}>
              {/* Sexo Biológico */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 1, display: 'block' }}>
                  Sexo Biológico
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      sx={{
                        p: 1.8,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: formData.gender === 'male' ? '1.5px solid #007AFF' : '0.5px solid rgba(255, 255, 255, 0.1)',
                        background: formData.gender === 'male' ? 'rgba(0, 122, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Typography variant="body1" fontWeight="800" sx={{ color: formData.gender === 'male' ? '#007AFF' : '#FFFFFF' }}>
                        🧔 Hombre
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      sx={{
                        p: 1.8,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: formData.gender === 'female' ? '1.5px solid #FF2D55' : '0.5px solid rgba(255, 255, 255, 0.1)',
                        background: formData.gender === 'female' ? 'rgba(255, 45, 85, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Typography variant="body1" fontWeight="800" sx={{ color: formData.gender === 'female' ? '#FF2D55' : '#FFFFFF' }}>
                        👩 Mujer
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Fecha de Nacimiento */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, mb: 1, display: 'block' }}>
                  Fecha de Nacimiento
                </Typography>
                <TextField
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange('birth_date')}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Estatura */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Estatura en Centímetros (cm)"
                  type="number"
                  placeholder="ej. 178"
                  value={formData.height}
                  onChange={handleChange('height')}
                  fullWidth
                  required
                  helperText="Para el cálculo del Índice de Masa Corporal y Tasa Metabólica"
                />
              </Grid>

              {/* Peso Inicial */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Peso Corporal Actual en Báscula (kg)"
                  type="number"
                  placeholder="ej. 82.5"
                  value={formData.weight}
                  onChange={handleChange('weight')}
                  fullWidth
                  required
                  helperText="Punto de partida de tu peso en ayunas"
                />
              </Grid>

              {/* Nivel de Actividad */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Nivel de Actividad Diaria"
                  value={formData.activity_level}
                  onChange={handleChange('activity_level')}
                  fullWidth
                >
                  <MenuItem value="sedentary">🛋️ Sedentario (Oficina / &lt; 5k pasos)</MenuItem>
                  <MenuItem value="light">🚶 Ligero (Caminatas / 6k-8k pasos)</MenuItem>
                  <MenuItem value="moderate">⚡ Moderado (Activo / 10k pasos)</MenuItem>
                  <MenuItem value="very_active">🔥 Muy Activo (Trabajo físico / &gt; 15k pasos)</MenuItem>
                </TextField>
              </Grid>

              {/* Objetivo Principal */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Objetivo Principal con tu Entrenador"
                  value={formData.fitness_goal}
                  onChange={handleChange('fitness_goal')}
                  fullWidth
                >
                  <MenuItem value="fat_loss">🔥 Pérdida de Grasa & Adelgazamiento</MenuItem>
                  <MenuItem value="muscle_gain">💪 Ganancia de Masa Muscular & Volumen</MenuItem>
                  <MenuItem value="maintenance">⚖️ Mantenimiento & Recomposición</MenuItem>
                  <MenuItem value="health">🏃 Rendimiento Deportivo & Salud Integral</MenuItem>
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
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Ruler size={18} color="#34C759" />
              Medidas Corporales de Inicio (cm)
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3, fontSize: '0.85rem' }}>
              Toma una cinta métrica y anota tus perímetros iniciales. Estos datos quedarán grabados en tu sección <strong>"Mi Punto de Partida"</strong> para monitorizar cuántos centímetros vas perdiendo.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Cintura / Perímetro Abdominal (cm) *"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  placeholder="ej. 86.0"
                  value={formData.waist_measurement}
                  onChange={handleChange('waist_measurement')}
                  fullWidth
                  required
                  helperText="Medir a la altura del ombligo en posición relajada"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Pecho (cm)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  placeholder="ej. 102.0"
                  value={formData.chest_measurement}
                  onChange={handleChange('chest_measurement')}
                  fullWidth
                  helperText="Medir por debajo de las axilas y pezones"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Cadera / Glúteos (cm)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  placeholder="ej. 98.5"
                  value={formData.hip_measurement}
                  onChange={handleChange('hip_measurement')}
                  fullWidth
                  helperText="Medir en la parte más ancha de la cadera"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Muslo Superior (cm)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  placeholder="ej. 58.0"
                  value={formData.thigh_measurement}
                  onChange={handleChange('thigh_measurement')}
                  fullWidth
                  helperText="Medir a mitad del muslo"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Bíceps en Flexión (cm)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  placeholder="ej. 36.5"
                  value={formData.bicep_measurement}
                  onChange={handleChange('bicep_measurement')}
                  fullWidth
                  helperText="Brazo en ángulo de 90° apretando bíceps"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ========================================================
            PASO 3: Ficha Médica, Lesiones & Nutrición
        ======================================================== */}
        {step === 3 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Heart size={18} color="#FF9500" />
              Ficha Médica, Alergias y Preferencias del Atleta
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3, fontSize: '0.85rem' }}>
              Tu entrenador necesita conocer cualquier intolerancia, lesión o preferencia para no incluir alimentos molestos ni ejercicios lesivos.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Alergias Conocidas"
                  placeholder="ej. Frutos secos, marisco, polen (o 'Ninguna')"
                  value={formData.allergies}
                  onChange={handleChange('allergies')}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Intolerancias Alimentarias"
                  placeholder="ej. Lactosa, gluten, fructosa (o 'Ninguna')"
                  value={formData.food_intolerances}
                  onChange={handleChange('food_intolerances')}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Lesiones, Molestias Articulares o Cirugías Previas"
                  placeholder="ej. Hernia discal L5-S1, molestia en hombro derecho al empujar, condromalacia rotuliana..."
                  value={formData.injuries_conditions}
                  onChange={handleChange('injuries_conditions')}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Alimentos que NO te gustan / Deseas evitar"
                  placeholder="ej. Hígado, brócoli, queso azul, pescado azul..."
                  value={formData.disliked_foods}
                  onChange={handleChange('disliked_foods')}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Días por Semana que puedes Entrenar"
                  value={formData.training_days}
                  onChange={handleChange('training_days')}
                  fullWidth
                >
                  <MenuItem value="2">2 Días por semana</MenuItem>
                  <MenuItem value="3">3 Días por semana (Recomendado)</MenuItem>
                  <MenuItem value="4">4 Días por semana (Torso / Pierna)</MenuItem>
                  <MenuItem value="5">5 Días por semana (Push / Pull / Legs)</MenuItem>
                  <MenuItem value="6">6 Días por semana (Avanzado)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Observaciones o Notas Adicionales para tu Entrenador"
                  placeholder="ej. Suelo entrenar por las mañanas, trabajo a turnos, tengo máquina de café en el trabajo..."
                  value={formData.observations}
                  onChange={handleChange('observations')}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          pt: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
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
              px: 2.5
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
              px: 3.5,
              py: 1.2
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
              px: 3.5,
              py: 1.2,
              background: 'linear-gradient(135deg, #34C759 0%, #28CD41 100%)',
              boxShadow: '0 8px 25px rgba(52, 199, 89, 0.4)'
            }}
          >
            {loading ? 'Guardando Ficha...' : 'Finalizar y Entrar a la App'}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default ClientOnboardingModal;
