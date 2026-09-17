import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControlLabel,
  Switch
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
  Unlock,
  RefreshCw
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
  const [canResetInitial, setCanResetInitial] = useState(false);
  const [isResettingBaseline, setIsResettingBaseline] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPhotos, setUserPhotos] = useState<ClientProgressPhoto[]>([]);
  const [pastTrackings, setPastTrackings] = useState<WeeklyTracking[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const [silhouetteModalOpen, setSilhouetteModalOpen] = useState(false);

  const [form, setForm] = useState({
    weight: '' as number | '',
    chest_measurement: '' as number | '',
    waist_measurement: '' as number | '',
    hip_measurement: '' as number | '',
    thigh_measurement: '' as number | '',
    bicep_measurement: '' as number | '',
    exercise_difficulties: '',
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
      const isUnlocked = Boolean(user.can_reset_initial_photos);
      setCanResetInitial(isUnlocked);
      setIsResettingBaseline(isUnlocked);

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
      const res = await clientProgressPhotoService.uploadPhoto(file);
      if (angle === 'front') setPhotoFront(res.url);
      if (angle === 'side') setPhotoSide(res.url);
      if (angle === 'back') setPhotoBack(res.url);
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
      const todayDate = new Date().toISOString().split('T')[0];

      // MODO 1: Si está desbloqueado por el entrenador y el cliente quiere actualizar fotos iniciales (Antes)
      if (canResetInitial && isResettingBaseline) {
        const baselinePhotos: any[] = [];
        if (photoFront) {
          baselinePhotos.push({
            user_id: userId,
            photo_type: 'front_arms_cross',
            photo_url: photoFront,
            photo_date: todayDate,
          });
        }
        if (photoSide) {
          baselinePhotos.push({
            user_id: userId,
            photo_type: 'side_arms_front',
            photo_url: photoSide,
            photo_date: todayDate,
          });
        }
        if (photoBack) {
          baselinePhotos.push({
            user_id: userId,
            photo_type: 'back_arms_cross',
            photo_url: photoBack,
            photo_date: todayDate,
          });
        }

        if (baselinePhotos.length === 0) {
          setError('Por favor, sube al menos 1 foto para guardar tu nueva línea base de referencia.');
          setLoading(false);
          return;
        }

        await clientProgressPhotoService.resetBaseline(userId, baselinePhotos);
        setCanResetInitial(false);
        setIsResettingBaseline(false);
        setSubmitted(true);
        await loadUserData();
        return;
      }

      // MODO 2: Reporte semanal estándar (Check-in de progreso)
      const trackingPayload: Partial<WeeklyTracking> = {
        user_id: userId,
        weight: form.weight ? Number(form.weight) : undefined,
        chest_measurement: form.chest_measurement ? Number(form.chest_measurement) : undefined,
        waist_measurement: form.waist_measurement ? Number(form.waist_measurement) : undefined,
        hip_measurement: form.hip_measurement ? Number(form.hip_measurement) : undefined,
        thigh_measurement: form.thigh_measurement ? Number(form.thigh_measurement) : undefined,
        bicep_measurement: form.bicep_measurement ? Number(form.bicep_measurement) : undefined,
        exercise_difficulties: form.exercise_difficulties || undefined,
        date: todayDate,
      };

      const tracking = await weeklyTrackingService.create(trackingPayload);

      const photoPromises: Promise<any>[] = [];
      if (photoFront) {
        photoPromises.push(
          clientProgressPhotoService.create({
            user_id: userId,
            photo_type: 'front_arms_cross',
            photo_url: photoFront,
            photo_date: todayDate,
          })
        );
      }
      if (photoSide) {
        photoPromises.push(
          clientProgressPhotoService.create({
            user_id: userId,
            photo_type: 'side_arms_front',
            photo_url: photoSide,
            photo_date: todayDate,
          })
        );
      }
      if (photoBack) {
        photoPromises.push(
          clientProgressPhotoService.create({
            user_id: userId,
            photo_type: 'back_arms_cross',
            photo_url: photoBack,
            photo_date: todayDate,
          })
        );
      }

      await Promise.all(photoPromises);
      setSubmitted(true);
      await loadUserData();
    } catch (err: any) {
      console.error('Error enviando progreso:', err);
      setError(err.message || 'Error al enviar el reporte semanal');
    } finally {
      setLoading(false);
    }
  };

  const previousWeight = pastTrackings.length > 0 && pastTrackings[0].weight ? pastTrackings[0].weight : null;
  const weightDiff = form.weight && previousWeight ? Number(form.weight) - previousWeight : null;

  if (submitted) {
    return (
      <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 640, mx: 'auto', textAlign: 'center', mt: 4 }}>
        <Box
          className="apple-card"
          sx={{
            p: { xs: 3.5, sm: 5 },
            border: '0.5px solid rgba(52, 199, 89, 0.4)',
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
              border: '1px solid rgba(52, 199, 89, 0.3)',
            }}
          >
            <CheckCircle2 size={36} color="#34C759" />
          </Box>
          <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#FFFFFF', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            {isResettingBaseline ? 'Línea de Base Inicial Actualizada' : 'Reporte de Progreso Enviado'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.65)', mb: 3.5, lineHeight: 1.6 }}>
            {isResettingBaseline
              ? 'Tus fotos iniciales de referencia (Antes) han sido reemplazadas correctamente. A partir de ahora servirán como punto de partida.'
              : 'Tus medidas antropométricas y fotos han sido sincronizadas. Tu entrenador revisará el progreso para ajustar tus cargas y pautas.'}
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
                py: 1.2,
              }}
            >
              Volver a Mi Panel
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSubmitted(false);
                setPhotoFront('');
                setPhotoSide('');
                setPhotoBack('');
              }}
              sx={{
                borderRadius: '12px',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                py: 1.2,
              }}
            >
              Nuevo Registro
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 1100, mx: 'auto', pb: 8 }}>
      {/* Header Apple Inset Grouped */}
      <Box
        className="apple-card"
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          background: 'linear-gradient(180deg, #1C1C1E 0%, #161618 100%)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" spacing={1.2} alignItems="center" mb={1} flexWrap="wrap">
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
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, color: '#FFFFFF', fontSize: { xs: '1.4rem', sm: '1.85rem' } }}>
              Reporte de Biometría & Fotos
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 680, fontSize: '0.85rem' }}>
              Hola {userName || 'Atleta'}. Registra tus medidas y fotos para que tu entrenador calibre tus calorías y cargas de entrenamiento.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => setSilhouetteModalOpen(true)}
            startIcon={<Camera size={15} />}
            sx={{
              borderRadius: '12px',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.8rem',
              py: 0.7,
              px: 1.8,
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

      {/* Trainer Baseline Re-upload Alert Banner */}
      {canResetInitial && (
        <Box
          className="apple-card"
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(6, 182, 212, 0.12) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.15)',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>
            <Box display="flex" alignItems="flex-start" gap={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                }}
              >
                <Unlock size={18} color="#f59e0b" />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#fbbf24', fontSize: '0.9rem' }}>
                  Re-subida de Fotos Iniciales (Antes) Desbloqueada por tu Entrenador
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 0.3 }}>
                  Tu entrenador ha habilitado esta opción por si subiste tus primeras fotos borrosas o con mala postura. Las fotos que envíes sustituirán tu referencia inicial (Antes).
                </Typography>
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={isResettingBaseline}
                  onChange={(e) => setIsResettingBaseline(e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.78rem' }}>
                  Modo: Guardar como Antes (Inicio)
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>
        </Box>
      )}

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
              p: { xs: 2, sm: 3 },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
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
                    flexShrink: 0,
                  }}
                >
                  <Scale size={18} color="#34C759" />
                </Box>
                <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
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
                    fontSize: '0.7rem',
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
                  required={!isResettingBaseline}
                  placeholder="ej. 75.4"
                  helperText={previousWeight ? `Último peso: ${previousWeight} kg` : 'Pésate en ayunas al levantarte'}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
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

              <Grid size={{ xs: 12, sm: 6 }}>
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

              <Grid size={{ xs: 12, sm: 6 }}>
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

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Molestias Musculares o Articulares (Opcional)"
                  multiline
                  rows={2}
                  value={form.exercise_difficulties}
                  onChange={handleChange('exercise_difficulties')}
                  fullWidth
                  placeholder="¿Algún dolor muscular o molestia articular durante la semana?"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Card 2: Fotos de Progreso Corporal (3 Ángulos) */}
          <Box
            className="apple-card"
            sx={{
              p: { xs: 2, sm: 3 },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
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
                    flexShrink: 0,
                  }}
                >
                  <Camera size={18} color="#AF52DE" />
                </Box>
                <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                  {isResettingBaseline ? 'Nuevas Fotos Iniciales (3 Ángulos)' : 'Fotos de Progreso (3 Ángulos)'}
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
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF', mb: 1, fontSize: '0.85rem' }}>
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

                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    fullWidth
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
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF', mb: 1, fontSize: '0.85rem' }}>
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

                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    fullWidth
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
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF', mb: 1, fontSize: '0.85rem' }}>
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

                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    fullWidth
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
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : isResettingBaseline ? <RefreshCw size={18} /> : <Send size={18} />}
            className="apple-button-primary"
            sx={{
              py: 1.6,
              borderRadius: '14px',
              fontSize: '0.98rem',
              fontWeight: 700,
              textTransform: 'none',
              background: isResettingBaseline
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : undefined,
            }}
          >
            {loading
              ? 'Enviando...'
              : isResettingBaseline
              ? 'Guardar Nuevas Fotos de Referencia (Antes)'
              : 'Enviar Reporte al Entrenador'}
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
            Para una comparación milimétrica y precisa:
          </Typography>

          <Stack spacing={1.5}>
            <Box sx={{ p: 1.8, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="subtitle2" fontWeight="700" color="#007AFF" gutterBottom>
                1. Misma Iluminación y Distancia
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Coloca la cámara a la altura del pecho/ombligo (aprox. 1m de altura) a unos 2.5m de distancia con luz frontal uniforme.
              </Typography>
            </Box>

            <Box sx={{ p: 1.8, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="subtitle2" fontWeight="700" color="#34C759" gutterBottom>
                2. Misma Ropa Deportiva
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Usa la misma ropa ajustada en cada sesión para que los perímetros musculares sean visualmente contrastables.
              </Typography>
            </Box>

            <Box sx={{ p: 1.8, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="subtitle2" fontWeight="700" color="#FF9500" gutterBottom>
                3. Postura Neutra
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Brazos en cruz horizontales, respiración natural y postura erguida sin forzar ángulos artificiales.
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
