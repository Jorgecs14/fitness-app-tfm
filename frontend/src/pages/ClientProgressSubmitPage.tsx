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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '../utils/iconify';
import { getCurrentUser } from '../services/userService';
import { weeklyTrackingService } from '../services/weeklyTrackingService';
import { clientProgressPhotoService } from '../services/clientProgressPhotoService';

export const ClientProgressSubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    getCurrentUser().then((u) => setUserId(u.id));
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Guardar el seguimiento semanal
      const today = new Date().toISOString().split('T')[0];
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

  if (submitted) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h3" gutterBottom>
            🎉
          </Typography>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="success.main">
            ¡Reporte Semanal Enviado con Éxito!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Tu Entrenador Personal ha recibido tu actualización de peso, fotos y hábitos. Revisará tus datos a la brevedad.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard/client-home')}>
            Volver a Mi Panel
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📸 Reporte de Progreso Semanal
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Envía tus datos corporales y fotos directamente a tu Entrenador Personal.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Peso y Medidas Corporales */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚖️ Peso Corporal y Perímetros (Medidas en cm)
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Peso Actual en la Báscula (kg)"
                    type="number"
                    value={form.weight}
                    onChange={handleChange('weight')}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="URL de Foto del Peso (Opcional)"
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
                    value={form.chest_measurement}
                    onChange={handleChange('chest_measurement')}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Cintura (cm)"
                    type="number"
                    value={form.waist_measurement}
                    onChange={handleChange('waist_measurement')}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Cadera (cm)"
                    type="number"
                    value={form.hip_measurement}
                    onChange={handleChange('hip_measurement')}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Muslos (cm)"
                    type="number"
                    value={form.thigh_measurement}
                    onChange={handleChange('thigh_measurement')}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Bíceps (cm)"
                    type="number"
                    value={form.bicep_measurement}
                    onChange={handleChange('bicep_measurement')}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Hábitos de la Semana */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                😴 Hábitos y Sensaciones Semanales
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Calidad del Sueño"
                    value={form.sleep_quality}
                    onChange={handleChange('sleep_quality')}
                    fullWidth
                  >
                    <MenuItem value="good">Bueno (Descanso reparador)</MenuItem>
                    <MenuItem value="regular">Regular (Interrupciones ocasionales)</MenuItem>
                    <MenuItem value="bad">Malo (Insomnio / Cansancio acumulado)</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Días Entrenados de la Semana (0 - 7)"
                    type="number"
                    value={form.training_days_completed}
                    onChange={handleChange('training_days_completed')}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Consumo Diario de Agua (Litros)"
                    type="number"
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
                  <TextField
                    label="Dificultades con la Dieta u Observaciones"
                    multiline
                    rows={2}
                    value={form.diet_difficulties}
                    onChange={handleChange('diet_difficulties')}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Dificultades con los Ejercicios o Molestias"
                    multiline
                    rows={2}
                    value={form.exercise_difficulties}
                    onChange={handleChange('exercise_difficulties')}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Fotos de Progreso Corporal (3 Ángulos) */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📷 Fotos de Progreso Corporal (URLs de imagen)
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Foto Frente (Brazos en cruz)"
                    value={photoFront}
                    onChange={(e) => setPhotoFront(e.target.value)}
                    fullWidth
                    placeholder="https://..."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Foto Lateral (Brazos al frente)"
                    value={photoSide}
                    onChange={(e) => setPhotoSide(e.target.value)}
                    fullWidth
                    placeholder="https://..."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Foto Espalda (Brazos en cruz)"
                    value={photoBack}
                    onChange={(e) => setPhotoBack(e.target.value)}
                    fullWidth
                    placeholder="https://..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="contained"
            color="success"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
            startIcon={<Iconify icon="eva:paper-plane-fill" />}
          >
            {loading ? 'Enviando a tu Entrenador...' : 'Enviar Reporte Semanal a mi Entrenador'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default ClientProgressSubmitPage;
