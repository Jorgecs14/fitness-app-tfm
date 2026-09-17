import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  Grid
} from '@mui/material';
import {
  CheckCircle2,
  Circle,
  Flame,
  Award,
  Coffee,
  Apple,
  UtensilsCrossed,
  Cookie,
  ChefHat,
  Clock
} from 'lucide-react';
import { DietWithFoods } from '../../types/DietWithFoods';
import { DietFood } from '../../types/DietFood';
import {
  getMealChecks,
  toggleMealCheck,
  getMealCheckStreak,
  StreakInfo
} from '../../services/mealCheckService';

interface DietMealChecklistProps {
  diet: DietWithFoods;
  userId: number;
  readOnly?: boolean;
  userName?: string;
}

export interface MealSchedule {
  key: string;
  title: string;
  time: string;
  icon: any;
  color: string;
  suggestedMacro: string;
}

export const MEAL_TIMES: MealSchedule[] = [
  { key: 'breakfast', title: 'Desayuno', time: '08:00 - 08:30', icon: Coffee, color: '#FF9500', suggestedMacro: 'Carbohidratos complejos + Proteína' },
  { key: 'mid_morning', title: 'Media Mañana', time: '11:00 - 11:30', icon: Apple, color: '#34C759', suggestedMacro: 'Fruta + Frutos secos' },
  { key: 'lunch', title: 'Almuerzo', time: '14:00 - 14:40', icon: UtensilsCrossed, color: '#007AFF', suggestedMacro: 'Proteína + Verduras + Carbohidratos' },
  { key: 'snack', title: 'Merienda', time: '17:30 - 18:00', icon: Cookie, color: '#AF52DE', suggestedMacro: 'Batido / Snack proteico' },
  { key: 'dinner', title: 'Cena', time: '21:00 - 21:40', icon: ChefHat, color: '#FF2D55', suggestedMacro: 'Proteína magra + Verduras' }
];

export const DAYS_OF_WEEK = [
  { key: 'mon', label: 'L' },
  { key: 'tue', label: 'M' },
  { key: 'wed', label: 'X' },
  { key: 'thu', label: 'J' },
  { key: 'fri', label: 'V' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'D' }
];

