// Modal de creación y edición integral de Dietas con hidratación, 5 comidas estructuradas y suplementos recomendados
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Autocomplete,
  InputAdornment,
  Divider,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  UtensilsCrossed,
  X,
  Flame,
  Droplets,
  Pill,
  Coffee,
  Apple,
  Salad,
  Cookie,
  ChefHat,
  Plus,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { Diet, MealFoodItem, DietSupplementProduct } from '../../types/Diet';
import { Food } from '../../types/Food';
import { Product } from '../../types/Product';
import * as foodService from '../../services/foodService';
import * as productService from '../../services/productService';

interface DietFormProps {
  open: boolean;
  dietToEdit?: Diet | null;
  onClose: () => void;
  onSubmit: (diet: Partial<Diet>) => void;
}

const WATER_PRESETS = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
const CALORIE_PRESETS = [1600, 1800, 2000, 2200, 2500, 3000];

export const MEAL_DEFINITIONS = [
  { key: 'breakfast', label: 'Desayuno', icon: Coffee, color: '#FF9500', defaultTime: '08:00 - 08:30' },
  { key: 'mid_morning', label: 'Media Mañana', icon: Apple, color: '#34C759', defaultTime: '11:00 - 11:30' },
  { key: 'lunch', label: 'Almuerzo', icon: Salad, color: '#007AFF', defaultTime: '14:00 - 14:30' },
  { key: 'snack', label: 'Merienda', icon: Cookie, color: '#AF52DE', defaultTime: '17:30 - 18:00' },
  { key: 'dinner', label: 'Cena', icon: ChefHat, color: '#FF2D55', defaultTime: '21:00 - 21:30' },
];

