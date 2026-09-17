
import { useState, useEffect, FormEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Product } from '../../types/Product';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  productToEdit?: Product | null;
}

export const ProductForm = ({ open, onClose, onSubmit, productToEdit }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    url: '',
    category: 'Suplementación'
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        price: productToEdit.price || 0,
        description: productToEdit.description || '',
        url: productToEdit.url || '',
        category: productToEdit.category || 'Suplementación'
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        description: '',
        url: '',
        category: 'Suplementación'
      });
    }
    setErrors([]);
  }, [productToEdit, open]);

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) newErrors.push('El nombre es obligatorio');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      name: formData.name.trim(),
      price: formData.price,
      description: formData.description.trim(),
      url: formData.url.trim() || undefined,
      category: formData.category.trim() || 'Suplementación'
    });

    onClose();
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'price' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h6" component="h2" fontWeight={700}>
            {productToEdit ? 'Editar Producto / Suplemento' : 'Nuevo Producto / Suplemento'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {errors.length > 0 && (
              <Alert severity="error">
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <TextField
              fullWidth
              label="Nombre del Producto (ej. Multivitamínico, Creatina Creapure)"
              value={formData.name}
              onChange={handleChange('name')}
              error={errors.some(e => e.includes('nombre'))}
              required
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Categoría"
                value={formData.category}
                onChange={handleChange('category')}
                placeholder="ej. Vitaminas, Proteínas, Salud"
              />

              <TextField
                fullWidth
                label="Precio Estimado"
                type="number"
                value={formData.price}
                onChange={handleChange('price')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Enlace del Producto (URL de compra ej. Amazon, MyProtein, HSN)"
              placeholder="https://..."
              value={formData.url}
              onChange={handleChange('url')}
              helperText="El cliente podrá pulsar este enlace directamente desde su plan nutricional"
            />

            <TextField
              fullWidth
              label="Descripción y Modo de Empleo"
              multiline
              rows={3}
              placeholder="Indicaciones, beneficios o pautas de dosificación..."
              value={formData.description}
              onChange={handleChange('description')}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" sx={{ ml: 1, fontWeight: 700 }}>
            {productToEdit ? 'Actualizar' : 'Guardar'} Producto
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};