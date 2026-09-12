import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { clientMedicalInfoService } from '../services/clientMedicalInfoService';
import { getUser } from '../services/userService';
import { ClientMedicalInfo, CreateClientMedicalInfoData, UpdateClientMedicalInfoData } from '../types/ClientMedicalInfo';
import { User } from '../types/User';

export default function ClientMedicalInfoPage() {
  const { userId } = useParams<{ userId: string }>();
  const [medicalInfo, setMedicalInfo] = useState<ClientMedicalInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateClientMedicalInfoData | UpdateClientMedicalInfoData>({
    user_id: parseInt(userId || '0'),
    allergies: '',
    food_intolerances: '',
    injuries_conditions: '',
    disliked_foods: '',
    lab_results: '',
    daily_nutrition_log: ''
  });

  useEffect(() => {
    if (userId) {
      loadUserAndMedicalInfo();
    }
  }, [userId]);

  const loadUserAndMedicalInfo = async () => {
    try {
      setLoading(true);
      const userIdNum = parseInt(userId || '0');
      
      // Cargar información del usuario
      const userData = await getUser(userIdNum);
      setUser(userData);

      // Cargar información médica
      const medicalData = await clientMedicalInfoService.getByUserId(userIdNum);
      setMedicalInfo(medicalData);

      if (medicalData) {
        setFormData({
          allergies: medicalData.allergies || '',
          food_intolerances: medicalData.food_intolerances || '',
          injuries_conditions: medicalData.injuries_conditions || '',
          disliked_foods: medicalData.disliked_foods || '',
          lab_results: medicalData.lab_results || '',
          daily_nutrition_log: medicalData.daily_nutrition_log || ''
        });
      } else {
        // Si no existe información médica, preparar para crear una nueva
        setIsEditing(true);
        setFormData({
          user_id: userIdNum,
          allergies: '',
          food_intolerances: '',
          injuries_conditions: '',
          disliked_foods: '',
          lab_results: '',
          daily_nutrition_log: ''
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (medicalInfo) {
        // Actualizar información existente
        const updatedInfo = await clientMedicalInfoService.update(medicalInfo.id, formData as UpdateClientMedicalInfoData);
        setMedicalInfo(updatedInfo);
        setSuccess('Información médica actualizada correctamente');
      } else {
        // Crear nueva información médica
        const newInfo = await clientMedicalInfoService.create(formData as CreateClientMedicalInfoData);
        setMedicalInfo(newInfo);
        setSuccess('Información médica creada correctamente');
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving medical info:', error);
      setError('Error al guardar la información médica');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (medicalInfo) {
      setFormData({
        allergies: medicalInfo.allergies || '',
        food_intolerances: medicalInfo.food_intolerances || '',
        injuries_conditions: medicalInfo.injuries_conditions || '',
        disliked_foods: medicalInfo.disliked_foods || '',
        lab_results: medicalInfo.lab_results || '',
        daily_nutrition_log: medicalInfo.daily_nutrition_log || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Cargando información médica...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Información Médica del Cliente
      </Typography>

      {user && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">{user.name} {user.surname}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Datos Médicos</Typography>
            {!isEditing && medicalInfo && (
              <Button variant="outlined" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Alergias"
                value={formData.allergies || ''}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                disabled={!isEditing}
                multiline
                rows={3}
                helperText="Describe las alergias conocidas del cliente"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Intolerancias Alimentarias"
                value={formData.food_intolerances || ''}
                onChange={(e) => handleInputChange('food_intolerances', e.target.value)}
                disabled={!isEditing}
                multiline
                rows={3}
                helperText="Intolerancias a alimentos específicos"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Lesiones o Condiciones Médicas"
                value={formData.injuries_conditions || ''}
                onChange={(e) => handleInputChange('injuries_conditions', e.target.value)}
                disabled={!isEditing}
                multiline
                rows={3}
                helperText="Lesiones, condiciones médicas, limitaciones físicas"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Alimentos que No Le Gustan"
                value={formData.disliked_foods || ''}
                onChange={(e) => handleInputChange('disliked_foods', e.target.value)}
                disabled={!isEditing}
                multiline
                rows={3}
                helperText="Alimentos que el cliente prefiere evitar"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Resultados de Laboratorio"
                value={formData.lab_results || ''}
                onChange={(e) => handleInputChange('lab_results', e.target.value)}
                disabled={!isEditing}
                multiline
                rows={4}
                helperText="Resultados de análisis médicos relevantes"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Registro Nutricional Diario"
                value={formData.daily_nutrition_log || ''}
                onChange={(e) => handleInputChange('daily_nutrition_log', e.target.value)}
                disabled={!isEditing}
                multiline
                rows={4}
                helperText="Notas sobre el registro diario de nutrición del cliente"
              />
            </Grid>
          </Grid>

          {isEditing && (
            <Box display="flex" gap={2} mt={3}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
            </Box>
          )}

          {medicalInfo && !isEditing && (
            <Box mt={3}>
              <Typography variant="body2" color="text.secondary">
                Última actualización: {new Date(medicalInfo.updated_at).toLocaleString()}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
