import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Divider,
  Input
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { WeeklyTracking, CreateWeeklyTrackingData, UpdateWeeklyTrackingData, SLEEP_QUALITY_OPTIONS } from '../../types/WeeklyTracking';
import { weeklyTrackingService } from '../../services/weeklyTrackingService';

interface WeeklyTrackingFormProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  weekStartDate: string;
  onSave: () => void;
}

const WeeklyTrackingForm: React.FC<WeeklyTrackingFormProps> = ({
  open,
  onClose,
  userId,
  weekStartDate,
  onSave
}) => {
  const [formData, setFormData] = useState<CreateWeeklyTrackingData>({
    user_id: userId,
    week_start_date: weekStartDate,
    weight: undefined,
    weight_photo_url: '',
    chest_measurement: undefined,
    waist_measurement: undefined,
    hip_measurement: undefined,
    thigh_measurement: undefined,
    bicep_measurement: undefined,
    diet_difficulties: '',
    exercise_difficulties: '',
    bowel_movements_per_week: undefined,
    daily_water_intake: undefined,
    sleep_quality: undefined,
    training_days_completed: undefined,
    diet_deviations: '',
    self_rating: undefined
  });
  const [existingTracking, setExistingTracking] = useState<WeeklyTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weightPhotoFile, setWeightPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (open && userId && weekStartDate) {
      loadExistingTracking();
    }
  }, [open, userId, weekStartDate]);

  const loadExistingTracking = async () => {
    try {
      setLoading(true);
      const tracking = await weeklyTrackingService.getByUserIdAndDate(userId, weekStartDate);
      if (tracking) {
        setExistingTracking(tracking);
        setFormData({
          user_id: userId,
          week_start_date: weekStartDate,
          weight: tracking.weight,
          weight_photo_url: tracking.weight_photo_url || '',
          chest_measurement: tracking.chest_measurement,
          waist_measurement: tracking.waist_measurement,
          hip_measurement: tracking.hip_measurement,
          thigh_measurement: tracking.thigh_measurement,
          bicep_measurement: tracking.bicep_measurement,
          diet_difficulties: tracking.diet_difficulties || '',
          exercise_difficulties: tracking.exercise_difficulties || '',
          bowel_movements_per_week: tracking.bowel_movements_per_week,
          daily_water_intake: tracking.daily_water_intake,
          sleep_quality: tracking.sleep_quality,
          training_days_completed: tracking.training_days_completed,
          diet_deviations: tracking.diet_deviations || '',
          self_rating: tracking.self_rating
        });
      } else {
        setFormData({
          user_id: userId,
          week_start_date: weekStartDate,
          weight: undefined,
          weight_photo_url: '',
          chest_measurement: undefined,
          waist_measurement: undefined,
          hip_measurement: undefined,
          thigh_measurement: undefined,
          bicep_measurement: undefined,
          diet_difficulties: '',
          exercise_difficulties: '',
          bowel_movements_per_week: undefined,
          daily_water_intake: undefined,
          sleep_quality: undefined,
          training_days_completed: undefined,
          diet_deviations: '',
          self_rating: undefined
        });
      }
    } catch (error: any) {
      console.error('Error al cargar seguimiento semanal:', error);
      setError('Error al cargar el seguimiento semanal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateWeeklyTrackingData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'weight' || 
              field === 'chest_measurement' || 
              field === 'waist_measurement' || 
              field === 'hip_measurement' || 
              field === 'thigh_measurement' || 
              field === 'bicep_measurement' ||
              field === 'daily_water_intake' ||
              field === 'bowel_movements_per_week' ||
              field === 'training_days_completed' ||
              field === 'self_rating'
              ? (value === '' ? undefined : Number(value))
              : value
    }));
  };

  const handleSelectChange = (field: keyof CreateWeeklyTrackingData) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleWeightPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const result = await weeklyTrackingService.uploadWeightPhoto(file);
      setFormData(prev => ({
        ...prev,
        weight_photo_url: result.url
      }));
      setWeightPhotoFile(file);
    } catch (error: any) {
      console.error('Error al subir foto de peso:', error);
      setError('Error al subir la foto de peso');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (existingTracking) {
        // Actualizar seguimiento existente
        const updateData: UpdateWeeklyTrackingData = {
          weight: formData.weight,
          weight_photo_url: formData.weight_photo_url,
          chest_measurement: formData.chest_measurement,
          waist_measurement: formData.waist_measurement,
          hip_measurement: formData.hip_measurement,
          thigh_measurement: formData.thigh_measurement,
          bicep_measurement: formData.bicep_measurement,
          diet_difficulties: formData.diet_difficulties,
          exercise_difficulties: formData.exercise_difficulties,
          bowel_movements_per_week: formData.bowel_movements_per_week,
          daily_water_intake: formData.daily_water_intake,
          sleep_quality: formData.sleep_quality,
          training_days_completed: formData.training_days_completed,
          diet_deviations: formData.diet_deviations,
          self_rating: formData.self_rating
        };
        await weeklyTrackingService.update(existingTracking.id, updateData);
      } else {
        // Crear nuevo seguimiento
        await weeklyTrackingService.create(formData);
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar seguimiento semanal:', error);
      setError('Error al guardar el seguimiento semanal');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      user_id: userId,
      week_start_date: weekStartDate,
      weight: undefined,
      weight_photo_url: '',
      chest_measurement: undefined,
      waist_measurement: undefined,
      hip_measurement: undefined,
      thigh_measurement: undefined,
      bicep_measurement: undefined,
      diet_difficulties: '',
      exercise_difficulties: '',
      bowel_movements_per_week: undefined,
      daily_water_intake: undefined,
      sleep_quality: undefined,
      training_days_completed: undefined,
      diet_deviations: '',
      self_rating: undefined
    });
    setExistingTracking(null);
    setError(null);
    setWeightPhotoFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Seguimiento Semanal - Semana del {new Date(weekStartDate).toLocaleDateString('es-ES')}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Peso y Foto */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Scale sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Peso
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Peso (kg)"
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                        value={formData.weight || ''}
                        onChange={handleChange('weight')}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Input
                          accept="image/*"
                          id="weight-photo-upload"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={handleWeightPhotoUpload}
                        />
                        <label htmlFor="weight-photo-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<PhotoCamera />}
                            disabled={uploadingPhoto}
                          >
                            {uploadingPhoto ? 'Subiendo...' : 'Foto de Peso'}
                          </Button>
                        </label>
                        {formData.weight_photo_url && (
                          <Typography variant="body2" color="success.main">
                            ✓ Foto subida
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Medidas */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Medidas Corporales (cm)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="Pecho"
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                        value={formData.chest_measurement || ''}
                        onChange={handleChange('chest_measurement')}
                      />
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="Cintura"
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                        value={formData.waist_measurement || ''}
                        onChange={handleChange('waist_measurement')}
                      />
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="Cadera"
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                        value={formData.hip_measurement || ''}
                        onChange={handleChange('hip_measurement')}
                      />
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="Muslos"
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                        value={formData.thigh_measurement || ''}
                        onChange={handleChange('thigh_measurement')}
                      />
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="Bíceps"
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                        value={formData.bicep_measurement || ''}
                        onChange={handleChange('bicep_measurement')}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Dificultades */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dificultades con la Dieta"
                multiline
                rows={3}
                value={formData.diet_difficulties}
                onChange={handleChange('diet_difficulties')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dificultades con el Ejercicio"
                multiline
                rows={3}
                value={formData.exercise_difficulties}
                onChange={handleChange('exercise_difficulties')}
              />
            </Grid>

            {/* Hábitos */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hábitos Semanales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        label="Deposiciones por Semana"
                        type="number"
                        inputProps={{ min: 0 }}
                        value={formData.bowel_movements_per_week || ''}
                        onChange={handleChange('bowel_movements_per_week')}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        label="Agua Diaria (litros)"
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                        value={formData.daily_water_intake || ''}
                        onChange={handleChange('daily_water_intake')}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Calidad del Sueño</InputLabel>
                        <Select
                          value={formData.sleep_quality || ''}
                          onChange={handleSelectChange('sleep_quality')}
                        >
                          {SLEEP_QUALITY_OPTIONS.map(option => (
                            <MenuItem key={option.key} value={option.key}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        label="Días de Entrenamiento"
                        type="number"
                        inputProps={{ min: 0, max: 7 }}
                        value={formData.training_days_completed || ''}
                        onChange={handleChange('training_days_completed')}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Desvíos y Autoevaluación */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Saltos de Dieta (especificar qué cosas y cuántos)"
                multiline
                rows={3}
                value={formData.diet_deviations}
                onChange={handleChange('diet_deviations')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Autoevaluación (1-10)"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={formData.self_rating || ''}
                onChange={handleChange('self_rating')}
                helperText="Nota del 1 al 10 sobre la ejecución de las pautas"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WeeklyTrackingForm;
