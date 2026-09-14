import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Rating,
  Alert,
  Stack,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  Info,
  Send,
  User,
  Activity,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getCurrentUser } from '../services/userService';
import { weeklyTrackingService } from '../services/weeklyTrackingService';
import { clientProgressPhotoService } from '../services/clientProgressPhotoService';
import { ClientProgressPhoto } from '../types/ClientProgressPhoto';
import { WeeklyTracking } from '../types/WeeklyTracking';
import BeforeAfterSlider from '../components/Progress/BeforeAfterSlider';

export const ClientProgressSubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPhotos, setUserPhotos] = useState<ClientProgressPhoto[]>([]);
  const [pastTrackings, setPastTrackings] = useState<WeeklyTracking[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const [silhouetteModalOpen, setSilhouetteModalOpen] = useState(false);

  const [form, setForm] = useState({
    weight: '' as number | '',
    weight_photo_url: '',
    chest_measurement: '' as number | '',
    waist_measurement: '' as number | '',
    hip_measurement: '' as number | '',
    thigh_measurement: '' as number | '',
    bicep_measurement: '' as number | '',
    diet_difficulties: '',
    exercise_difficulties: '',
    bowel_movements_per_week: 7,
    daily_water_intake: 2.5,
    sleep_quality: 'good',
    training_days_completed: 4,
    diet_deviations: '',
    self_rating: 8,
  });

  const [photoFront, setPhotoFront] = useState('');
  const [photoSide, setPhotoSide] = useState('');
  const [photoBack, setPhotoBack] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setUserId(user.id);
      setUserName(user.name);

      try {
        const [photos, trackings] = await Promise.all([
          clientProgressPhotoService.getByUserId(user.id),
          weeklyTrackingService.getByUserId(user.id),
        ]);
        setUserPhotos(photos || []);
        setPastTrackings(trackings || []);
      } catch (e) {
        console.warn('No se pudieron cargar datos históricos del usuario:', e);
      }
    } catch (e) {
      console.error('Error cargando usuario actual:', e);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleFileUpload = async (angle: 'front' | 'side' | 'back', file: File) => {
    try {
      setUploadingPhoto(angle);
      const url = await clientProgressPhotoService.uploadPhoto(file);
      if (angle === 'front') setPhotoFront(url);
      if (angle === 'side') setPhotoSide(url);
      if (angle === 'back') setPhotoBack(url);
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploadingPhoto(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const trackingPayload: Partial<WeeklyTracking> = {
        user_id: userId,
        weight: form.weight ? Number(form.weight) : undefined,
        weight_photo_url: form.weight_photo_url || undefined,
        chest_measurement: form.chest_measurement ? Number(form.chest_measurement) : undefined,
        waist_measurement: form.waist_measurement ? Number(form.waist_measurement) : undefined,
        hip_measurement: form.hip_measurement ? Number(form.hip_measurement) : undefined,
        thigh_measurement: form.thigh_measurement ? Number(form.thigh_measurement) : undefined,
        bicep_measurement: form.bicep_measurement ? Number(form.bicep_measurement) : undefined,
        diet_difficulties: form.diet_difficulties || undefined,
        exercise_difficulties: form.exercise_difficulties || undefined,
        bowel_movements_per_week: Number(form.bowel_movements_per_week),
        daily_water_intake: Number(form.daily_water_intake),
        sleep_quality: form.sleep_quality,
        training_days_completed: Number(form.training_days_completed),
        diet_deviations: form.diet_deviations || undefined,
        self_rating: Number(form.self_rating),
        date: new Date().toISOString().split('T')[0],
      };

      const tracking = await weeklyTrackingService.create(trackingPayload);

      const photoPromises: Promise<any>[] = [];
      if (photoFront) {
        photoPromises.push(
          clientProgressPhotoService.create({
            user_id: userId,
            tracking_id: tracking.id,
            photo_url: photoFront,
            angle: 'front',
            taken_at: new Date().toISOString(),
          })
        );
      }
      if (photoSide) {
        photoPromises.push(
          clientProgressPhotoService.create({
            user_id: userId,
            tracking_id: tracking.id,
            photo_url: photoSide,
            angle: 'side',
            taken_at: new Date().toISOString(),
          })
        );
      }
      if (photoBack) {
        photoPromises.push(
          clientProgressPhotoService.create({
            user_id: userId,
            tracking_id: tracking.id,
            photo_url: photoBack,
            angle: 'back',
            taken_at: new Date().toISOString(),
          })
        );
      }

      await Promise.all(photoPromises);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el reporte semanal');
    } finally {
      setLoading(false);
    }
  };

  const previousWeight = pastTrackings.length > 0 && pastTrackings[0].weight ? pastTrackings[0].weight : null;
  const weightDiff = form.weight && previousWeight ? Number(form.weight) - previousWeight : null;

  if (submitted) {
    return (
      <Box sx={{ p: 4, maxWidth: 640, mx: 'auto', textAlign: 'center', mt: 4 }}>
        <Box
          className="apple-card"
          sx={{
            p: 5,
            border: '0.5px solid rgba(52, 199, 89, 0.3)',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(52, 199, 89, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <CheckCircle2 size={36} color="#34C759" />
          </Box>
          <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#FFFFFF' }}>
            Reporte Semanal Enviado
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3.5, lineHeight: 1.6 }}>
            Tus datos antropométricos, fotos y hábitos han sido sincronizados en la nube. Tu entrenador revisará el progreso para ajustar tus próximas pautas.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard/client-home')}
              className="apple-button-primary"
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                px: 3,
              }}
            >
              Volver a Mi Panel
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSubmitted(false)}
              sx={{
                borderRadius: '12px',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
              }}
            >
              Enviar Otro Registro
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, mx: 'auto', pb: 8 }}>
      {/* Header Apple Inset Grouped */}
      <Box
        className="apple-card"
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 3,
          background: 'linear-gradient(180deg, #1C1C1E 0%, #161618 100%)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Chip
                label="Check-in Semanal"
                size="small"
                sx={{
                  background: 'rgba(0, 122, 255, 0.15)',
                  color: '#007AFF',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: '0.5px solid rgba(0, 122, 255, 0.3)',
                  height: 24,
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, color: '#FFFFFF' }}>
              Reporte de Biometría & Fotos
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 680 }}>
              Hola {userName || 'Atleta'}. Registra tus medidas y fotos para que tu entrenador ajuste tus calorías y cargas de entrenamiento.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => setSilhouetteModalOpen(true)}
            startIcon={<Camera size={16} />}
            sx={{
              borderRadius: '12px',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.82rem',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            Guía de Postura
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* Embedded Before / After Visual Comparison Slider */}
      <Box sx={{ mb: 3 }}>
        <BeforeAfterSlider photos={userPhotos} />
      </Box>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Card 1: Peso y Medidas Corporales */}
          <Box
            className="apple-card"
            sx={{
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1.2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: 'rgba(52, 199, 89, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Scale size={18} color="#34C759" />
                </Box>
                <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF' }}>
                  Peso Corporal & Medidas (cm)
                </Typography>
              </Box>

              {weightDiff !== null && (
                <Chip
                  label={`Variación: ${weightDiff > 0 ? `+${weightDiff.toFixed(1)}` : weightDiff.toFixed(1)} kg`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    height: 22,
                    fontSize: '0.72rem',
                    bgcolor: weightDiff <= 0 ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 149, 0, 0.15)',
                    color: weightDiff <= 0 ? '#34C759' : '#FF9500',
                  }}
                />
              )}
            </Box>

            <Divider sx={{ mb: 2.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Peso en Báscula (kg)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  value={form.weight}
                  onChange={handleChange('weight')}
                  fullWidth
                  required
                  placeholder="ej. 75.4"
                  helperText={previousWeight ? `Último peso: ${previousWeight} kg` : 'Pésate en ayunas al levantarte'}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Foto Báscula (URL opcional)"
                  value={form.weight_photo_url}
                  onChange={handleChange('weight_photo_url')}
                  fullWidth
                  placeholder="https://..."
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Pecho (cm)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  value={form.chest_measurement}
                  onChange={handleChange('chest_measurement')}
                  fullWidth
                  placeholder="ej. 102.5"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Cintura (cm)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  value={form.waist_measurement}
                  onChange={handleChange('waist_measurement')}
                  fullWidth
                  placeholder="ej. 82.0"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Cadera (cm)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  value={form.hip_measurement}
                  onChange={handleChange('hip_measurement')}
                  fullWidth
                  placeholder="ej. 98.0"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Muslo Superior (cm)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  value={form.thigh_measurement}
                  onChange={handleChange('thigh_measurement')}
                  fullWidth
                  placeholder="ej. 58.5"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Bíceps en Flexión (cm)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  value={form.bicep_measurement}
                  onChange={handleChange('bicep_measurement')}
                  fullWidth
                  placeholder="ej. 36.5"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Card 2: Hábitos Semanales y Sensaciones */}
          <Box
            className="apple-card"
            sx={{
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.2} mb={1.5}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(0, 122, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={18} color="#007AFF" />
              </Box>
              <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF' }}>
                Hábitos, Sueño & Adherencia
              </Typography>
            </Box>

            <Divider sx={{ mb: 2.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Calidad del Sueño"
                  value={form.sleep_quality}
                  onChange={handleChange('sleep_quality')}
                  fullWidth
                >
                  <MenuItem value="good">🌙 Bueno (Reparador y profundo)</MenuItem>
                  <MenuItem value="regular">⛅ Regular (Interrupciones leves)</MenuItem>
                  <MenuItem value="bad">⚡ Malo (Insomnio / Cansancio)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Días Entrenados en la Semana"
                  type="number"
                  inputProps={{ min: 0, max: 7 }}
                  value={form.training_days_completed}
                  onChange={handleChange('training_days_completed')}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Agua Diaria (Litros/día)"
                  type="number"
                  inputProps={{ step: '0.25', min: 0 }}
                  value={form.daily_water_intake}
                  onChange={handleChange('daily_water_intake')}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Deposiciones por Semana"
                  type="number"
                  value={form.bowel_movements_per_week}
                  onChange={handleChange('bowel_movements_per_week')}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '0.5px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#FFFFFF' }}>
                    Autoevaluación de Compromiso (1 a 10)
                  </Typography>
                  <Rating
                    max={10}
                    value={form.self_rating}
                    onChange={(_, val) => setForm({ ...form, self_rating: val || 8 })}
                    size="medium"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Dificultades con la Dieta u Observaciones"
                  multiline
                  rows={2}
                  value={form.diet_difficulties}
                  onChange={handleChange('diet_difficulties')}
                  fullWidth
                  placeholder="¿Hambre excesiva, comidas fuera de plan o antojos?"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Molestias Musculares o Articulares"
                  multiline
                  rows={2}
                  value={form.exercise_difficulties}
                  onChange={handleChange('exercise_difficulties')}
                  fullWidth
                  placeholder="¿Algún ejercicio te produjo dolor o molestia articular?"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Card 3: Fotos de Progreso Corporal (3 Ángulos) */}
          <Box
            className="apple-card"
            sx={{
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1.2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: 'rgba(175, 82, 222, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Camera size={18} color="#AF52DE" />
                </Box>
                <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF' }}>
                  Fotos de Progreso (3 Ángulos)
                </Typography>
              </Box>

              <Button
                size="small"
                variant="outlined"
                onClick={() => setSilhouetteModalOpen(true)}
                startIcon={<Info size={14} />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  py: 0.4,
                }}
              >
                Guía de Encuadre
              </Button>
            </Box>

            <Divider sx={{ mb: 2.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

            <Grid container spacing={2}>
              {/* Front Photo */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    background: '#161618',
                    border: '0.5px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF', mb: 1 }}>
                    Frente (Brazos en Cruz)
                  </Typography>

                  {photoFront ? (
                    <Box sx={{ position: 'relative', width: '100%', height: 160, mb: 1.5, borderRadius: '10px', overflow: 'hidden' }}>
                      <Box component="img" src={photoFront} alt="Frente" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <IconButton
                        size="small"
                        onClick={() => setPhotoFront('')}
                        sx={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 160,
                        mb: 1.5,
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '0.5px dashed rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <User size={32} color="rgba(255, 255, 255, 0.3)" />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        Sin foto cargada
                      </Typography>
                    </Box>
                  )}

                  <Stack spacing={1}>
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      disabled={uploadingPhoto === 'front'}
                      startIcon={uploadingPhoto === 'front' ? <CircularProgress size={16} /> : <Upload size={16} />}
                      sx={{ borderRadius: '10px', textTransform: 'none', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' }}
                    >
                      {uploadingPhoto === 'front' ? 'Subiendo...' : 'Subir Foto'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])}
                      />
                    </Button>
                    <TextField
                      size="small"
                      placeholder="o URL https://..."
                      value={photoFront}
                      onChange={(e) => setPhotoFront(e.target.value)}
                      fullWidth
                    />
                  </Stack>
                </Box>
              </Grid>

              {/* Side Photo */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    background: '#161618',
                    border: '0.5px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF', mb: 1 }}>
                    Perfil (Brazos al Frente)
                  </Typography>

                  {photoSide ? (
                    <Box sx={{ position: 'relative', width: '100%', height: 160, mb: 1.5, borderRadius: '10px', overflow: 'hidden' }}>
                      <Box component="img" src={photoSide} alt="Perfil" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <IconButton
                        size="small"
                        onClick={() => setPhotoSide('')}
                        sx={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 160,
                        mb: 1.5,
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '0.5px dashed rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <User size={32} color="rgba(255, 255, 255, 0.3)" />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        Sin foto cargada
                      </Typography>
                    </Box>
                  )}

                  <Stack spacing={1}>
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      disabled={uploadingPhoto === 'side'}
                      startIcon={uploadingPhoto === 'side' ? <CircularProgress size={16} /> : <Upload size={16} />}
                      sx={{ borderRadius: '10px', textTransform: 'none', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' }}
                    >
                      {uploadingPhoto === 'side' ? 'Subiendo...' : 'Subir Foto'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('side', e.target.files[0])}
                      />
                    </Button>
                    <TextField
                      size="small"
                      placeholder="o URL https://..."
                      value={photoSide}
                      onChange={(e) => setPhotoSide(e.target.value)}
                      fullWidth
                    />
                  </Stack>
                </Box>
              </Grid>

              {/* Back Photo */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    background: '#161618',
                    border: '0.5px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF', mb: 1 }}>
                    Espalda (Brazos en Cruz)
                  </Typography>

                  {photoBack ? (
                    <Box sx={{ position: 'relative', width: '100%', height: 160, mb: 1.5, borderRadius: '10px', overflow: 'hidden' }}>
                      <Box component="img" src={photoBack} alt="Espalda" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <IconButton
                        size="small"
                        onClick={() => setPhotoBack('')}
                        sx={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 160,
                        mb: 1.5,
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '0.5px dashed rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <User size={32} color="rgba(255, 255, 255, 0.3)" />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        Sin foto cargada
                      </Typography>
                    </Box>
                  )}

                  <Stack spacing={1}>
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      disabled={uploadingPhoto === 'back'}
                      startIcon={uploadingPhoto === 'back' ? <CircularProgress size={16} /> : <Upload size={16} />}
                      sx={{ borderRadius: '10px', textTransform: 'none', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' }}
                    >
                      {uploadingPhoto === 'back' ? 'Subiendo...' : 'Subir Foto'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])}
                      />
                    </Button>
                    <TextField
                      size="small"
                      placeholder="o URL https://..."
                      value={photoBack}
                      onChange={(e) => setPhotoBack(e.target.value)}
                      fullWidth
                    />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Submit Action Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}
            className="apple-button-primary"
            sx={{
              py: 1.8,
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {loading ? 'Enviando Reporte...' : 'Enviar Reporte al Entrenador'}
          </Button>
        </Stack>
      </form>

      {/* Silhouette Guide Modal */}
      <Dialog
        open={silhouetteModalOpen}
        onClose={() => setSilhouetteModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'apple-card',
          sx: {
            borderRadius: '18px',
            p: 1.5,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.2, color: '#FFFFFF' }}>
          <Camera size={20} color="#007AFF" />
          Guía de Encuadre y Postura
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
            Para una comparación visual exacta y continua:
          </Typography>

          <Stack spacing={1.5}>
            <Box sx={{ p: 1.8, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="subtitle2" fontWeight="700" color="#007AFF" gutterBottom>
                1. Misma Iluminación y Distancia
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Coloca la cámara a la altura del ombligo (aprox. 1m de altura) a unos 2.5m de distancia con luz uniforme.
              </Typography>
            </Box>

            <Box sx={{ p: 1.8, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="subtitle2" fontWeight="700" color="#34C759" gutterBottom>
                2. Misma Ropa Deportiva
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Usa ropa ajustada similar en cada registro para que el contorno y tono muscular sean comparables.
              </Typography>
            </Box>

            <Box sx={{ p: 1.8, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="subtitle2" fontWeight="700" color="#FF9500" gutterBottom>
                3. Postura Neutra
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Brazos en cruz horizontales, respiración natural sin forzar ni meter el abdomen de manera extrema.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setSilhouetteModalOpen(false)}
            className="apple-button-primary"
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              px: 3,
            }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientProgressSubmitPage;
