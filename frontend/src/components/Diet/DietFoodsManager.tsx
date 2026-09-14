import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Stack, Typography,
  Box, Grid, MenuItem
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import * as foodService from '../../services/foodService';
import * as dietFoodService from '../../services/dietFoodService';
import { Food } from '../../types/Food';
import { DietFood } from '../../types/DietFood';
import { calculateFoodCalories, formatCalories } from '../../utils/dietUtils';

export interface DietFoodsManagerProps {
  open: boolean;
  diet: any;
  onClose: () => void;
  onSave: () => Promise<void>;
}

export const DietFoodsManager = ({
  open,
  diet,
  onClose,
  onSave,
}: DietFoodsManagerProps) => {
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('');
  const [dietFoods, setDietFoods] = useState<DietFood[]>([]);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodDescription, setNewFoodDescription] = useState('');
  const [newFoodCalories, setNewFoodCalories] = useState('');
  const [showNewFoodForm, setShowNewFoodForm] = useState(false);

  useEffect(() => {
    if (open && diet) {
      loadFoods();
      loadDietFoods();
    }
  }, [open, diet]);

  const loadFoods = async () => {
    const foods = await foodService.getFoods();
    setAvailableFoods(foods);
  };

  const loadDietFoods = async () => {
    const foods = await dietFoodService.getDietFoods(diet.id);
    setDietFoods(foods);
  };

  const handleAddFood = async () => {
    if (!selectedFood || !quantity) return;
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
        calories: Number(newFoodCalories)
      });
      
      setAvailableFoods(prev => [...prev, newFood]);
      
      setSelectedFood(newFood);
      
      setNewFoodName('');
      setNewFoodDescription('');
      setNewFoodCalories('');
      setShowNewFoodForm(false);
      
      console.log('Nuevo alimento creado:', newFood);
    } catch (error) {
      console.error('Error creating new food:', error);
      alert('Error al crear el nuevo alimento. Por favor, intenta de nuevo.');
    }
  };

  const handleRemoveFood = async (dietFoodId: number) => {
    await dietFoodService.removeFoodFromDiet(dietFoodId);
    loadDietFoods();
  };

  const calculateTotalCalories = (food: Food, quantity: number) => {
    return calculateFoodCalories(food.calories, quantity);
  };

  const [selectedMealType, setSelectedMealType] = useState<string>('lunch');
  const [altSourceFood, setAltSourceFood] = useState<Food | null>(null);
  const [altTargetFood, setAltTargetFood] = useState<Food | null>(null);
  const [altSourceGrams, setAltSourceGrams] = useState<number>(100);

  const calculateEquivalentGrams = () => {
    if (!altSourceFood || !altTargetFood || altSourceFood.calories === 0 || altTargetFood.calories === 0) return 0;
    const totalCaloriesSource = (altSourceFood.calories * altSourceGrams) / 100;
    return Math.round((totalCaloriesSource * 100) / altTargetFood.calories);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '28px',
          bgcolor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(32px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 1,
              borderRadius: '12px',
              bgcolor: 'rgba(6, 182, 212, 0.15)',
              color: '#22d3ee',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <Iconify icon="solar:plate-bold-duotone" width={26} height={26} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#f8fafc' }}>
            Gestionar Alimentos & Equivalencias • {diet?.name}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3.5} sx={{ mt: 1 }}>
          {/* Formulario para agregar alimentos existentes */}
          <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:add-circle-bold" sx={{ color: '#22d3ee' }} />
              Añadir Alimento a la Dieta
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={availableFoods}
                  getOptionLabel={(option) => option.name}
                  value={selectedFood}
                  onChange={(_, value) => {
                    if (typeof value === 'object' && value !== null) {
                      setSelectedFood(value);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Seleccionar Alimento" size="small" />}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Stack>
                        <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {option.calories} cal/100g
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={2.5}>
                <TextField
                  select
                  size="small"
                  label="Toma / Comida"
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="breakfast">🌅 Desayuno</MenuItem>
                  <MenuItem value="mid_morning">🍏 Media Mañana</MenuItem>
                  <MenuItem value="lunch">🍲 Almuerzo</MenuItem>
                  <MenuItem value="snack">🍇 Merienda</MenuItem>
                  <MenuItem value="dinner">🌙 Cena</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={2.5}>
                <TextField
                  size="small"
                  label="Cantidad (g)"
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="contained"
                  onClick={handleAddFood}
                  disabled={!selectedFood || !quantity}
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  fullWidth
                  sx={{
                    borderRadius: '9999px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
                  }}
                >
                  Agregar
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Calculadora Inteligente de Equivalencias de Alimentos */}
          <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#22d3ee', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:calculator-minimalistic-bold-duotone" />
              💡 Calculadora de Intercambio Inteligente de Alimentos (Equivalencia Calórica)
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  size="small"
                  options={availableFoods}
                  getOptionLabel={(o) => o.name}
                  value={altSourceFood}
                  onChange={(_, v) => setAltSourceFood(v)}
                  renderInput={(params) => <TextField {...params} label="Alimento Original (Plan)" />}
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField
                  size="small"
                  type="number"
                  label="Gramos"
                  value={altSourceGrams}
                  onChange={(e) => setAltSourceGrams(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  size="small"
                  options={availableFoods}
                  getOptionLabel={(o) => o.name}
                  value={altTargetFood}
                  onChange={(_, v) => setAltTargetFood(v)}
                  renderInput={(params) => <TextField {...params} label="Sustituir Por..." />}
                />
              </Grid>
              <Grid item xs={8} sm={2}>
                {altSourceFood && altTargetFood ? (
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Equivale a:</Typography>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#34d399' }}>
                      {calculateEquivalentGrams()}g
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', display: 'block', textAlign: 'center' }}>
                    Selecciona 2 alimentos
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* Botón para mostrar formulario de nuevo alimento */}
          <Box display="flex" justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => setShowNewFoodForm(!showNewFoodForm)}
              startIcon={<Iconify icon={showNewFoodForm ? "eva:minus-outline" : "eva:plus-outline"} />}
              sx={{ borderRadius: '9999px', color: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              {showNewFoodForm ? "Cancelar nuevo alimento" : "Crear nuevo alimento en base de datos"}
            </Button>
          </Box>

          {/* Formulario para crear nuevo alimento */}
          {showNewFoodForm && (
            <Box sx={{ p: 2.5, border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f8fafc', mb: 2 }}>
                Crear Nuevo Alimento Personalizado
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Nombre del alimento"
                  value={newFoodName}
                  onChange={e => setNewFoodName(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Descripción (opcional)"
                  value={newFoodDescription}
                  onChange={e => setNewFoodDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Calorías por 100g"
                  type="number"
                  value={newFoodCalories}
                  onChange={e => setNewFoodCalories(e.target.value)}
                  required
                  sx={{ width: 200 }}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleCreateNewFood}
                    disabled={!newFoodName || !newFoodCalories}
                    sx={{ borderRadius: '9999px', bgcolor: '#06b6d4', color: '#ffffff' }}
                  >
                    Crear alimento
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowNewFoodForm(false);
                      setNewFoodName('');
                      setNewFoodDescription('');
                      setNewFoodCalories('');
                    }}
                    sx={{ borderRadius: '9999px', color: '#94a3b8' }}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Tabla de alimentos en la dieta */}
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#f8fafc', mb: 1.5 }}>
              Alimentos Configurados en el Plan ({dietFoods.length})
            </Typography>
            <Table sx={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                <TableRow>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Alimento</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Cantidad (g)</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Calorías Totales</TableCell>
                  <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dietFoods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: '#94a3b8', py: 3 }}>
                      No hay alimentos asignados a esta dieta. Utiliza el formulario superior para agregarlos.
                    </TableCell>
                  </TableRow>
                ) : (
                  dietFoods.map(df => (
                    <TableRow key={df.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: '#f8fafc' }}>
                            {df.foods?.name || `Alimento ID: ${df.food_id}`}
                          </Typography>
                          {df.foods?.description && (
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {df.foods.description}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc', fontWeight: 600 }}>{df.quantity}g</TableCell>
                      <TableCell sx={{ color: '#38bdf8', fontWeight: 700 }}>
                        {df.foods ? formatCalories(calculateTotalCalories(df.foods, df.quantity)) : formatCalories(0)}
                        {df.foods && (
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                            ({df.foods.calories} cal/100g)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="error" onClick={() => handleRemoveFood(df.id)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Resumen de calorías totales */}
            {dietFoods.length > 0 && (
              <Box sx={{ mt: 2.5, p: 2, bgcolor: 'rgba(6, 182, 212, 0.12)', borderRadius: 3, border: '1px solid rgba(6, 182, 212, 0.3)', textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#22d3ee' }}>
                  Total de Calorías en Alimentos: {formatCalories(dietFoods.reduce((total, df) => 
                    total + (df.foods ? calculateTotalCalories(df.foods, df.quantity) : 0), 0
                  ))}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: 'rgba(15, 23, 42, 0.7)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button onClick={onClose} sx={{ borderRadius: '9999px', color: '#94a3b8', fontWeight: 600, '&:hover': { color: '#f8fafc' } }}>Cerrar</Button>
        <Button
          onClick={() => onSave()}
          variant="contained"
          sx={{
            borderRadius: '9999px',
            px: 3,
            py: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
          }}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};