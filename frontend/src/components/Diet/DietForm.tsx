import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material';
import { Diet } from '../../types/Diet';
import { User } from '../../types/User';

interface DietFormProps {
  open: boolean;
  dietToEdit?: Diet | null;
  users?: User[];
  onClose: () => void;
  onSubmit: (diet: Partial<Diet>) => void;
}

export const DietForm = ({ open, dietToEdit, onClose, onSubmit }: DietFormProps) => {
  const [formData, setFormData] = useState<Partial<Diet>>({
    name: '',
    description: '',
    calories: 2000
  });

  useEffect(() => {
    if (dietToEdit) {
      setFormData({
        name: dietToEdit.name || '',
        description: dietToEdit.description || '',
        calories: dietToEdit.calories || 2000
      });
    } else {
      setFormData({ name: '', description: '', calories: 2000 });
    }
  }, [dietToEdit, open]);

  const handleChange = (field: keyof Diet) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = field === 'calories' ? Number(e.target.value) : e.target.value;
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dietToEdit ? 'Editar Dieta' : 'Nueva Dieta'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nombre de la Dieta"
            value={formData.name || ''}
            onChange={handleChange('name')}
            fullWidth
            required
          />
          <TextField
            label="Descripción / Pautas"
            value={formData.description || ''}
            onChange={handleChange('description')}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Calorías Objetivo (Kcal/día)"
            type="number"
            value={formData.calories || ''}
            onChange={handleChange('calories')}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};