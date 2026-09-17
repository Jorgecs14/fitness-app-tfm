import { useState, useEffect, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  InputAdornment,
  Box,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Pill,
  X,
  Link as LinkIcon,
  ExternalLink,
  Tag,
  DollarSign,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types/Product';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  productToEdit?: Product | null;
}

const CATEGORY_PRESETS = [
  'Suplementación',
  'Proteínas',
  'Vitaminas & Minerales',
  'Pre-entreno / Energía',
  'Salud Articular',
  'Alimentación Fitness',
];

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#1C1C1E',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '0.92rem',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.14)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#34C759',
      borderWidth: '1.5px',
    },
  },
  '& input, & textarea': {
    color: '#ffffff !important',
    fontSize: '0.92rem',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.4) !important',
      opacity: 1,
    },
  },
  '& .MuiFormHelperText-root': {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: '0.78rem',
    mt: 0.5,
  },
};

export const ProductForm = ({ open, onClose, onSubmit, productToEdit }: ProductFormProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    url: '',
    category: 'Suplementación',
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        price: productToEdit.price || 0,
        description: productToEdit.description || '',
        url: productToEdit.url || '',
        category: productToEdit.category || 'Suplementación',
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        description: '',
        url: '',
        category: 'Suplementación',
      });
    }
    setErrors([]);
  }, [productToEdit, open]);

  const validateForm = () => {
    const newErrors: string[] = [];
    if (!formData.name.trim()) newErrors.push('El nombre del producto es obligatorio');
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
      category: formData.category.trim() || 'Suplementación',
    });

    onClose();
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'price' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#0B0B0E',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header Apple Liquid Glass */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(22, 22, 26, 0.9)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 149, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FF9500',
                border: '1px solid rgba(255, 149, 0, 0.3)',
              }}
            >
              <Pill size={20} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#ffffff', lineHeight: 1.2 }}>
                {productToEdit ? 'Editar Suplemento / Producto' : 'Nuevo Suplemento / Producto'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.78rem' }}>
                Podrás asociarlo y recomendarlo en cualquier dieta con su enlace de compra
              </Typography>
            </Box>
          </Stack>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#fff' },
            }}
          >
            <X size={18} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: '#0B0B0E' }}>
          <Stack spacing={2.5}>
            {errors.length > 0 && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: '14px',
                  bgcolor: 'rgba(255, 69, 58, 0.15)',
                  color: '#FF453A',
                  border: '1px solid rgba(255, 69, 58, 0.3)',
                }}
              >
                {errors.join(', ')}
              </Alert>
            )}

            {/* Nombre del producto */}
            <Box>
              <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.75, display: 'block', fontWeight: 700, fontSize: '0.82rem' }}>
                Nombre del Suplemento / Producto *
              </Typography>
              <TextField
                fullWidth
                placeholder="Ej: Multivitamínico Solaray, Creatina Creapure, Proteína Whey HSN"
                value={formData.name}
                onChange={handleChange('name')}
                error={errors.some((e) => e.includes('nombre'))}
                sx={textFieldSx}
              />
            </Box>

            {/* Categoría y Precio */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1.4 }}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.75, display: 'block', fontWeight: 700, fontSize: '0.82rem' }}>
                  Categoría
                </Typography>
                <TextField
                  fullWidth
                  placeholder="ej. Vitaminas, Proteínas, Salud"
                  value={formData.category}
                  onChange={handleChange('category')}
                  sx={textFieldSx}
                />
              </Box>

              <Box sx={{ flex: 0.8 }}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.75, display: 'block', fontWeight: 700, fontSize: '0.82rem' }}>
                  Precio Estimado
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0.00"
                  value={formData.price || ''}
                  onChange={handleChange('price')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#34C759', fontWeight: 700 }}>€</Typography></InputAdornment>,
                    inputProps: { min: 0, step: 0.01 },
                  }}
                  sx={textFieldSx}
                />
              </Box>
            </Stack>

            {/* Quick chips de categorías */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.75, display: 'block', fontWeight: 600 }}>
                Categorías sugeridas:
              </Typography>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {CATEGORY_PRESETS.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                    sx={{
                      bgcolor: formData.category === cat ? '#FF9500' : '#1C1C1E',
                      color: formData.category === cat ? '#000000' : 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: formData.category === cat ? '#FF9500' : 'rgba(255, 255, 255, 0.12)',
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* URL Enlace de Compra */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>
                  Enlace de Compra (URL)
                </Typography>
                {formData.url && formData.url.startsWith('http') && (
                  <a
                    href={formData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#007AFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <ExternalLink size={12} /> Probar enlace
                  </a>
                )}
              </Stack>
              <TextField
                fullWidth
                placeholder="https://www.amazon.es/... o HSN, Prozis, MyProtein"
                value={formData.url}
                onChange={handleChange('url')}
                helperText="El cliente podrá pulsar este enlace directamente desde su plan nutricional"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LinkIcon size={16} color="#007AFF" /></InputAdornment>,
                }}
                sx={textFieldSx}
              />
            </Box>

            {/* Descripción y Modo de Empleo */}
            <Box>
              <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.75, display: 'block', fontWeight: 700, fontSize: '0.82rem' }}>
                Descripción y Modo de Empleo
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Indicaciones, beneficios o pautas de dosificación..."
                value={formData.description}
                onChange={handleChange('description')}
                sx={textFieldSx}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            bgcolor: 'rgba(22, 22, 26, 0.9)',
            justifyContent: 'space-between',
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              borderRadius: '12px',
              color: 'rgba(255, 255, 255, 0.8)',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              fontWeight: 600,
              textTransform: 'none',
              px: 2.5,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#fff' },
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#FF9500',
              color: '#000000',
              fontWeight: 800,
              borderRadius: '12px',
              px: 3.5,
              py: 1,
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: '#e08500' },
            }}
          >
            {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};