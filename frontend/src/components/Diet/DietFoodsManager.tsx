// Gestor de alimentos por dieta y calculadora de equivalencias calóricas (Apple Liquid Glass)
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Stack,
  Typography,
  Box,
  Grid,
  Chip,
  Collapse,
  TableContainer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  X,
  Calculator,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';
import * as foodService from '../../services/foodService';
import * as dietFoodService from '../../services/dietFoodService';
import { Food } from '../../types/Food';
import { DietFood } from '../../types/DietFood';

export interface DietFoodsManagerProps {
  open: boolean;
  diet: any;
  onClose: () => void;
  onSave: () => Promise<void>;
}

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
};

const autocompletePaperSx = {
  bgcolor: '#1C1C1E',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '14px',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
  '& .MuiAutocomplete-option': {
    fontSize: '0.88rem',
    color: '#ffffff !important',
    '&[aria-selected="true"]': {
      bgcolor: 'rgba(52, 199, 89, 0.2) !important',
    },
    '&:hover, &.Mui-focused': {
      bgcolor: 'rgba(255, 255, 255, 0.1) !important',
    },
  },
};

export const DietFoodsManager: React.FC<DietFoodsManagerProps> = ({
  open,
  diet,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('');
  const [dietFoods, setDietFoods] = useState<DietFood[]>([]);

  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodDescription, setNewFoodDescription] = useState('');
  const [newFoodCalories, setNewFoodCalories] = useState('');
  const [showNewFoodForm, setShowNewFoodForm] = useState(false);

  // Equivalencias
  const [altSourceFood, setAltSourceFood] = useState<Food | null>(null);
  const [altTargetFood, setAltTargetFood] = useState<Food | null>(null);
  const [altSourceGrams, setAltSourceGrams] = useState<number>(100);

  useEffect(() => {
    if (open && diet) {
      loadFoods();
      loadDietFoods();
    }
  }, [open, diet]);

  const loadFoods = async () => {
    try {
      const foods = await foodService.getFoods();
      setAvailableFoods(Array.isArray(foods) ? foods : (foods as any)?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDietFoods = async () => {
    if (!diet?.id) return;
    try {
      const foods = await dietFoodService.getDietFoods(diet.id);
      setDietFoods(Array.isArray(foods) ? foods : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFood = async () => {
    if (!selectedFood || !quantity || !diet?.id) return;
    try {
      await dietFoodService.addFoodToDiet(diet.id, selectedFood.id, Number(quantity));
      setSelectedFood(null);
      setQuantity('');
      loadDietFoods();
    } catch (error) {
      console.error('Error adding food to diet:', error);
    }
  };

  const handleCreateNewFood = async () => {
    if (!newFoodName || !newFoodCalories) return;

    try {
      const newFood = await foodService.createFood({
        name: newFoodName,
        description: newFoodDescription,
        calories: Number(newFoodCalories),
      });

      setAvailableFoods((prev) => [...prev, newFood]);
      setSelectedFood(newFood);
      setNewFoodName('');
      setNewFoodDescription('');
      setNewFoodCalories('');
      setShowNewFoodForm(false);
    } catch (error) {
      console.error('Error creating new food:', error);
    }
  };

  const handleRemoveFood = async (dietFoodId: number) => {
    try {
      await dietFoodService.removeFoodFromDiet(dietFoodId);
      loadDietFoods();
    } catch (e) {
      console.error(e);
    }
  };

  const calculateEquivalentGrams = () => {
    if (!altSourceFood || !altTargetFood || altSourceFood.calories === 0 || altTargetFood.calories === 0) return 0;
    const totalCaloriesSource = (altSourceFood.calories * altSourceGrams) / 100;
    return Math.round((totalCaloriesSource * 100) / altTargetFood.calories);
  };

  const totalDietCalories = dietFoods.reduce((sum, item) => {
    const cal = item.food ? (item.food.calories * item.quantity) / 100 : 0;
    return sum + cal;
  }, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#0B0B0E',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.9)',
          maxHeight: { xs: '100%', sm: '92vh' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
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
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 14px)' : 2.2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              bgcolor: 'rgba(52, 199, 89, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34C759',
              border: '1px solid rgba(52, 199, 89, 0.3)',
            }}
          >
            <UtensilsCrossed size={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }} noWrap>
              {diet?.name || 'Alimentos del Plan'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.78rem' }}>
              Total configurado: {Math.round(totalDietCalories)} kcal
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

      {/* Contenido con Scroll */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: '#0B0B0E', overflowY: 'auto' }}>
        <Stack spacing={3}>
          {/* Card Inset para Añadir Alimento */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#16161A',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34C759', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Plus size={18} /> Añadir Alimento a la Pauta
            </Typography>

            <Grid container spacing={1.8} alignItems="flex-end">
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.75, display: 'block', fontWeight: 700, fontSize: '0.82rem' }}>
                  Seleccionar Alimento
                </Typography>
                <Autocomplete
                  options={availableFoods}
                  getOptionLabel={(option) => `${option.name} (${option.calories} kcal/100g)`}
                  value={selectedFood}
                  onChange={(_, value) => setSelectedFood(value)}
                  componentsProps={{ paper: { sx: autocompletePaperSx } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Buscar alimento en catálogo..."
                      size="small"
                      sx={textFieldSx}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.75, display: 'block', fontWeight: 700, fontSize: '0.82rem' }}>
                  Cantidad (g)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  sx={textFieldSx}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddFood}
                  disabled={!selectedFood || !quantity}
                  startIcon={<Plus size={16} />}
                  sx={{
                    height: 40,
                    bgcolor: '#34C759',
                    color: '#000000',
                    fontWeight: 800,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    '&:hover': { bgcolor: '#2eb34f' },
                  }}
                >
                  Añadir
                </Button>
              </Grid>
            </Grid>

            {/* Crear nuevo alimento */}
            <Box sx={{ mt: 2 }}>
              {!showNewFoodForm ? (
                <Button
                  size="small"
                  startIcon={<Plus size={14} />}
                  onClick={() => setShowNewFoodForm(true)}
                  sx={{ color: '#007AFF', textTransform: 'none', fontSize: '0.82rem', p: 0, fontWeight: 700 }}
                >
                  ¿No encuentras el alimento? Créalo aquí
                </Button>
              ) : (
                <Collapse in={showNewFoodForm}>
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 2,
                      borderRadius: '16px',
                      bgcolor: '#1C1C20',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#007AFF', mb: 1.5, display: 'block' }}>
                      Nuevo Alimento en la Base de Datos
                    </Typography>
                    <Grid container spacing={1.5} alignItems="flex-end">
                      <Grid item xs={12} sm={5}>
                        <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 600 }}>
                          Nombre
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Nombre del alimento"
                          value={newFoodName}
                          onChange={(e) => setNewFoodName(e.target.value)}
                          sx={textFieldSx}
                        />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 600 }}>
                          Kcal / 100g
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Kcal"
                          value={newFoodCalories}
                          onChange={(e) => setNewFoodCalories(e.target.value)}
                          sx={textFieldSx}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleCreateNewFood}
                          disabled={!newFoodName || !newFoodCalories}
                          sx={{
                            height: 40,
                            bgcolor: '#007AFF',
                            color: '#ffffff',
                            fontWeight: 700,
                            borderRadius: '12px',
                            textTransform: 'none',
                          }}
                        >
                          Guardar
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              )}
            </Box>
          </Box>

          {/* Calculadora de Equivalencias Calóricas */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#16161A',
              border: '1px solid rgba(0, 122, 255, 0.25)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#007AFF', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calculator size={18} /> Calculadora de Intercambio de Alimentos
            </Typography>

            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 600 }}>
                  Alimento Original
                </Typography>
                <Autocomplete
                  options={availableFoods}
                  getOptionLabel={(o) => o.name}
                  value={altSourceFood}
                  onChange={(_, v) => setAltSourceFood(v)}
                  componentsProps={{ paper: { sx: autocompletePaperSx } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Alimento origen..."
                      size="small"
                      sx={textFieldSx}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={4} sm={2}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 600 }}>
                  Gramos
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={altSourceGrams}
                  onChange={(e) => setAltSourceGrams(Number(e.target.value))}
                  sx={textFieldSx}
                />
              </Grid>

              <Grid item xs={8} sm={4}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 600 }}>
                  Sustituir por
                </Typography>
                <Autocomplete
                  options={availableFoods}
                  getOptionLabel={(o) => o.name}
                  value={altTargetFood}
                  onChange={(_, v) => setAltTargetFood(v)}
                  componentsProps={{ paper: { sx: autocompletePaperSx } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Sustituir por..."
                      size="small"
                      sx={textFieldSx}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                {altSourceFood && altTargetFood ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 1,
                      borderRadius: '12px',
                      bgcolor: 'rgba(52, 199, 89, 0.15)',
                      border: '1px solid rgba(52, 199, 89, 0.3)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block', fontSize: '0.72rem' }}>
                      Equivale a:
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34C759' }}>
                      {calculateEquivalentGrams()} g
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', display: 'block' }}>
                    Selecciona 2 alimentos
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* Listado de Alimentos Configurados */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Layers size={18} color="#34C759" /> Alimentos del Plan ({dietFoods.length})
            </Typography>

            {dietFoods.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#16161A',
                  borderRadius: '20px',
                  border: '1px dashed rgba(255, 255, 255, 0.12)',
                }}
              >
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  No hay alimentos asignados a este plan. Añádelos arriba.
                </Typography>
              </Box>
            ) : isMobile ? (
              /* Vista Móvil: Apple Inset Cards */
              <Stack spacing={1.5}>
                {dietFoods.map((df) => {
                  const cal = df.food ? Math.round((df.food.calories * df.quantity) / 100) : 0;
                  return (
                    <Box
                      key={df.id}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: '#16161A',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                          {df.food?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {df.quantity}g • <span style={{ color: '#34C759', fontWeight: 700 }}>{cal} kcal</span>
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFood(df.id)}
                        sx={{ color: '#FF453A', bgcolor: 'rgba(255, 69, 58, 0.1)', '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.2)' } }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              /* Vista Desktop: Table Inset */
              <TableContainer
                sx={{
                  borderRadius: '20px',
                  bgcolor: '#16161A',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
                        Alimento
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
                        Cantidad
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
                        Calorías
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dietFoods.map((df) => {
                      const cal = df.food ? Math.round((df.food.calories * df.quantity) / 100) : 0;
                      return (
                        <TableRow key={df.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}>
                          <TableCell sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.06)' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                              {df.food?.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.06)' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                              {df.quantity} g
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.06)' }}>
                            <Chip
                              label={`${cal} kcal`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(52, 199, 89, 0.15)',
                                color: '#34C759',
                                fontWeight: 800,
                                fontSize: '0.74rem',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottomColor: 'rgba(255, 255, 255, 0.06)' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFood(df.id)}
                              sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.15)' } }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Stack>
      </DialogContent>

      {/* Footer Botones Apple */}
      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.2,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(22, 22, 26, 0.9)',
          backdropFilter: 'blur(20px)',
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 14px)' : 2.2,
        }}
      >
        <Button
          fullWidth
          onClick={onClose}
          sx={{
            height: 44,
            borderRadius: '12px',
            bgcolor: '#007AFF',
            color: '#ffffff',
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: '#0062cc' },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DietFoodsManager;