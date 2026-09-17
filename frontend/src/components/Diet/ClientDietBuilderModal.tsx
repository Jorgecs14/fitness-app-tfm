// Creador y selector de pautas nutricionales para el cliente con estética Apple Liquid Glass
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  IconButton,
  Chip,
  Grid,
  Alert,
  Tabs,
  Tab,
  Autocomplete,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  UtensilsCrossed,
  Sparkles,
  X,
  Flame,
  Droplets,
  Pill,
  Coffee,
  Apple,
  Salad,
  Cookie,
  ChefHat,
  Trash2,
  ExternalLink,
  Info,
  Check,
  Link as LinkIcon,
} from 'lucide-react';
import { createDiet, updateDiet, assignUserToDiet } from '../../services/dietService';
import { MealFoodItem, DietSupplementProduct } from '../../types/Diet';
import { Food } from '../../types/Food';
import { Product } from '../../types/Product';
import * as foodService from '../../services/foodService';
import * as productService from '../../services/productService';

interface ClientDietBuilderModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  dietToEdit?: any | null;
  onSuccess: () => void;
}

const WATER_PRESETS = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
const CALORIE_PRESETS = [1600, 1800, 2000, 2200, 2500, 3000];

const MEAL_DEFINITIONS = [
  { key: 'breakfast', label: 'Desayuno', icon: Coffee, color: '#FF9500', defaultTime: '08:00 - 08:30' },
  { key: 'mid_morning', label: 'Media Mañana', icon: Apple, color: '#34C759', defaultTime: '11:00 - 11:30' },
  { key: 'lunch', label: 'Almuerzo', icon: Salad, color: '#007AFF', defaultTime: '14:00 - 14:30' },
  { key: 'snack', label: 'Merienda', icon: Cookie, color: '#AF52DE', defaultTime: '17:30 - 18:00' },
  { key: 'dinner', label: 'Cena', icon: ChefHat, color: '#FF2D55', defaultTime: '21:00 - 21:30' },
];