export const DietForm: React.FC<DietFormProps> = ({
  open,
  dietToEdit,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState<number>(0);

  // Datos generales e hidratación
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [calories, setCalories] = useState<number>(2000);
  const [waterLiters, setWaterLiters] = useState<number>(2.5);
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // Estructura de 5 comidas
  const [mealsData, setMealsData] = useState<Record<string, MealFoodItem[]>>({
    breakfast: [],
    mid_morning: [],
    lunch: [],
    snack: [],
    dinner: [],
  });

  // Observaciones por comida
  const [mealNotes, setMealNotes] = useState<Record<string, string>>({
    breakfast: '',
    mid_morning: '',
    lunch: '',
    snack: '',
    dinner: '',
  });

  // Suplementación y productos recomendados
  const [supplements, setSupplements] = useState<DietSupplementProduct[]>([]);

  // Alimentos y Productos disponibles
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(false);

  // Estado temporal para añadir alimento a una comida
  const [activeMealKey, setActiveMealKey] = useState<string>('breakfast');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [foodQuantity, setFoodQuantity] = useState<string>('100');
  const [foodUnit, setFoodUnit] = useState<string>('g');
  const [customFoodName, setCustomFoodName] = useState<string>('');
  const [customFoodKcal, setCustomFoodKcal] = useState<string>('');

  // Estado temporal para añadir suplemento / producto
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [suppName, setSuppName] = useState<string>('');
  const [suppUrl, setSuppUrl] = useState<string>('');
  const [suppTiming, setSuppTiming] = useState<string>('En el Desayuno');
  const [suppDosage, setSuppDosage] = useState<string>('1 cápsula / toma');
  const [suppObservations, setSuppObservations] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadCatalog();
      if (dietToEdit) {
        setName(dietToEdit.name || '');
        setDescription(dietToEdit.description || '');
        setCalories(dietToEdit.calories || 2000);
        setWaterLiters(dietToEdit.water_liters ? Number(dietToEdit.water_liters) : 2.5);
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
        setDescription('');
        setCalories(2000);
        setWaterLiters(2.5);
        setGeneralNotes('');
        setMealsData({
          breakfast: [],
          mid_morning: [],
          lunch: [],
          snack: [],
          dinner: [],
        });
        setMealNotes({
          breakfast: '',
          mid_morning: '',
          lunch: '',
          snack: '',
          dinner: '',
        });
        setSupplements([]);
      }
      setActiveTab(0);
      setActiveMealKey('breakfast');
    }
  }, [open, dietToEdit]);

  const loadCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const [foodsRes, prodsRes] = await Promise.all([
        foodService.getFoods(),
        productService.getProducts(),
      ]);
      setAvailableFoods(Array.isArray(foodsRes) ? foodsRes : (foodsRes as any)?.data || []);
      setAvailableProducts(Array.isArray(prodsRes) ? prodsRes : (prodsRes as any)?.data || []);
    } catch (e) {
      console.error('Error cargando catálogo:', e);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Cálculo total de calorías calculadas a partir de las 5 comidas
  const calculatedTotalCalories = useMemo(() => {
    let total = 0;
    Object.values(mealsData).forEach((foodList) => {
      foodList.forEach((item) => {
        total += item.calories || 0;
      });
    });
    return Math.round(total);
  }, [mealsData]);

  // Manejador para añadir alimento a la comida activa
  const handleAddFoodToMeal = () => {
    let itemToAdd: MealFoodItem | null = null;
    const qty = Number(foodQuantity) || 100;

    if (selectedFood) {
      const baseCal = selectedFood.calories || 100;
      const cal = Math.round((baseCal * qty) / 100);
      itemToAdd = {
        id: Date.now() + Math.random(),
        food_id: selectedFood.id,
        name: selectedFood.name,
        quantity: qty,
        unit: foodUnit,
        calories: cal,
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

  // Manejador para añadir suplemento / producto
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
      dosage: suppDosage.trim() || '1 toma diaria',
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

  const handleSubmit = () => {
    if (!name.trim()) return;

    const payload: Partial<Diet> = {
      name: name.trim(),
      description: description.trim(),
      calories: calculatedTotalCalories > 0 ? calculatedTotalCalories : calories,
      water_liters: Number(waterLiters) || 2.5,
      meals_data: mealsData,
      supplement_products: supplements,
      notes: generalNotes.trim(),
    };

    onSubmit(payload);
    onClose();
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
              {dietToEdit ? 'Editar Plan Nutricional & Dieta' : 'Diseñar Plan Nutricional Completo'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Hidratación, 5 comidas pautadas y suplementación con enlaces
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

      {/* Selector de Pestañas Apple */}
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

      {/* Contenido con Scroll */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#000000', overflowY: 'auto' }}>
        {/* TAB 1: DATOS GENERALES E HIDRATACIÓN */}
        {activeTab === 0 && (
          <Stack spacing={2.5}>
            {/* Card Nombre y Calorías */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#34C759', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flame size={18} /> Información General del Plan
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Nombre del Plan / Dieta *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej: Dieta de Definición 2.200 kcal - Jorge"
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
                      placeholder="2000"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      InputProps={{
                        sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '15px' },
                        endAdornment: <InputAdornment position="end"><Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>kcal</Typography></InputAdornment>,
                      }}
                    />
                    {calculatedTotalCalories > 0 && (
                      <Typography variant="caption" sx={{ color: '#34C759', mt: 0.5, display: 'block', fontWeight: 600 }}>
                        ✓ Total sumado de las 5 comidas: {calculatedTotalCalories} kcal
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                      Ajuste rápido de Kcal
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
                    Descripción o Resumen del Objetivo
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enfoque de macronutrientes, días de carga o descanso..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '14px' },
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Card Hidratación Diaria Requerida */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(0, 122, 255, 0.25)',
                boxShadow: '0 8px 24px rgba(0, 122, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Droplets size={18} /> Cantidad de Agua Diaria del Cliente
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', display: 'block', mb: 2 }}>
                Esta meta de hidratación se asociará directamente al perfil del cliente para que pueda registrar sus tomas diarias.
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
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.8, display: 'block', fontWeight: 500 }}>
                    Valores recomendados:
                  </Typography>
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
                          border: waterLiters === val ? '1px solid #007AFF' : '0.5px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Card Pautas y Observaciones Generales */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info size={18} color="#AF52DE" /> Pautas y Observaciones Generales
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Pautas sobre cocinado, sal, descansos o cómo distribuir las comidas a lo largo de su jornada laboral..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                InputProps={{
                  sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '14px' },
                }}
              />
            </Box>
          </Stack>
        )}

        {/* TAB 2: LAS 5 COMIDAS ESTRUCTURADAS */}
        {activeTab === 1 && (
          <Stack spacing={2.5}>
            {/* Selector de Comida Activa */}
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
              {MEAL_DEFINITIONS.map((meal) => {
                const IconComponent = meal.icon;
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
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                    }}
                  >
                    <IconComponent size={20} color={isSelected ? '#34C759' : meal.color} style={{ margin: '0 auto 4px' }} />
                    <Typography variant="body2" fontWeight={isSelected ? 800 : 600} sx={{ color: isSelected ? '#34C759' : '#ffffff', fontSize: '0.82rem' }}>
                      {meal.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.7rem' }}>
                      {count} {count === 1 ? 'alimento' : 'alimentos'} • {mealKcal} kcal
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            {/* Panel de la comida seleccionada */}
            {(() => {
              const currentMealDef = MEAL_DEFINITIONS.find((m) => m.key === activeMealKey)!;
              const currentFoods = mealsData[activeMealKey] || [];
              const totalMealKcal = currentFoods.reduce((sum, f) => sum + (f.calories || 0), 0);

              return (
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: '20px',
                    bgcolor: '#1C1C1E',
                    border: '0.5px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <currentMealDef.icon size={22} color={currentMealDef.color} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#ffffff' }}>
                          {currentMealDef.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Horario sugerido: {currentMealDef.defaultTime}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      icon={<Flame size={14} color="#FF9500" />}
                      label={`${totalMealKcal} kcal`}
                      sx={{ bgcolor: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 800 }}
                    />
                  </Stack>

                  {/* Formulario para añadir alimento a esta comida */}
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
                            fontSize: '0.85rem',
                            '&:hover': { bgcolor: '#2eb34f' },
                          }}
                        >
                          Añadir
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Opción rápida para alimento manual si no está en catálogo */}
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block' }}>
                        ¿O escribir alimento libre?:
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Nombre libre (ej: Tortilla de 3 claras)"
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

                  {/* Listado de alimentos añadidos en esta comida */}
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, display: 'block', fontWeight: 600 }}>
                    Alimentos en {currentMealDef.label} ({currentFoods.length}):
                  </Typography>

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
                            sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255,69,58,0.1)' } }}
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

        {/* TAB 3: PRODUCTOS, VITAMINAS & SUPLEMENTACIÓN CON ENLACES */}
        {activeTab === 2 && (
          <Stack spacing={2.5}>
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#FF9500', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pill size={18} /> Suplementación & Productos Recomendados
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', display: 'block', mb: 2.5 }}>
                Añade suplementos o productos recomendados (vitaminas, creatina, proteína, etc.). El cliente verá el enlace directo para adquirirlos y tus pautas de dosificación.
              </Typography>

              {/* Formulario para añadir suplemento */}
              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#2C2C2E', mb: 3 }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#FF9500', mb: 1.5, display: 'block' }}>
                  + Añadir Recomendación de Producto / Suplemento
                </Typography>

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
                      placeholder="O escribir nombre (ej: Multivitamínico Solaray, Creatina Creapure)"
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
                      placeholder="Enlace de compra del producto (URL ej: https://www.amazon.es/... o HSN, Prozis, etc.)"
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
                      label="Momento de la toma / Timing"
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
                      label="Dosis recomendada"
                      placeholder="ej: 1 cápsula con agua, 5g tras el entreno"
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
                      placeholder="Observaciones de este suplemento (ej: Tomar junto con comida grasa para mejorar absorción, no en ayunas...)"
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
                      Añadir Suplemento a la Pauta
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Lista de suplementos prescritos */}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1.5, display: 'block', fontWeight: 600 }}>
                Suplementos Recomendados en esta Dieta ({supplements.length}):
              </Typography>

              {supplements.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    No hay suplementos prescritos para este plan. Puedes añadirlos arriba con su enlace de compra.
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
                          sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255,69,58,0.1)' } }}
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

      {/* Footer Botones Apple */}
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
            fontSize: '0.92rem',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!name.trim()}
          variant="contained"
          sx={{
            flex: 2,
            height: 44,
            borderRadius: '12px',
            bgcolor: '#34C759',
            color: '#000000',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.92rem',
            boxShadow: '0 4px 14px rgba(52, 199, 89, 0.3)',
            '&:hover': { bgcolor: '#2eb34f' },
          }}
        >
          {dietToEdit ? 'Guardar Plan' : 'Crear Plan Nutricional'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DietForm;