export const DietMealChecklist: React.FC<DietMealChecklistProps> = ({
  diet,
  userId,
  readOnly = false,
  userName
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('mon');
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState<StreakInfo>({ streakDays: 0, totalChecks: 0, activeDays: 0 });

  const dateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadChecks();
    loadStreak();
  }, [userId, diet.id, selectedDay]);

  const loadChecks = async () => {
    try {
      const checks = await getMealChecks(userId, dateStr);
      const map: Record<string, boolean> = {};
      checks.forEach((c) => {
        const checkKey = `${c.meal_key}_${c.food_id || 0}`;
        map[checkKey] = c.completed;
      });
      setCheckedMap(map);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStreak = async () => {
    const data = await getMealCheckStreak(userId);
    setStreak(data);
  };

  const handleToggle = async (mealKey: string, foodId?: number) => {
    if (readOnly) return;
    const checkKey = `${mealKey}_${foodId || 0}`;
    const isCurrentlyChecked = !!checkedMap[checkKey];
    const nextState = !isCurrentlyChecked;

    setCheckedMap((prev) => ({
      ...prev,
      [checkKey]: nextState
    }));

    try {
      await toggleMealCheck({
        user_id: userId,
        diet_id: diet.id,
        check_date: dateStr,
        meal_key: mealKey,
        food_id: foodId || null,
        completed: nextState
      });
      loadStreak();
    } catch (e) {
      setCheckedMap((prev) => ({
        ...prev,
        [checkKey]: isCurrentlyChecked
      }));
    }
  };

  // Obtener alimentos por comida desde meals_data o fallback a diet_foods
  const mealItemsMap = useMemo(() => {
    let structuredMeals: Record<string, any[]> = {};
    if (diet.meals_data) {
      structuredMeals = typeof diet.meals_data === 'string' ? JSON.parse(diet.meals_data) : diet.meals_data;
    }

    const hasStructured = Object.values(structuredMeals).some((arr) => Array.isArray(arr) && arr.length > 0);

    if (hasStructured) {
      const map: Record<string, any[]> = {};
      MEAL_TIMES.forEach((m) => {
        map[m.key] = structuredMeals[m.key] || [];
      });
      return map;
    }

    // Fallback con diet_foods
    const foods: DietFood[] = diet.diet_foods || [];
    const foodsPerMeal = Math.max(1, Math.ceil(foods.length / MEAL_TIMES.length));

    return MEAL_TIMES.reduce((acc, meal, index) => {
      const start = index * foodsPerMeal;
      const mealFoods = foods.slice(start, start + foodsPerMeal);
      acc[meal.key] = mealFoods;
      return acc;
    }, {} as Record<string, any[]>);
  }, [diet]);

  const totalMealSlots = MEAL_TIMES.length;
  let checkedCount = 0;
  MEAL_TIMES.forEach((meal) => {
    const mealFoods = mealItemsMap[meal.key] || [];
    if (mealFoods.length > 0) {
      const allChecked = mealFoods.every((f) => {
        const idKey = f.food_id || f.id || 0;
        return checkedMap[`${meal.key}_${idKey}`];
      });
      if (allChecked) checkedCount++;
    } else {
      if (checkedMap[`${meal.key}_0`]) checkedCount++;
    }
  });

  const progressPercent = Math.round((checkedCount / totalMealSlots) * 100);

  return (
    <Box className="apple-card" sx={{ overflow: 'hidden' }}>
      {/* Header Banner Apple Style */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          background: 'linear-gradient(180deg, #1C1C1E 0%, #161618 100%)',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Retos Nutricionales & Registro Diario
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {userName ? `Seguimiento de ${userName}` : 'Registra tus tomas conforme las vayas realizando'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<Flame size={14} color="#FF9500" />}
              label={`Racha: ${streak.streakDays}d`}
              size="small"
              sx={{ bgcolor: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', fontWeight: 700, height: 24, fontSize: '0.72rem' }}
            />
            <Chip
              icon={<Award size={14} color="#34C759" />}
              label={`${progressPercent}% Cumplido`}
              size="small"
              sx={{ bgcolor: 'rgba(52, 199, 89, 0.15)', color: '#34C759', fontWeight: 700, height: 24, fontSize: '0.72rem' }}
            />
          </Stack>
        </Stack>

        {/* Progress bar Apple Style */}
        <Box sx={{ mt: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {checkedCount} de {totalMealSlots} tomas completadas
            </Typography>

            <Typography variant="caption" fontWeight="700" sx={{ color: '#FFFFFF' }}>
              Meta: {diet.calories} kcal
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: progressPercent === 100 ? '#34C759' : '#007AFF',
              }
            }}
          />
        </Box>
      </Box>

      {/* Days Selector (Apple Segmented Style) */}
      <Box sx={{ p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.02)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day.key;
            return (
              <Box
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  background: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? '#000000' : 'rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    background: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                  }
                }}
              >
                {day.label}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Meals Grid */}
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={2}>
          {MEAL_TIMES.map((meal) => {
            const IconComp = meal.icon;
            const mealFoods = mealItemsMap[meal.key] || [];
            const isSingleCheckMode = mealFoods.length === 0;
            const singleCheckKey = `${meal.key}_0`;
            const isSingleChecked = !!checkedMap[singleCheckKey];

            return (
              <Grid size={{ xs: 12, md: 6 }} key={meal.key}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    background: '#1C1C1E',
                    border: '0.5px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.2 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${meal.color}15`,
                          color: meal.color
                        }}
                      >
                        <IconComp size={18} />
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF' }}>
                          {meal.title}
                        </Typography>

                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                          {meal.time}
                        </Typography>
                      </Box>
                    </Stack>

                    {isSingleCheckMode && (
                      <Box
                        onClick={() => !readOnly && handleToggle(meal.key, 0)}
                        sx={{ cursor: readOnly ? 'default' : 'pointer' }}
                      >
                        {isSingleChecked ? (
                          <CheckCircle2 size={24} color="#34C759" />
                        ) : (
                          <Circle size={24} color="rgba(255, 255, 255, 0.2)" />
                        )}
                      </Box>
                    )}
                  </Stack>

                  <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.4)', mb: 1 }}>
                    💡 {meal.suggestedMacro}
                  </Typography>

                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

                  {mealFoods.length > 0 ? (
                    <Stack spacing={0.8}>
                      {mealFoods.map((f, fIdx) => {
                        const foodIdentifier = f.food_id || f.id || fIdx + 1;
                        const checkKey = `${meal.key}_${foodIdentifier}`;
                        const isChecked = !!checkedMap[checkKey];
                        const foodName = f.name || f.foods?.name || `Alimento #${foodIdentifier}`;
                        const foodKcal = f.calories !== undefined ? f.calories : (f.foods?.calories || 0);
                        const foodQty = f.quantity || 100;
                        const foodUnit = f.unit || 'g';

                        return (
                          <Box
                            key={f.id || fIdx}
                            onClick={() => !readOnly && handleToggle(meal.key, foodIdentifier)}
                            sx={{
                              p: 1,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: readOnly ? 'default' : 'pointer',
                              backgroundColor: isChecked ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                              border: '0.5px solid',
                              borderColor: isChecked ? 'rgba(52, 199, 89, 0.3)' : 'transparent',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              {isChecked ? (
                                <CheckCircle2 size={18} color="#34C759" />
                              ) : (
                                <Circle size={18} color="rgba(255, 255, 255, 0.2)" />
                              )}

                              <Typography
                                variant="body2"
                                fontWeight={isChecked ? '600' : '500'}
                                sx={{
                                  textDecoration: isChecked ? 'line-through' : 'none',
                                  color: isChecked ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF',
                                  fontSize: '0.85rem'
                                }}
                              >
                                {foodName}
                              </Typography>
                            </Stack>

                            <Stack direction="row" spacing={0.8}>
                              <Chip label={`${foodQty} ${foodUnit}`} size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: 'rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.7)' }} />
                              <Chip label={`${foodKcal} kcal`} size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: 'rgba(0, 122, 255, 0.15)', color: '#007AFF' }} />
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box
                      onClick={() => !readOnly && handleToggle(meal.key, 0)}
                      sx={{
                        p: 1.2,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: readOnly ? 'default' : 'pointer',
                        backgroundColor: isSingleChecked ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        border: '0.5px solid',
                        borderColor: isSingleChecked ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: isSingleChecked ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF', textDecoration: isSingleChecked ? 'line-through' : 'none' }}>
                        {isSingleChecked ? 'Comida Registrada' : 'Toca para marcar como realizada'}
                      </Typography>

                      <Chip
                        label={isSingleChecked ? 'Completado' : 'Pendiente'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          bgcolor: isSingleChecked ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: isSingleChecked ? '#34C759' : 'rgba(255, 255, 255, 0.5)',
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default DietMealChecklist;
