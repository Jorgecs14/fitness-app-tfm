import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  Rating,
  Alert,
  Stack,
  Divider,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '../utils/iconify';
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

      // Load user previous photos & trackings
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

  // Handle direct file upload for photos
  const handleFileUpload = async (angle: 'front' | 'side' | 'back', file: File) => {
    try {
      setUploadingPhoto(angle);
      const res = await clientProgressPhotoService.uploadPhoto(file);
      if (res && res.url) {
        if (angle === 'front') setPhotoFront(res.url);
        if (angle === 'side') setPhotoSide(res.url);
        if (angle === 'back') setPhotoBack(res.url);
      }
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError('Error al subir archivo de imagen. Puedes introducir la URL manualmente.');
    } finally {
      setUploadingPhoto(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Guardar el seguimiento semanal
      await weeklyTrackingService.create({
        user_id: userId,
        week_start_date: today,
        weight: form.weight ? Number(form.weight) : undefined,
        weight_photo_url: form.weight_photo_url || undefined,
        chest_measurement: form.chest_measurement ? Number(form.chest_measurement) : undefined,
        waist_measurement: form.waist_measurement ? Number(form.waist_measurement) : undefined,
        hip_measurement: form.hip_measurement ? Number(form.hip_measurement) : undefined,
        thigh_measurement: form.thigh_measurement ? Number(form.thigh_measurement) : undefined,
        bicep_measurement: form.bicep_measurement ? Number(form.bicep_measurement) : undefined,
        diet_difficulties: form.diet_difficulties,
        exercise_difficulties: form.exercise_difficulties,
        bowel_movements_per_week: Number(form.bowel_movements_per_week),
        daily_water_intake: Number(form.daily_water_intake),
        sleep_quality: form.sleep_quality as any,
        training_days_completed: Number(form.training_days_completed),
        diet_deviations: form.diet_deviations,
        self_rating: Number(form.self_rating),
      });

      // 2. Guardar fotos de progreso si se adjuntaron
      if (photoFront) {
        await clientProgressPhotoService.create({
          user_id: userId,
          photo_type: 'front_arms_cross',
          photo_url: photoFront,
          photo_date: today,
        });
      }
      if (photoSide) {
        await clientProgressPhotoService.create({
          user_id: userId,
          photo_type: 'side_arms_front',
          photo_url: photoSide,
          photo_date: today,
        });
      }
      if (photoBack) {
        await clientProgressPhotoService.create({
          user_id: userId,
          photo_type: 'back_arms_cross',
          photo_url: photoBack,
          photo_date: today,
        });
      }

      setLoading(false);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError('Error al enviar reporte de progreso. Intenta de nuevo.');
      setLoading(false);
    }
  };

  // Last logged weight for comparison
  const previousWeight = pastTrackings.length > 0 && pastTrackings[0].weight ? pastTrackings[0].weight : null;
  const weightDiff = form.weight && previousWeight ? Number(form.weight) - previousWeight : null;

  if (submitted) {
    return (
      <Box sx={{ p: 4, maxWidth: 640, mx: 'auto', textAlign: 'center', mt: 4 }}>
        <Box
          className="liquid-glass-card"
          sx={{
            p: 5,
            borderRadius: 4,
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
            }}
          >
            <Iconify icon="solar:check-circle-bold" width={40} sx={{ color: '#10b981' }} />
          </Box>
          <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#fff' }}>
            ¡Reporte Semanal Enviado!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
            Tus datos antropométricos, fotos de progreso y hábitos han sido sincronizados en la nube. Tu Entrenador Personal ha sido notificado para su revisión.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard/client-home')}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                borderRadius: '24px',
                fontWeight: 700,
                px: 3,
              }}
            >
              Volver a Mi Panel
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setSubmitted(false)}
              sx={{
                borderRadius: '24px',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'text.primary',
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
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, mx: 'auto' }}>
      {/* Liquid Glass Hero Header */}
      <Box
        className="liquid-glass-card"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Chip
                label="Check-in Semanal"
                size="small"
                sx={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: '#22d3ee',
                  fontWeight: 700,
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
              Reporte de Progreso y Biometría
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700 }}>
              Hola {userName || 'Atleta'}. Registra tus medidas corporales, fotos y sensaciones de la semana para que tu entrenador ajuste tus calorías y cargas de entrenamiento.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => setSilhouetteModalOpen(true)}
            startIcon={<Iconify icon="solar:camera-bold" />}
            sx={{
              borderRadius: '24px',
              borderColor: 'rgba(6, 182, 212, 0.4)',
              color: '#22d3ee',
              background: 'rgba(6, 182, 212, 0.08)',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(6, 182, 212, 0.2)',
                borderColor: '#22d3ee',
              },
            }}
          >
            Guía de Postura Fotográfica
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      {/* Embedded Before / After Visual Comparison Slider */}
      <Box sx={{ mb: 4 }}>
        <BeforeAfterSlider photos={userPhotos} />
      </Box>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3.5}>
          {/* Card 1: Peso y Medidas Corporales */}
          <Box
            className="liquid-glass-card"
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:scale-bold" width={20} sx={{ color: '#10b981' }} />
                </Box>
                <Typography variant="h6" fontWeight="800">
                  Peso Corporal y Perímetros (cm)
                </Typography>
              </Box>

              {weightDiff !== null && (
                <Chip
                  label={`Variación: ${weightDiff > 0 ? `+${weightDiff.toFixed(1)}` : weightDiff.toFixed(1)} kg`}
                  color={weightDiff <= 0 ? 'success' : 'warning'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Peso Actual en Báscula (kg)"
                  type="number"
                  inputProps={{ step: '0.1' }}
                  value={form.weight}
                  onChange={handleChange('weight')}
                  fullWidth
                  required
                  placeholder="ej. 75.4"
                  helperText={previousWeight ? `Último peso registrado: ${previousWeight} kg` : 'Pésate en ayunas tras levantarte'}
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
            className="liquid-glass-card"
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:cup-star-bold" width={20} sx={{ color: '#3b82f6' }} />
              </Box>
              <Typography variant="h6" fontWeight="800">
                Hábitos, Sueño y Adherencia Semanal
              </Typography>
            </Box>

            <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Calidad del Sueño y Descanso"
                  value={form.sleep_quality}
                  onChange={handleChange('sleep_quality')}
                  fullWidth
                >
                  <MenuItem value="good">🌙 Bueno (Sueño profundo y reparador)</MenuItem>
                  <MenuItem value="regular">⛅ Regular (Interrupciones ocasionales)</MenuItem>
                  <MenuItem value="bad">⚡ Malo (Insomnio / Cansancio acumulado)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Días Entrenados de la Semana"
                  type="number"
                  inputProps={{ min: 0, max: 7 }}
                  value={form.training_days_completed}
                  onChange={handleChange('training_days_completed')}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Consumo Medio de Agua (Litros/día)"
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
                    borderRadius: 2.5,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  <Typography variant="body2" fontWeight="600">
                    Autoevaluación de Compromiso y Adherencia (1 - 10)
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
                  placeholder="¿Tuviste hambre excesiva, comidas fuera de plan o antojos?"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Molestias Musculares, Articulares o Notas de Entreno"
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
            className="liquid-glass-card"
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '12px',
                    background: 'rgba(244, 63, 94, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:camera-bold" width={20} sx={{ color: '#f43f5e' }} />
                </Box>
                <Typography variant="h6" fontWeight="800">
                  Fotos de Progreso (3 Ángulos Clave)
                </Typography>
              </Box>

              <Button
                size="small"
                variant="outlined"
                onClick={() => setSilhouetteModalOpen(true)}
                startIcon={<Iconify icon="solar:eye-bold" />}
                sx={{
                  borderRadius: '16px',
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  color: 'text.secondary',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                Ver Siluetas Guía
              </Button>
            </Box>

            <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            <Grid container spacing={3}>
              {/* Front Photo */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" gutterBottom>
                    🥋 Frente (Brazos en Cruz)
                  </Typography>

                  {photoFront ? (
                    <Box sx={{ position: 'relative', width: '100%', height: 180, mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
                      <Box component="img" src={photoFront} alt="Frente" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <IconButton
                        size="small"
                        onClick={() => setPhotoFront('')}
                        sx={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 180,
                        mb: 1.5,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <Iconify icon="solar:user-bold" width={36} sx={{ color: 'text.secondary', opacity: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                      startIcon={uploadingPhoto === 'front' ? <CircularProgress size={16} /> : <Iconify icon="solar:upload-minimalistic-bold" />}
                      sx={{ borderRadius: '16px', textTransform: 'none' }}
                    >
                      {uploadingPhoto === 'front' ? 'Subiendo...' : 'Subir Archivo'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])}
                      />
                    </Button>
                    <TextField
                      size="small"
                      placeholder="o pega URL https://..."
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
                    borderRadius: 3,
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" gutterBottom>
                    🚶 Perfil (Brazos al Frente)
                  </Typography>

                  {photoSide ? (
                    <Box sx={{ position: 'relative', width: '100%', height: 180, mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
                      <Box component="img" src={photoSide} alt="Perfil" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <IconButton
                        size="small"
                        onClick={() => setPhotoSide('')}
                        sx={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 180,
                        mb: 1.5,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <Iconify icon="solar:walking-bold" width={36} sx={{ color: 'text.secondary', opacity: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                      startIcon={uploadingPhoto === 'side' ? <CircularProgress size={16} /> : <Iconify icon="solar:upload-minimalistic-bold" />}
                      sx={{ borderRadius: '16px', textTransform: 'none' }}
                    >
                      {uploadingPhoto === 'side' ? 'Subiendo...' : 'Subir Archivo'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('side', e.target.files[0])}
                      />
                    </Button>
                    <TextField
                      size="small"
                      placeholder="o pega URL https://..."
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
                    borderRadius: 3,
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="700" gutterBottom>
                    🏋️ Espalda (Brazos en Cruz)
                  </Typography>

                  {photoBack ? (
                    <Box sx={{ position: 'relative', width: '100%', height: 180, mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
                      <Box component="img" src={photoBack} alt="Espalda" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <IconButton
                        size="small"
                        onClick={() => setPhotoBack('')}
                        sx={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 180,
                        mb: 1.5,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <Iconify icon="solar:dumbbell-large-minimalistic-bold" width={36} sx={{ color: 'text.secondary', opacity: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                      startIcon={uploadingPhoto === 'back' ? <CircularProgress size={16} /> : <Iconify icon="solar:upload-minimalistic-bold" />}
                      sx={{ borderRadius: '16px', textTransform: 'none' }}
                    >
                      {uploadingPhoto === 'back' ? 'Subiendo...' : 'Subir Archivo'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])}
                      />
                    </Button>
                    <TextField
                      size="small"
                      placeholder="o pega URL https://..."
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
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="solar:plain-bold" />}
            sx={{
              py: 2,
              borderRadius: '28px',
              fontSize: '1.1rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
              boxShadow: '0 8px 30px rgba(6, 182, 212, 0.4)',
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(6, 182, 212, 0.6)',
              },
            }}
          >
            {loading ? 'Enviando Reporte...' : 'Enviar Reporte y Fotos a mi Entrenador'}
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
          className: 'liquid-glass-card',
          sx: {
            borderRadius: 4,
            p: 2,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Iconify icon="solar:camera-bold" width={24} sx={{ color: '#22d3ee' }} />
          Guía de Encuadre y Postura Fotográfica
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Para que la comparación antes/después sea exacta y milimétrica, sigue estos 4 principios:
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="subtitle2" fontWeight="700" color="#22d3ee" gutterBottom>
                1. Misma Iluminación y Distancia
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Coloca la cámara siempre a la altura del ombligo (aprox. 1 metro de altura) a unos 2.5 metros de distancia. Evita luces cenitales directas que proyecten sombras artificiales.
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="subtitle2" fontWeight="700" color="#10b981" gutterBottom>
                2. Misma Ropa y Calzado
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Utiliza ropa ajustada similar en todas las tomas (pantalón corto/bañador o top deportivo) para que el contorno muscular y de cintura sea visible.
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="subtitle2" fontWeight="700" color="#f59e0b" gutterBottom>
                3. Postura Natural sin Forzar
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Extiende los brazos horizontalmente a la altura del pecho en la toma frontal y dorsal. No aprietes el abdomen ni metas tripa de forma extrema; mantén una respiración neutra.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setSilhouetteModalOpen(false)}
            sx={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              fontWeight: 700,
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
