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
  Alert
} from '@mui/material';
import { ClientMedicalInfo, CreateClientMedicalInfoData, UpdateClientMedicalInfoData } from '../../types/ClientMedicalInfo';
import { clientMedicalInfoService } from '../../services/clientMedicalInfoService';

interface ClientMedicalInfoFormProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  onSave: () => void;
}

const ClientMedicalInfoForm: React.FC<ClientMedicalInfoFormProps> = ({
  open,
  onClose,
  userId,
  onSave
}) => {
  const [formData, setFormData] = useState<CreateClientMedicalInfoData>({
    user_id: userId,
    allergies: '',
    food_intolerances: '',
    injuries_conditions: '',
    disliked_foods: '',
    lab_results: '',
    daily_nutrition_log: ''
  });
  const [existingInfo, setExistingInfo] = useState<ClientMedicalInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      loadExistingInfo();
    }
  }, [open, userId]);

  const loadExistingInfo = async () => {
    try {
      setLoading(true);
      const info = await clientMedicalInfoService.getByUserId(userId);
      if (info) {
        setExistingInfo(info);
        setFormData({
          user_id: userId,
          allergies: info.allergies || '',
          food_intolerances: info.food_intolerances || '',
          injuries_conditions: info.injuries_conditions || '',
          disliked_foods: info.disliked_foods || '',
          lab_results: info.lab_results || '',
          daily_nutrition_log: info.daily_nutrition_log || ''
        });
      }
    } catch (error: any) {
      console.error('Error al cargar información médica:', error);
      setError('Error al cargar la información médica');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateClientMedicalInfoData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (existingInfo) {
        // Actualizar información existente
        const updateData: UpdateClientMedicalInfoData = {
          allergies: formData.allergies,
          food_intolerances: formData.food_intolerances,
          injuries_conditions: formData.injuries_conditions,
          disliked_foods: formData.disliked_foods,
          lab_results: formData.lab_results,
          daily_nutrition_log: formData.daily_nutrition_log
        };
        await clientMedicalInfoService.update(existingInfo.id, updateData);
      } else {
        // Crear nueva información
        await clientMedicalInfoService.create(formData);
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar información médica:', error);
      setError('Error al guardar la información médica');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      user_id: userId,
      allergies: '',
      food_intolerances: '',
      injuries_conditions: '',
      disliked_foods: '',
      lab_results: '',
      daily_nutrition_log: ''
    });
    setExistingInfo(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {existingInfo ? 'Editar Información Médica' : 'Información Médica Inicial'}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alergias"
                placeholder="Describe cualquier alergia conocida..."
                multiline
                rows={3}
                value={formData.allergies}
                onChange={handleChange('allergies')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Intolerancias Alimentarias o Sospechas"
                placeholder="Describe intolerancias alimentarias conocidas o sospechadas..."
                multiline
                rows={3}
                value={formData.food_intolerances}
                onChange={handleChange('food_intolerances')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lesiones o Molestias"
                placeholder="Describe cualquier lesión o molestia actual..."
                multiline
                rows={3}
                value={formData.injuries_conditions}
                onChange={handleChange('injuries_conditions')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alimentos que No Le Gustan"
                placeholder="Lista de alimentos que no le gustan nada..."
                multiline
                rows={3}
                value={formData.disliked_foods}
                onChange={handleChange('disliked_foods')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Analítica (si la tiene)"
                placeholder="Resultados de analítica reciente..."
                multiline
                rows={4}
                value={formData.lab_results}
                onChange={handleChange('lab_results')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alimentación de un Día Cualquiera"
                placeholder="Describe detalladamente la alimentación de un día completo, incluyendo horarios..."
                multiline
                rows={6}
                value={formData.daily_nutrition_log}
                onChange={handleChange('daily_nutrition_log')}
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

export default ClientMedicalInfoForm;
