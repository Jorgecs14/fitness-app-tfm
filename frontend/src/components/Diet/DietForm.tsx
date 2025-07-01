import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';
import { Diet } from '../../types/Diet';

interface DietFormProps {
  open: boolean;
  diet?: Diet | null;
  onClose: () => void;
  onSubmit: (dietData: Omit<Diet, 'id'>) => void;
  error?: string | null;
}

export const DietForm = ({ open, diet, onClose, onSubmit, error }: DietFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
  });

  useEffect(() => {
    if (diet) {
      setFormData({
        name: diet.name || '',
        description: diet.description || '',
        calories: diet.calories !== null && diet.calories !== undefined ? diet.calories.toString() : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        calories: '',
      });
    }
  }, [diet, open]);

  const handleSubmit = () => {
    const calories = parseInt(formData.calories);
    if (isNaN(calories) || calories <= 0) {
      return;
    }

    onSubmit({
      name: formData.name,
      description: formData.description,
      calories,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {diet ? 'Editar Dieta' : 'Nueva Dieta'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            required
          />
          <TextField
            fullWidth
            label="Calorías"
            type="number"
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
            margin="normal"
            inputProps={{ min: 1 }}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || !formData.description || !formData.calories}
        >
          {diet ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};