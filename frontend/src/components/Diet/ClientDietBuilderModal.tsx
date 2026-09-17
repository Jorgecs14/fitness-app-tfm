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
  Collapse,
  Select,
  MenuItem,
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
  Link as LinkIcon,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
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
const UNITS = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'ud', label: 'Unidades (ud)' },
  { value: 'cucharada', label: 'Cucharadas' },
  { value: 'cazo', label: 'Cazos / Scoops' },
];
const TIMINGS = [
  'En el Desayuno',
  'Media Mañana',
  'En el Almuerzo',
  'Merienda',
  'Pre-entreno',
  'Post-entreno',
  'En la Cena',
  'Antes de dormir',
];

const MEAL_DEFINITIONS = [
  { key: 'breakfast', label: 'Desayuno', icon: Coffee, color: '#FF9500', defaultTime: '08:00 - 08:30' },
  { key: 'mid_morning', label: 'Media Mañana', icon: Apple, color: '#34C759', defaultTime: '11:00 - 11:30' },
  { key: 'lunch', label: 'Almuerzo', icon: Salad, color: '#007AFF', defaultTime: '14:00 - 14:30' },
  { key: 'snack', label: 'Merienda', icon: Cookie, color: '#AF52DE', defaultTime: '17:30 - 18:00' },
  { key: 'dinner', label: 'Cena', icon: ChefHat, color: '#FF2D55', defaultTime: '21:00 - 21:30' },
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
      color: 'rgba(255, 255, 255, 0.45) !important',
      opacity: 1,
    },
  },
};

