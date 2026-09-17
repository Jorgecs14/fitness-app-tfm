// Modal de creación y edición integral de Dietas con diseño Apple Liquid Glass
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
  Collapse,
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
  Link as LinkIcon,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp
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

const inputStyle = {
  color: '#ffffff',
  bgcolor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '14px',
  fontSize: '0.92rem',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 0.25)',
    bgcolor: 'rgba(255, 255, 255, 0.07)',
  },
  '&.Mui-focused': {
    borderColor: '#34C759',
    bgcolor: 'rgba(255, 255, 255, 0.09)',
    boxShadow: '0 0 0 3px rgba(52, 199, 89, 0.2)',
  },
  '& input::placeholder, & textarea::placeholder': {
    color: 'rgba(255, 255, 255, 0.4)',
    opacity: 1,
  },
};

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

  // Suplementación y productos recomendados
  const [supplements, setSupplements] = useState<DietSupplementProduct[]>([]);

  // Alimentos y Productos disponibles
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Estado temporal para añadir alimento a una comida
  const [activeMealKey, setActiveMealKey] = useState<string>('breakfast');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [foodQuantity, setFoodQuantity] = useState<string>('100');
  const [foodUnit, setFoodUnit] = useState<string>('g');
  const [showManualFood, setShowManualFood] = useState<boolean>(false);
  const [customFoodName, setCustomFoodName] = useState<string>('');
  const [customFoodKcal, setCustomFoodKcal] = useState<string>('');

  // Estado temporal para añadir suplemento / producto
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [suppName, setSuppName] = useState<string>('');
  const [suppUrl, setSuppUrl] = useState<string>('');
  const [suppTiming, setSuppTiming] = useState<string>('En el Desayuno');
  const [suppDosage, setSuppDosage] = useState<string>('1 cápsula con agua');
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
        setSupplements([]);
      }
      setActiveTab(0);
      setActiveMealKey('breakfast');
      setShowManualFood(false);
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
      console.error('Error cargando catálogo:', e);
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
      dosage: suppDosage.trim() || '1 cápsula con agua',
      observations: suppObservations.trim() || undefined,
    };

    setSupplements((prev) => [...prev, newSupp]);
    setSelectedProduct(null);
    setSuppName('');
    setSuppUrl('');
    setSuppTiming('En el Desayuno');
    setSuppDosage('1 cápsula con agua');
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
          bgcolor: '#0A0A0C',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.9)',
          maxHeight: { xs: '100%', sm: '90vh' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header Apple Liquid Glass */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: 2.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(22, 22, 26, 0.85)',
          backdropFilter: 'blur(24px)',
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 14px)' : 2.2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
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
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              {dietToEdit ? 'Editar Pauta Nutricional' : 'Crear Pauta Nutricional & Dieta'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.78rem' }}>
              Hidratación diaria, 5 tomas de comidas y suplementación pautada
            </Typography>
          </Box>
        </Stack>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#fff' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Tabs Navigation Apple Inset Style */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.5, bgcolor: '#121216', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            minHeight: 46,
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 600,
              fontSize: '0.88rem',
              textTransform: 'none',
              minHeight: 46,
              px: 2.2,
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
      <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: '#0A0A0C', overflowY: 'auto' }}>
        {/* TAB 1: DATOS GENERALES E HIDRATACIÓN */}
        {activeTab === 0 && (
          <Stack spacing={3}>
            {/* Card Información Básica */}
            <Box
              sx={{
                p: { xs: 2.2, sm: 3 },
                borderRadius: '20px',
                bgcolor: '#16161A',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#34C759', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flame size={18} /> Información General del Plan
              </Typography>

              <Stack spacing={2.2}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.75, display: 'block', fontWeight: 600 }}>
                    Nombre del Plan / Dieta *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej: Dieta de Definición 2.200 kcal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    InputProps={{ sx: inputStyle }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.75, display: 'block', fontWeight: 600 }}>
                      Calorías Objetivo Diarias (Kcal)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      placeholder="2000"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      InputProps={{
                        sx: inputStyle,
                        endAdornment: <InputAdornment position="end"><Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 600 }}>kcal</Typography></InputAdornment>,
                      }}
                    />
                    {calculatedTotalCalories > 0 && (
                      <Typography variant="caption" sx={{ color: '#34C759', mt: 0.75, display: 'block', fontWeight: 700 }}>
                        ✓ Sumatorio real de las 5 comidas: {calculatedTotalCalories} kcal
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.75, display: 'block', fontWeight: 600 }}>
                      Presets Calóricos
                    </Typography>
                    <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                      {CALORIE_PRESETS.map((cal) => (
                        <Chip
                          key={cal}
                          label={`${cal}`}
                          size="small"
                          onClick={() => setCalories(cal)}
                          sx={{
                            bgcolor: calories === cal ? '#34C759' : 'rgba(255, 255, 255, 0.06)',
                            color: calories === cal ? '#000000' : '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: calories === cal ? '#34C759' : 'rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.15s ease',
                          }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.75, display: 'block', fontWeight: 600 }}>
                    Descripción o Resumen del Objetivo
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enfoque de macronutrientes, días de carga o descanso..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    InputProps={{ sx: inputStyle }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Card Hidratación Diaria Requerida */}
            <Box
              sx={{
                p: { xs: 2.2, sm: 3 },
                borderRadius: '20px',
                bgcolor: '#16161A',
                border: '1px solid rgba(0, 122, 255, 0.3)',
                boxShadow: '0 8px 30px rgba(0, 122, 255, 0.08)',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    bgcolor: 'rgba(0, 122, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#007AFF',
                  }}
                >
                  <Droplets size={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 800 }}>
                    Meta de Hidratación Diaria del Cliente
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Cantidad de agua en Litros que se asociará directamente a su perfil de seguimiento
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5} alignItems="center" sx={{ mt: 1 }}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    type="number"
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(Math.max(0.5, Number(e.target.value)))}
                    InputProps={{
                      sx: inputStyle,
                      endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#007AFF', fontWeight: 700, fontSize: '0.9rem' }}>Litros / día</Typography></InputAdornment>,
                      inputProps: { step: 0.1, min: 0.5, max: 8.0 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={7}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.75, display: 'block', fontWeight: 600 }}>
                    Recomendaciones rápidas:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {WATER_PRESETS.map((val) => (
                      <Chip
                        key={val}
                        label={`${val} L`}
                        onClick={() => setWaterLiters(val)}
                        sx={{
                          bgcolor: waterLiters === val ? '#007AFF' : 'rgba(255, 255, 255, 0.06)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: waterLiters === val ? '#007AFF' : 'rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.15s ease',
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
                p: { xs: 2.2, sm: 3 },
                borderRadius: '20px',
                bgcolor: '#16161A',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info size={18} color="#AF52DE" /> Pautas y Observaciones Generales
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Pautas sobre cocinado, sal, descansos o cómo distribuir las comidas a lo largo de su jornada laboral..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                InputProps={{ sx: inputStyle }}
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
                      minWidth: 125,
                      p: 1.8,
                      borderRadius: '16px',
                      bgcolor: isSelected ? 'rgba(52, 199, 89, 0.15)' : '#16161A',
                      border: isSelected ? '1.5px solid #34C759' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                    }}
                  >
                    <IconComponent size={22} color={isSelected ? '#34C759' : meal.color} style={{ margin: '0 auto 6px' }} />
                    <Typography variant="body2" fontWeight={isSelected ? 800 : 600} sx={{ color: isSelected ? '#34C759' : '#ffffff', fontSize: '0.85rem' }}>
                      {meal.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.72rem', mt: 0.25 }}>
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
                    p: { xs: 2.2, sm: 3 },
                    borderRadius: '20px',
                    bgcolor: '#16161A',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <currentMealDef.icon size={24} color={currentMealDef.color} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#ffffff' }}>
                          {currentMealDef.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Horario sugerido: {currentMealDef.defaultTime}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      icon={<Flame size={15} color="#FF9500" />}
                      label={`${totalMealKcal} kcal`}
                      sx={{ bgcolor: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 800, fontSize: '0.82rem' }}
                    />
                  </Stack>

                  {/* Formulario para añadir alimento a esta comida */}
                  <Box sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#1E1E24', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 3 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#34C759', mb: 1.5, display: 'block', fontSize: '0.82rem' }}>
                      + Añadir Alimento a {currentMealDef.label}
                    </Typography>

                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <Autocomplete
                          options={availableFoods}
                          getOptionLabel={(option) => `${option.name} (${option.calories} kcal/100g)`}
                          value={selectedFood}
                          onChange={(_, newVal) => {
                            setSelectedFood(newVal);
                            if (newVal) setCustomFoodName('');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Buscar en el catálogo de alimentos..."
                              size="small"
                              InputProps={{
                                ...params.InputProps,
                                sx: inputStyle,
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
                          placeholder="100"
                          value={foodQuantity}
                          onChange={(e) => setFoodQuantity(e.target.value)}
                          InputProps={{
                            sx: inputStyle,
                            endAdornment: <InputAdornment position="end"><Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{foodUnit}</Typography></InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={2.5}>
                        <TextField
                          fullWidth
                          size="small"
                          select
                          value={foodUnit}
                          onChange={(e) => setFoodUnit(e.target.value)}
                          SelectProps={{ native: true }}
                          InputProps={{
                            sx: inputStyle,
                          }}
                        >
                          <option value="g" style={{ background: '#1C1C1E', color: '#fff' }}>Gramos (g)</option>
                          <option value="ml" style={{ background: '#1C1C1E', color: '#fff' }}>Mililitros (ml)</option>
                          <option value="ud" style={{ background: '#1C1C1E', color: '#fff' }}>Unidades</option>
                          <option value="cucharada" style={{ background: '#1C1C1E', color: '#fff' }}>Cucharadas</option>
                          <option value="cazo" style={{ background: '#1C1C1E', color: '#fff' }}>Cazo (scoop)</option>
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
                            borderRadius: '12px',
                            height: 42,
                            textTransform: 'none',
                            fontSize: '0.88rem',
                            '&:hover': { bgcolor: '#2eb34f' },
                          }}
                        >
                          Añadir
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Toggle para entrada manual de alimento */}
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <Button
                        size="small"
                        onClick={() => setShowManualFood(!showManualFood)}
                        startIcon={showManualFood ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontSize: '0.78rem', p: 0 }}
                      >
                        {showManualFood ? 'Ocultar alimento manual libre' : '¿El alimento no está en el catálogo? Añadir manualmente'}
                      </Button>

                      <Collapse in={showManualFood}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Nombre del alimento (ej: Tortilla de 3 claras)"
                            value={customFoodName}
                            onChange={(e) => {
                              setCustomFoodName(e.target.value);
                              if (e.target.value) setSelectedFood(null);
                            }}
                            InputProps={{ sx: inputStyle }}
                          />
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Kcal / 100g"
                            value={customFoodKcal}
                            onChange={(e) => setCustomFoodKcal(e.target.value)}
                            InputProps={{ sx: inputStyle }}
                          />
                        </Stack>
                      </Collapse>
                    </Box>
                  </Box>

                  {/* Listado de alimentos añadidos en esta comida */}
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1.5, display: 'block', fontWeight: 700 }}>
                    Alimentos en {currentMealDef.label} ({currentFoods.length}):
                  </Typography>

                  {currentFoods.length === 0 ? (
                    <Box sx={{ p: 3.5, textAlign: 'center', borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
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
                            p: 1.8,
                            borderRadius: '14px',
                            bgcolor: '#1E1E24',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
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
                              {item.quantity} {item.unit || 'g'} • <strong style={{ color: '#FF9500' }}>{item.calories} kcal</strong>
                            </Typography>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFoodFromMeal(activeMealKey, idx)}
                            sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255,69,58,0.15)' } }}
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
                p: { xs: 2.2, sm: 3 },
                borderRadius: '20px',
                bgcolor: '#16161A',
                border: '1px solid rgba(255, 149, 0, 0.25)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#FF9500', fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pill size={18} /> Suplementación & Productos Recomendados
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 2.5 }}>
                Añade suplementos o productos con su enlace directo de compra (Amazon, HSN, MyProtein, etc.) y pautas de dosificación.
              </Typography>

              {/* Formulario para añadir suplemento */}
              <Box sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#1E1E24', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 3 }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#FF9500', mb: 1.5, display: 'block' }}>
                  + Añadir Recomendación de Producto / Suplemento
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, display: 'block', fontWeight: 600 }}>
                      Seleccionar de mis productos
                    </Typography>
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
                          placeholder="Buscar producto guardado..."
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            sx: inputStyle,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, display: 'block', fontWeight: 600 }}>
                      O nombre libre
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ej: Multivitamínico Solaray, Creatina Creapure"
                      value={suppName}
                      onChange={(e) => setSuppName(e.target.value)}
                      InputProps={{ sx: inputStyle }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, display: 'block', fontWeight: 600 }}>
                      Enlace de compra del producto (URL)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="https://www.amazon.es/... o HSN, Prozis, MyProtein"
                      value={suppUrl}
                      onChange={(e) => setSuppUrl(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LinkIcon size={16} color="#007AFF" /></InputAdornment>,
                        sx: inputStyle,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, display: 'block', fontWeight: 600 }}>
                      Momento de la toma / Timing
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ej: En el Desayuno, Pre-entreno, En la Cena"
                      value={suppTiming}
                      onChange={(e) => setSuppTiming(e.target.value)}
                      InputProps={{ sx: inputStyle }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, display: 'block', fontWeight: 600 }}>
                      Dosis recomendada
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ej: 1 cápsula con agua, 5g diarios"
                      value={suppDosage}
                      onChange={(e) => setSuppDosage(e.target.value)}
                      InputProps={{ sx: inputStyle }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, display: 'block', fontWeight: 600 }}>
                      Observaciones o modo de empleo
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Ej: Tomar siempre con una comida grasa para mejorar absorción..."
                      value={suppObservations}
                      onChange={(e) => setSuppObservations(e.target.value)}
                      InputProps={{ sx: inputStyle }}
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
                        borderRadius: '12px',
                        py: 1.2,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        '&:hover': { bgcolor: '#e08500' },
                      }}
                    >
                      Añadir Suplemento a la Pauta
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Lista de suplementos prescritos */}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1.5, display: 'block', fontWeight: 700 }}>
                Suplementos Prescritos ({supplements.length}):
              </Typography>

              {supplements.length === 0 ? (
                <Box sx={{ p: 3.5, textAlign: 'center', borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    No hay suplementos prescritos. Añádelos arriba con su enlace de compra.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {supplements.map((supp, index) => (
                    <Box
                      key={supp.id || index}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: '#1E1E24',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
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
                                sx={{ bgcolor: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 700, fontSize: '0.74rem' }}
                              />
                            )}
                            {supp.dosage && (
                              <Chip
                                size="small"
                                label={supp.dosage}
                                sx={{ bgcolor: 'rgba(52, 199, 89, 0.15)', color: '#34C759', fontWeight: 700, fontSize: '0.74rem' }}
                              />
                            )}
                          </Stack>

                          {supp.observations && (
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.82rem', mt: 0.5 }}>
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
                                  fontSize: '0.8rem',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                <ExternalLink size={13} /> Ver enlace de compra
                              </a>
                            </Box>
                          )}
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSupplement(index)}
                          sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255,69,58,0.15)' } }}
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
          px: { xs: 2.5, sm: 3.5 },
          py: 2.2,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(22, 22, 26, 0.85)',
          backdropFilter: 'blur(24px)',
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 14px)' : 2.2,
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            flex: 1,
            height: 46,
            borderRadius: '14px',
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
            height: 46,
            borderRadius: '14px',
            bgcolor: '#34C759',
            color: '#000000',
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '0.94rem',
            boxShadow: '0 4px 16px rgba(52, 199, 89, 0.3)',
            '&:hover': { bgcolor: '#2eb34f' },
          }}
        >
          {dietToEdit ? 'Guardar Pauta' : 'Crear Pauta Nutricional'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DietForm;