export const ClientDietBuilderModal: React.FC<ClientDietBuilderModalProps> = ({
  open,
  onClose,
  userId,
  dietToEdit,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [calories, setCalories] = useState<number>(2200);
  const [waterLiters, setWaterLiters] = useState<number>(2.5);
  const [description, setDescription] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // Estructura de 5 comidas
  const [mealsData, setMealsData] = useState<Record<string, MealFoodItem[]>>({
    breakfast: [],
    mid_morning: [],
    lunch: [],
    snack: [],
    dinner: [],
  });

  // Suplementación y productos
  const [supplements, setSupplements] = useState<DietSupplementProduct[]>([]);

  // Catálogos
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Formulario temporal comida
  const [activeMealKey, setActiveMealKey] = useState<string>('breakfast');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [foodQuantity, setFoodQuantity] = useState<string>('100');
  const [foodUnit, setFoodUnit] = useState<string>('g');
  const [customFoodName, setCustomFoodName] = useState<string>('');
  const [customFoodKcal, setCustomFoodKcal] = useState<string>('');

  // Formulario temporal suplemento
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [suppName, setSuppName] = useState<string>('');
  const [suppUrl, setSuppUrl] = useState<string>('');
  const [suppTiming, setSuppTiming] = useState<string>('En el Desayuno');
  const [suppDosage, setSuppDosage] = useState<string>('1 cápsula / toma');
  const [suppObservations, setSuppObservations] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadCatalog();
      if (dietToEdit) {
        setName(dietToEdit.name || '');
        setCalories(dietToEdit.calories || 2200);
        setWaterLiters(dietToEdit.water_liters ? Number(dietToEdit.water_liters) : 2.5);
        setDescription(dietToEdit.description || '');
        setGeneralNotes(dietToEdit.notes || '');

        let parsedMeals: Record<string, MealFoodItem[]> = {
          breakfast: [],
          mid_morning: [],
          lunch: [],
          snack: [],
          dinner: [],
        };
        if (dietToEdit.meals_data) {
          const raw = typeof dietToEdit.meals_data === 'string' ? JSON.parse(dietToEdit.meals_data) : dietToEdit.meals_data;
          parsedMeals = { ...parsedMeals, ...raw };
        }
        setMealsData(parsedMeals);

        let parsedSupps: DietSupplementProduct[] = [];
        if (dietToEdit.supplement_products) {
          parsedSupps = typeof dietToEdit.supplement_products === 'string'
            ? JSON.parse(dietToEdit.supplement_products)
            : dietToEdit.supplement_products;
        }
        setSupplements(Array.isArray(parsedSupps) ? parsedSupps : []);
      } else {
        setName('');
        setCalories(2200);
        setWaterLiters(2.5);
        setDescription('');
        setGeneralNotes('');
        setMealsData({
          breakfast: [],
          mid_morning: [],
          lunch: [],
          snack: [],
          dinner: [],
        });
        setSupplements([]);
      }
      setErrorMsg(null);
      setActiveTab(0);
      setActiveMealKey('breakfast');
    }
  }, [open, dietToEdit]);

  const loadCatalog = async () => {
    try {
      const [foodsRes, prodsRes] = await Promise.all([
        foodService.getFoods(),
        productService.getProducts(),
      ]);
      setAvailableFoods(Array.isArray(foodsRes) ? foodsRes : (foodsRes as any)?.data || []);
      setAvailableProducts(Array.isArray(prodsRes) ? prodsRes : (prodsRes as any)?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const calculatedTotalCalories = useMemo(() => {
    let total = 0;
    Object.values(mealsData).forEach((list) => {
      list.forEach((item) => {
        total += item.calories || 0;
      });
    });
    return Math.round(total);
  }, [mealsData]);

  const handleAddFoodToMeal = () => {
    let itemToAdd: MealFoodItem | null = null;
    const qty = Number(foodQuantity) || 100;

    if (selectedFood) {
      const baseCal = selectedFood.calories || 100;
      itemToAdd = {
        id: Date.now() + Math.random(),
        food_id: selectedFood.id,
        name: selectedFood.name,
        quantity: qty,
        unit: foodUnit,
        calories: Math.round((baseCal * qty) / 100),
      };
    } else if (customFoodName.trim()) {
      const customKcal = Number(customFoodKcal) || 100;
      itemToAdd = {
        id: Date.now() + Math.random(),
        name: customFoodName.trim(),
        quantity: qty,
        unit: foodUnit,
        calories: Math.round((customKcal * qty) / 100),
      };
    }

    if (itemToAdd) {
      setMealsData((prev) => ({
        ...prev,
        [activeMealKey]: [...(prev[activeMealKey] || []), itemToAdd!],
      }));
      setSelectedFood(null);
      setCustomFoodName('');
      setCustomFoodKcal('');
      setFoodQuantity('100');
    }
  };

  const handleRemoveFoodFromMeal = (mealKey: string, index: number) => {
    setMealsData((prev) => ({
      ...prev,
      [mealKey]: prev[mealKey].filter((_, i) => i !== index),
    }));
  };

  const handleAddSupplement = () => {
    const nameToUse = selectedProduct ? selectedProduct.name : suppName.trim();
    const urlToUse = selectedProduct?.url || suppUrl.trim();

    if (!nameToUse) return;

    const newSupp: DietSupplementProduct = {
      id: Date.now() + Math.random(),
      product_id: selectedProduct?.id,
      name: nameToUse,
      url: urlToUse || undefined,
      timing: suppTiming.trim() || 'En el Desayuno',
      dosage: suppDosage.trim() || '1 cápsula / toma',
      observations: suppObservations.trim() || undefined,
    };

    setSupplements((prev) => [...prev, newSupp]);
    setSelectedProduct(null);
    setSuppName('');
    setSuppUrl('');
    setSuppTiming('En el Desayuno');
    setSuppDosage('1 cápsula / toma');
    setSuppObservations('');
  };

  const handleRemoveSupplement = (index: number) => {
    setSupplements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDiet = async () => {
    if (!name.trim()) {
      setErrorMsg('Por favor, indica un nombre para el plan de nutrición.');
      return;
    }

    const finalCalories = calculatedTotalCalories > 0 ? calculatedTotalCalories : (calories || 2000);

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: any = {
        name: name.trim(),
        calories: finalCalories,
        description: description.trim(),
        water_liters: Number(waterLiters) || 2.5,
        meals_data: mealsData,
        supplement_products: supplements,
        notes: generalNotes.trim(),
      };

      if (dietToEdit) {
        await updateDiet(dietToEdit.id, payload);
      } else {
        const newDiet = await createDiet(payload);
        if (newDiet && newDiet.id && userId) {
          try {
            await assignUserToDiet(newDiet.id, userId);
          } catch (assignErr) {
            console.warn('Advertencia al asociar pauta con usuario:', assignErr);
          }
        }
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al guardar el plan de nutrición.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#000000',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
          maxHeight: { xs: '100%', sm: '90vh' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header Apple Liquid Glass */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(28, 28, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : 2,
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
              border: '0.5px solid rgba(52, 199, 89, 0.3)',
            }}
          >
            <UtensilsCrossed size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              {dietToEdit ? 'Editar Dieta del Atleta' : 'Prescribir Dieta & Pauta Nutricional'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Pauta personalizada con agua, 5 comidas y suplementos con enlace directo
            </Typography>
          </Box>
        </Stack>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'rgba(235, 235, 245, 0.8)',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.5, bgcolor: '#121214', borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              minHeight: 44,
              px: 2,
              '&.Mui-selected': {
                color: '#34C759',
                fontWeight: 700,
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#34C759',
              height: 3,
              borderRadius: '3px',
            },
          }}
        >
          <Tab icon={<Droplets size={16} />} iconPosition="start" label="1. Datos & Hidratación" />
          <Tab icon={<UtensilsCrossed size={16} />} iconPosition="start" label="2. Las 5 Comidas" />
          <Tab icon={<Pill size={16} />} iconPosition="start" label="3. Suplementos & Enlaces" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#000000', overflowY: 'auto' }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, bgcolor: 'rgba(255, 69, 58, 0.15)', color: '#FF453A' }}>
            {errorMsg}
          </Alert>
        )}

        {/* TAB 1: GENERAL E HIDRATACIÓN */}
        {activeTab === 0 && (
          <Stack spacing={2.5}>
            <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#1C1C1E', border: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography variant="subtitle2" sx={{ color: '#34C759', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flame size={18} /> Pauta Nutricional
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Nombre del Plan *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej: Dieta de Definición 2.200 kcal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '15px' },
                    }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                      Calorías Objetivo Diarias (Kcal)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      InputProps={{
                        sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '15px' },
                        endAdornment: <InputAdornment position="end"><Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>kcal</Typography></InputAdornment>,
                      }}
                    />
                    {calculatedTotalCalories > 0 && (
                      <Typography variant="caption" sx={{ color: '#34C759', mt: 0.5, display: 'block', fontWeight: 600 }}>
                        ✓ Suma real de las 5 comidas: {calculatedTotalCalories} kcal
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                      Valores rápidos
                    </Typography>
                    <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                      {CALORIE_PRESETS.map((cal) => (
                        <Chip
                          key={cal}
                          label={`${cal}`}
                          size="small"
                          onClick={() => setCalories(cal)}
                          sx={{
                            bgcolor: calories === cal ? '#34C759' : '#2C2C2E',
                            color: calories === cal ? '#000000' : '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Descripción o Resumen
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Instrucciones sobre días de entreno, descansos..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '14px' },
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Agua Diaria */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(0, 122, 255, 0.25)',
                boxShadow: '0 8px 24px rgba(0, 122, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Droplets size={18} /> Cantidad de Agua Diaria Asignada
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', display: 'block', mb: 2 }}>
                Esta meta se sincronizará con el perfil y dashboard diario de hidratación del cliente.
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Litros / día"
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(Math.max(0.5, Number(e.target.value)))}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px', fontWeight: 700 },
                      endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#007AFF', fontWeight: 700 }}>Litros</Typography></InputAdornment>,
                      inputProps: { step: 0.1, min: 0.5, max: 8.0 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={7}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {WATER_PRESETS.map((val) => (
                      <Chip
                        key={val}
                        label={`${val} L`}
                        onClick={() => setWaterLiters(val)}
                        sx={{
                          bgcolor: waterLiters === val ? '#007AFF' : '#2C2C2E',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Observaciones generales */}
            <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#1C1C1E', border: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info size={18} color="#AF52DE" /> Observaciones y Pautas para el Atleta
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Observaciones de salud, cocinados, especias permitidas o pautas de fin de semana..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                InputProps={{
                  sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '14px' },
                }}
              />
            </Box>
          </Stack>
        )}

        {/* TAB 2: LAS 5 COMIDAS */}
        {activeTab === 1 && (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
              {MEAL_DEFINITIONS.map((meal) => {
                const IconComp = meal.icon;
                const isSelected = activeMealKey === meal.key;
                const count = mealsData[meal.key]?.length || 0;
                const mealKcal = mealsData[meal.key]?.reduce((sum, f) => sum + (f.calories || 0), 0) || 0;

                return (
                  <Box
                    key={meal.key}
                    onClick={() => setActiveMealKey(meal.key)}
                    sx={{
                      flex: '1 0 auto',
                      minWidth: 120,
                      p: 1.5,
                      borderRadius: '16px',
                      bgcolor: isSelected ? 'rgba(52, 199, 89, 0.15)' : '#1C1C1E',
                      border: isSelected ? '1.5px solid #34C759' : '0.5px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <IconComp size={20} color={isSelected ? '#34C759' : meal.color} style={{ margin: '0 auto 4px' }} />
                    <Typography variant="body2" fontWeight={isSelected ? 800 : 600} sx={{ color: isSelected ? '#34C759' : '#ffffff', fontSize: '0.82rem' }}>
                      {meal.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.7rem' }}>
                      {count} {count === 1 ? 'item' : 'items'} • {mealKcal} kcal
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            {(() => {
              const currentMealDef = MEAL_DEFINITIONS.find((m) => m.key === activeMealKey)!;
              const currentFoods = mealsData[activeMealKey] || [];
              const totalMealKcal = currentFoods.reduce((sum, f) => sum + (f.calories || 0), 0);

              return (
                <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#1C1C1E', border: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <currentMealDef.icon size={22} color={currentMealDef.color} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#ffffff' }}>
                          {currentMealDef.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Toma sugerida: {currentMealDef.defaultTime}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      icon={<Flame size={14} color="#FF9500" />}
                      label={`${totalMealKcal} kcal`}
                      sx={{ bgcolor: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 800 }}
                    />
                  </Stack>

                  {/* Formulario rápido para añadir alimento */}
                  <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#2C2C2E', mb: 2.5 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#34C759', mb: 1.5, display: 'block' }}>
                      + Añadir Alimento a {currentMealDef.label}
                    </Typography>

                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <Autocomplete
                          options={availableFoods}
                          getOptionLabel={(option) => `${option.name} (${option.calories} kcal/100g)`}
                          value={selectedFood}
                          onChange={(_, newVal) => setSelectedFood(newVal)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Buscar en el catálogo..."
                              size="small"
                              sx={{
                                bgcolor: '#1C1C1E',
                                borderRadius: '10px',
                                '& .MuiInputBase-root': { color: '#fff', fontSize: '0.85rem' },
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={6} sm={2.5}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Cantidad"
                          value={foodQuantity}
                          onChange={(e) => setFoodQuantity(e.target.value)}
                          InputProps={{
                            sx: { bgcolor: '#1C1C1E', color: '#fff', borderRadius: '10px', fontSize: '0.85rem' },
                            endAdornment: <InputAdornment position="end"><Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{foodUnit}</Typography></InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={2.5}>
                        <TextField
                          fullWidth
                          size="small"
                          select
                          label="Unidad"
                          value={foodUnit}
                          onChange={(e) => setFoodUnit(e.target.value)}
                          SelectProps={{ native: true }}
                          InputProps={{
                            sx: { bgcolor: '#1C1C1E', color: '#fff', borderRadius: '10px', fontSize: '0.85rem' },
                          }}
                        >
                          <option value="g">Gramos (g)</option>
                          <option value="ml">Mililitros (ml)</option>
                          <option value="ud">Unidades</option>
                          <option value="cucharada">Cucharadas</option>
                          <option value="cazo">Cazo (scoop)</option>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleAddFoodToMeal}
                          disabled={!selectedFood && !customFoodName.trim()}
                          sx={{
                            bgcolor: '#34C759',
                            color: '#000',
                            fontWeight: 700,
                            borderRadius: '10px',
                            height: 40,
                            textTransform: 'none',
                          }}
                        >
                          Añadir
                        </Button>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block' }}>
                        O escribir alimento manual:
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Nombre libre (ej: 4 huevos revueltos con avena)"
                          value={customFoodName}
                          onChange={(e) => {
                            setCustomFoodName(e.target.value);
                            if (e.target.value) setSelectedFood(null);
                          }}
                          InputProps={{
                            sx: { bgcolor: '#1C1C1E', color: '#fff', borderRadius: '10px', fontSize: '0.85rem' },
                          }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          placeholder="Kcal / 100g"
                          value={customFoodKcal}
                          onChange={(e) => setCustomFoodKcal(e.target.value)}
                          InputProps={{
                            sx: { bgcolor: '#1C1C1E', color: '#fff', borderRadius: '10px', fontSize: '0.85rem', width: { sm: 140 } },
                          }}
                        />
                      </Stack>
                    </Box>
                  </Box>

                  {/* Listado */}
                  {currentFoods.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        No hay alimentos asociados a {currentMealDef.label}. Añade alimentos arriba.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {currentFoods.map((item, idx) => (
                        <Box
                          key={item.id || idx}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: '#2C2C2E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: '#ffffff' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              {item.quantity} {item.unit || 'g'} • {item.calories} kcal
                            </Typography>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFoodFromMeal(activeMealKey, idx)}
                            sx={{ color: '#FF453A' }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              );
            })()}
          </Stack>
        )}

        {/* TAB 3: SUPLEMENTACIÓN */}
        {activeTab === 2 && (
          <Stack spacing={2.5}>
            <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#1C1C1E', border: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography variant="subtitle2" sx={{ color: '#FF9500', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pill size={18} /> Suplementación y Productos Recomendados
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', display: 'block', mb: 2.5 }}>
                Añade suplementos o productos recomendados con su enlace de compra para que el alumno pueda adquirirlos.
              </Typography>

              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#2C2C2E', mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={availableProducts}
                      getOptionLabel={(opt) => `${opt.name} ${opt.price ? `(${opt.price}€)` : ''}`}
                      value={selectedProduct}
                      onChange={(_, newVal) => {
                        setSelectedProduct(newVal);
                        if (newVal) {
                          setSuppName(newVal.name);
                          if (newVal.url) setSuppUrl(newVal.url);
                          if (newVal.description) setSuppObservations(newVal.description);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Seleccionar de mis productos..."
                          size="small"
                          sx={{ bgcolor: '#1C1C1E', borderRadius: '10px', '& .MuiInputBase-root': { color: '#fff', fontSize: '0.85rem' } }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="O escribir nombre (ej: Multivitamínico, Creatina Creapure)"
                      value={suppName}
                      onChange={(e) => setSuppName(e.target.value)}
                      InputProps={{
                        sx: { bgcolor: '#1C1C1E', color: '#fff', borderRadius: '10px', fontSize: '0.85rem' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enlace del producto (URL ej: https://www.amazon.es/... o HSN, Prozis)"
                      value={suppUrl}
                      onChange={(e) => setSuppUrl(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LinkIcon size={16} color="#007AFF" /></InputAdornment>,
                        sx: { bgcolor: '#1C1C1E', color: '#fff', borderRadius: '10px', fontSize: '0.85rem' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Momento de la toma"
                      placeholder="ej: En el Desayuno, Pre-entreno, En la Cena"
                      value={suppTiming}
                      onChange={(e) => setSuppTiming(e.target.value)}
                      InputProps={{
                        sx: { bgcolor: '#1C1C1E', color: '#fff', borderRadius: '10px', fontSize: '0.85rem' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Dosis"
                      placeholder="ej: 1 cápsula con agua, 5g"
                      value={suppDosage}
                      onChange={(e) => setSuppDosage(e.target.value)}
                      InputProps={{
                        sx: { bgcolor: '#1C1C1E', color: '#fff', borderRadius: '10px', fontSize: '0.85rem' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Observaciones de este suplemento..."
                      value={suppObservations}
                      onChange={(e) => setSuppObservations(e.target.value)}
                      InputProps={{
                        sx: { bgcolor: '#1C1C1E', color: '#fff', borderRadius: '10px', fontSize: '0.85rem' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleAddSupplement}
                      disabled={!selectedProduct && !suppName.trim()}
                      sx={{
                        bgcolor: '#FF9500',
                        color: '#000',
                        fontWeight: 700,
                        borderRadius: '10px',
                        py: 1,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#e08500' },
                      }}
                    >
                      Añadir Suplemento a la Dieta
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Lista */}
              {supplements.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    No hay suplementos prescritos. Puedes añadir suplementos arriba.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {supplements.map((supp, index) => (
                    <Box
                      key={supp.id || index}
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        bgcolor: '#2C2C2E',
                        border: '0.5px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1, pr: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={0.5}>
                            <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#ffffff' }}>
                              {supp.name}
                            </Typography>
                            {supp.timing && (
                              <Chip
                                size="small"
                                label={supp.timing}
                                sx={{ bgcolor: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            )}
                            {supp.dosage && (
                              <Chip
                                size="small"
                                label={supp.dosage}
                                sx={{ bgcolor: 'rgba(52, 199, 89, 0.15)', color: '#34C759', fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            )}
                          </Stack>

                          {supp.observations && (
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', mt: 0.5 }}>
                              {supp.observations}
                            </Typography>
                          )}

                          {supp.url && (
                            <Box sx={{ mt: 1 }}>
                              <a
                                href={supp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: '#007AFF',
                                  fontSize: '0.78rem',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                <ExternalLink size={13} /> Ver / Comprar producto ({supp.url.length > 40 ? `${supp.url.substring(0, 40)}...` : supp.url})
                              </a>
                            </Box>
                          )}
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSupplement(index)}
                          sx={{ color: '#FF453A' }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
          bgcolor: 'rgba(28, 28, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 12px)' : 2,
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: '12px',
            color: '#ffffff',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveDiet}
          disabled={!name.trim() || isSubmitting}
          variant="contained"
          sx={{
            flex: 2,
            height: 44,
            borderRadius: '12px',
            bgcolor: '#34C759',
            color: '#000000',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: '#2eb34f' },
          }}
        >
          {isSubmitting ? 'Guardando...' : dietToEdit ? 'Guardar Cambios' : 'Asignar Dieta al Atleta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientDietBuilderModal;