const selectFieldSx = {
  bgcolor: '#1C1C1E',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '0.88rem',
  height: 40,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#34C759',
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

const selectMenuPaperSx = {
  bgcolor: '#1C1C1E',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '12px',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
  '& .MuiMenuItem-root': {
    fontSize: '0.88rem',
    color: '#ffffff',
    '&.Mui-selected': {
      bgcolor: 'rgba(52, 199, 89, 0.2)',
      fontWeight: 700,
    },
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.08)',
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
  const [showManualFood, setShowManualFood] = useState<boolean>(false);
  const [customFoodName, setCustomFoodName] = useState<string>('');
  const [customFoodKcal, setCustomFoodKcal] = useState<string>('');

  // Formulario temporal suplemento
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [suppName, setSuppName] = useState<string>('');
  const [suppUrl, setSuppUrl] = useState<string>('');
  const [suppTiming, setSuppTiming] = useState<string>('En el Desayuno');
  const [suppDosage, setSuppDosage] = useState<string>('1 cápsula con agua');
  const [suppObservations, setSuppObservations] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setActiveTab(0);
      setActiveMealKey('breakfast');
      setShowManualFood(false);
      setErrorMsg(null);
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

  const calculatedTotalCalories = useMemo(() => {
    let total = 0;
    Object.values(mealsData).forEach((foodList) => {
      foodList.forEach((item) => {
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

  const handleSaveDiet = async () => {
    if (!name.trim()) {
      setErrorMsg('Por favor indica un nombre para el plan nutricional');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      calories: calculatedTotalCalories > 0 ? calculatedTotalCalories : calories,
      water_liters: Number(waterLiters) || 2.5,
      meals_data: mealsData,
      supplement_products: supplements,
      notes: generalNotes.trim(),
      export_template: 'visual',
    };

    try {
      if (dietToEdit?.id) {
        await updateDiet(dietToEdit.id, payload);
      } else {
        const created = await createDiet(payload);
        if (created?.id && userId) {
          await assignUserToDiet(created.id, userId);
        }
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Error guardando la pauta nutricional');
    } finally {
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
          bgcolor: '#0B0B0E',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.9)',
          maxHeight: { xs: '100%', sm: '90vh' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
          background: 'rgba(22, 22, 26, 0.9)',
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
              {dietToEdit ? 'Editar Pauta del Cliente' : 'Prescribir Nueva Pauta al Cliente'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.78rem' }}>
              Configuración de hidratación, 5 comidas diarias y suplementos recomendados
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

      {/* Tabs Navigation */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1, bgcolor: '#121216', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
                fontWeight: 800,
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
      <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: '#0B0B0E', overflowY: 'auto' }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px', bgcolor: 'rgba(255,69,58,0.15)', color: '#FF453A', border: '1px solid rgba(255,69,58,0.3)' }}>
            {errorMsg}
          </Alert>
        )}

        {/* TAB 1: DATOS GENERALES E HIDRATACIÓN */}
        {activeTab === 0 && (
          <Stack spacing={3}>
            {/* Card Información Básica */}
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '20px',
                bgcolor: '#16161A',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#34C759', fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flame size={18} /> Información General del Plan
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.75, display: 'block', fontWeight: 700, fontSize: '0.82rem' }}>
                    Nombre del Plan / Dieta *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej: Dieta Personalizada Definición 2.200 kcal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={textFieldSx}
                  />
                </Box>

                {/* Calorías & Presets */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.75, display: 'block', fontWeight: 700, fontSize: '0.82rem' }}>
                    Calorías Objetivo Diarias (Kcal)
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="2200"
                        value={calories}
                        onChange={(e) => setCalories(Number(e.target.value))}
                        sx={textFieldSx}
                        InputProps={{
                          endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#FF9500', fontSize: '0.85rem', fontWeight: 800 }}>kcal</Typography></InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap alignItems="center">
                        {CALORIE_PRESETS.map((cal) => (
                          <Chip
                            key={cal}
                            label={`${cal}`}
                            size="small"
                            onClick={() => setCalories(cal)}
                            sx={{
                              bgcolor: calories === cal ? '#34C759' : '#1C1C1E',
                              color: calories === cal ? '#000000' : '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: calories === cal ? '#34C759' : 'rgba(255, 255, 255, 0.15)',
                              transition: 'all 0.15s ease',
                            }}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>

                  {calculatedTotalCalories > 0 && (
                    <Box sx={{ mt: 1.5, p: 1.2, borderRadius: '10px', bgcolor: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.25)', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#34C759', fontWeight: 700 }}>
                        ✓ Sumatorio real de los alimentos configurados en las 5 comidas: <strong>{calculatedTotalCalories} kcal</strong>
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.75, display: 'block', fontWeight: 700, fontSize: '0.82rem' }}>
                    Descripción o Resumen del Objetivo
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enfoque de macronutrientes, días de carga o descanso..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={textFieldSx}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Card Hidratación Diaria Requerida */}
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '20px',
                bgcolor: '#16161A',
                border: '1px solid rgba(0, 122, 255, 0.35)',
                boxShadow: '0 8px 30px rgba(0, 122, 255, 0.08)',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '12px',
                    bgcolor: 'rgba(0, 122, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#007AFF',
                    border: '1px solid rgba(0, 122, 255, 0.3)',
                  }}
                >
                  <Droplets size={20} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 800 }}>
                    Meta de Hidratación Diaria del Cliente
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                    Cantidad de agua en Litros que se asociará directamente a su perfil de seguimiento
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5} alignItems="center" sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => setWaterLiters((prev) => Math.max(0.5, Number((prev - 0.5).toFixed(1))))}
                      sx={{ bgcolor: '#1C1C1E', color: '#007AFF', border: '1px solid rgba(0, 122, 255, 0.3)', width: 40, height: 40 }}
                    >
                      <Minus size={16} />
                    </IconButton>

                    <TextField
                      fullWidth
                      type="number"
                      value={waterLiters}
                      onChange={(e) => setWaterLiters(Math.max(0.5, Number(e.target.value)))}
                      sx={textFieldSx}
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#007AFF', fontWeight: 800, fontSize: '0.88rem' }}>L/día</Typography></InputAdornment>,
                        inputProps: { step: 0.1, min: 0.5, max: 8.0 },
                      }}
                    />

                    <IconButton
                      size="small"
                      onClick={() => setWaterLiters((prev) => Math.min(8.0, Number((prev + 0.5).toFixed(1))))}
                      sx={{ bgcolor: '#1C1C1E', color: '#007AFF', border: '1px solid rgba(0, 122, 255, 0.3)', width: 40, height: 40 }}
                    >
                      <Plus size={16} />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={7}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.75, display: 'block', fontWeight: 600 }}>
                    Valores rápidos sugeridos:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {WATER_PRESETS.map((val) => (
                      <Chip
                        key={val}
                        label={`${val} L`}
                        onClick={() => setWaterLiters(val)}
                        sx={{
                          bgcolor: waterLiters === val ? '#007AFF' : '#1C1C1E',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: waterLiters === val ? '#007AFF' : 'rgba(255, 255, 255, 0.15)',
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
                p: { xs: 2.5, sm: 3 },
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
                placeholder="Pautas sobre cocinado, sal, descansos o cómo distribuir las comidas a lo largo de la jornada laboral..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                sx={textFieldSx}
              />
            </Box>
          </Stack>
        )}

        {/* TAB 2: LAS 5 COMIDAS ESTRUCTURADAS */}
        {activeTab === 1 && (
          <Stack spacing={2.5}>
            {/* Selector de Comida Activa */}
            <Stack direction="row" spacing={1.2} sx={{ overflowX: 'auto', pb: 1 }}>
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
                      minWidth: 130,
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
                    <Typography variant="body2" fontWeight={isSelected ? 800 : 700} sx={{ color: isSelected ? '#34C759' : '#ffffff', fontSize: '0.85rem' }}>
                      {meal.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', display: 'block', fontSize: '0.74rem', mt: 0.25 }}>
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
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: '20px',
                    bgcolor: '#16161A',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <currentMealDef.icon size={26} color={currentMealDef.color} />
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
                      sx={{ bgcolor: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 800, fontSize: '0.85rem' }}
                    />
                  </Stack>

                  {/* Formulario para añadir alimento a esta comida */}
                  <Box sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#1C1C20', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 3 }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: '#34C759', mb: 1.5, display: 'block', fontSize: '0.85rem' }}>
                      + Añadir Alimento a {currentMealDef.label}
                    </Typography>

                    <Grid container spacing={1.8} alignItems="flex-end">
                      <Grid item xs={12} sm={4.5}>
                        <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                          Alimento
                        </Typography>
                        <Autocomplete
                          options={availableFoods}
                          getOptionLabel={(option) => `${option.name} (${option.calories} kcal/100g)`}
                          value={selectedFood}
                          onChange={(_, newVal) => {
                            setSelectedFood(newVal);
                            if (newVal) setCustomFoodName('');
                          }}
                          componentsProps={{ paper: { sx: autocompletePaperSx } }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Buscar en catálogo..."
                              size="small"
                              sx={textFieldSx}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={6} sm={2.5}>
                        <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                          Cantidad
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="100"
                          value={foodQuantity}
                          onChange={(e) => setFoodQuantity(e.target.value)}
                          sx={textFieldSx}
                        />
                      </Grid>

                      <Grid item xs={6} sm={2.5}>
                        <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                          Unidad
                        </Typography>
                        <Select
                          fullWidth
                          value={foodUnit}
                          onChange={(e) => setFoodUnit(e.target.value)}
                          sx={selectFieldSx}
                          MenuProps={{ PaperProps: { sx: selectMenuPaperSx } }}
                        >
                          {UNITS.map((u) => (
                            <MenuItem key={u.value} value={u.value}>
                              {u.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>

                      <Grid item xs={12} sm={2.5}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleAddFoodToMeal}
                          disabled={!selectedFood && !customFoodName.trim()}
                          sx={{
                            bgcolor: '#34C759',
                            color: '#000000',
                            fontWeight: 800,
                            borderRadius: '12px',
                            height: 40,
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
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Button
                        size="small"
                        onClick={() => setShowManualFood(!showManualFood)}
                        startIcon={showManualFood ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        sx={{ color: '#007AFF', textTransform: 'none', fontSize: '0.8rem', p: 0, fontWeight: 700 }}
                      >
                        {showManualFood ? 'Ocultar entrada manual' : '¿Alimento no encontrado en catálogo? Escribir libremente'}
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
                            sx={textFieldSx}
                          />
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Kcal / 100g"
                            value={customFoodKcal}
                            onChange={(e) => setCustomFoodKcal(e.target.value)}
                            sx={{ ...textFieldSx, minWidth: { sm: 150 } }}
                          />
                        </Stack>
                      </Collapse>
                    </Box>
                  </Box>

                  {/* Listado de alimentos añadidos en esta comida */}
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1.5, display: 'block', fontWeight: 700 }}>
                    Alimentos en {currentMealDef.label} ({currentFoods.length}):
                  </Typography>

                  {currentFoods.length === 0 ? (
                    <Box sx={{ p: 3.5, textAlign: 'center', borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.12)' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
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
                            bgcolor: '#1C1C20',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={800} sx={{ color: '#ffffff' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                              {item.quantity} {item.unit || 'g'} • <strong style={{ color: '#FF9500' }}>{item.calories} kcal</strong>
                            </Typography>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFoodFromMeal(activeMealKey, idx)}
                            sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.15)' } }}
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
                p: { xs: 2.5, sm: 3 },
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
              <Box sx={{ p: 2.2, borderRadius: '16px', bgcolor: '#1C1C20', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 3 }}>
                <Typography variant="caption" fontWeight={800} sx={{ color: '#FF9500', mb: 1.5, display: 'block' }}>
                  + Añadir Recomendación de Producto / Suplemento
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                      Seleccionar de mis productos guardados
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
                      componentsProps={{ paper: { sx: autocompletePaperSx } }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Buscar producto guardado..."
                          size="small"
                          sx={textFieldSx}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                      O nombre libre del producto
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ej: Multivitamínico Solaray, Creatina Creapure"
                      value={suppName}
                      onChange={(e) => setSuppName(e.target.value)}
                      sx={textFieldSx}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 700 }}>
                        Enlace de compra del producto (URL)
                      </Typography>
                      {suppUrl && suppUrl.startsWith('http') && (
                        <a
                          href={suppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#007AFF',
                            fontSize: '0.74rem',
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
                      size="small"
                      placeholder="https://www.amazon.es/... o HSN, Prozis, MyProtein"
                      value={suppUrl}
                      onChange={(e) => setSuppUrl(e.target.value)}
                      sx={textFieldSx}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LinkIcon size={16} color="#007AFF" /></InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                      Momento de la toma (Timing)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ej: En el Desayuno, Pre-entreno, En la Cena"
                      value={suppTiming}
                      onChange={(e) => setSuppTiming(e.target.value)}
                      sx={textFieldSx}
                    />
                    <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                      {TIMINGS.map((t) => (
                        <Chip
                          key={t}
                          label={t}
                          size="small"
                          onClick={() => setSuppTiming(t)}
                          sx={{
                            bgcolor: suppTiming === t ? '#FF9500' : '#1C1C1E',
                            color: suppTiming === t ? '#000000' : 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: suppTiming === t ? '#FF9500' : 'rgba(255, 255, 255, 0.12)',
                          }}
                        />
                      ))}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                      Dosis recomendada
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ej: 1 cápsula con agua, 5g diarios"
                      value={suppDosage}
                      onChange={(e) => setSuppDosage(e.target.value)}
                      sx={textFieldSx}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                      Observaciones de este suplemento
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Ej: Tomar siempre con una comida grasa para mejorar absorción..."
                      value={suppObservations}
                      onChange={(e) => setSuppObservations(e.target.value)}
                      sx={textFieldSx}
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
                        color: '#000000',
                        fontWeight: 800,
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
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1.5, display: 'block', fontWeight: 700 }}>
                Suplementos Prescritos ({supplements.length}):
              </Typography>

              {supplements.length === 0 ? (
                <Box sx={{ p: 3.5, textAlign: 'center', borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.12)' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    No hay suplementos prescritos en esta pauta. Añádelos arriba.
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
                        bgcolor: '#1C1C20',
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
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block', mt: 0.5 }}>
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
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <ExternalLink size={13} /> Enlace de compra ({supp.url.length > 35 ? `${supp.url.substring(0, 35)}...` : supp.url})
                              </a>
                            </Box>
                          )}
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSupplement(index)}
                          sx={{ color: '#FF453A', '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.15)' } }}
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

      {/* Footer de Acciones Apple Style */}
      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: 2.2,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(22, 22, 26, 0.95)',
          backdropFilter: 'blur(20px)',
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
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' },
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSaveDiet}
          disabled={!name.trim() || isSubmitting}
          sx={{
            bgcolor: '#34C759',
            color: '#000000',
            fontWeight: 800,
            borderRadius: '12px',
            px: 3.5,
            py: 1,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': { bgcolor: '#2eb34f' },
            '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.3)' },
          }}
        >
          {isSubmitting ? 'Guardando...' : dietToEdit ? 'Guardar Cambios' : 'Prescribir al Cliente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
