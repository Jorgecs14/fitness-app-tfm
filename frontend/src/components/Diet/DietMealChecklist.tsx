import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  Paper,
  Alert,
  Button,
  Grid
} from '@mui/material'
import { Iconify } from '../../utils/iconify'
import { DietWithFoods } from '../../types/DietWithFoods'
import { DietFood } from '../../types/DietFood'
import {
  getMealChecks,
  toggleMealCheck,
  getMealCheckStreak,
  StreakInfo
} from '../../services/mealCheckService'

interface DietMealChecklistProps {
  diet: DietWithFoods
  userId: number
  readOnly?: boolean
  userName?: string
}

export interface MealSchedule {
  key: string
  title: string
  time: string
  icon: string
  color: string
  suggestedMacro: string
}

export const MEAL_TIMES: MealSchedule[] = [
  { key: 'breakfast', title: 'Desayuno', time: '08:00 - 08:30', icon: 'solar:cup-hot-bold', color: '#FF9800', suggestedMacro: 'Carbohidratos complejos + Proteína' },
  { key: 'mid_morning', title: 'Media Mañana', time: '11:00 - 11:30', icon: 'solar:apple-bold', color: '#4CAF50', suggestedMacro: 'Fruta + Frutos secos' },
  { key: 'lunch', title: 'Almuerzo', time: '14:00 - 14:40', icon: 'solar:plate-bold', color: '#2196F3', suggestedMacro: 'Proteína + Verduras + Carbohidratos' },
  { key: 'snack', title: 'Merienda', time: '17:30 - 18:00', icon: 'solar:donut-bitten-bold', color: '#9C27B0', suggestedMacro: 'Batido / Snack proteico' },
  { key: 'dinner', title: 'Cena', time: '21:00 - 21:40', icon: 'solar:chef-hat-bold-duotone', color: '#E91E63', suggestedMacro: 'Proteína magra + Verduras de hoja verde' }
]

export const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' }
]

export const DietMealChecklist: React.FC<DietMealChecklistProps> = ({
  diet,
  userId,
  readOnly = false,
  userName
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('mon')
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({})
  const [streak, setStreak] = useState<StreakInfo>({ streakDays: 0, totalChecks: 0, activeDays: 0 })

  const dateStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadChecks()
    loadStreak()
  }, [userId, diet.id, selectedDay])

  const loadChecks = async () => {
    try {
      const checks = await getMealChecks(userId, dateStr)
      const map: Record<string, boolean> = {}
      checks.forEach((c) => {
        const checkKey = `${c.meal_key}_${c.food_id || 0}`
        map[checkKey] = c.completed
      })
      setCheckedMap(map)
    } catch (e) {
      console.error(e)
    }
  }

  const loadStreak = async () => {
    const data = await getMealCheckStreak(userId)
    setStreak(data)
  }

  const handleToggle = async (mealKey: string, foodId?: number) => {
    if (readOnly) return
    const checkKey = `${mealKey}_${foodId || 0}`
    const isCurrentlyChecked = !!checkedMap[checkKey]
    const nextState = !isCurrentlyChecked

    // Actualización optimista de UI
    setCheckedMap((prev) => ({
      ...prev,
      [checkKey]: nextState
    }))

    try {
      await toggleMealCheck({
        user_id: userId,
        diet_id: diet.id,
        check_date: dateStr,
        meal_key: mealKey,
        food_id: foodId || null,
        completed: nextState
      })
      loadStreak()
    } catch (e) {
      // Revertir en caso de error
      setCheckedMap((prev) => ({
        ...prev,
        [checkKey]: isCurrentlyChecked
      }))
    }
  }

  // Agrupar alimentos por comidas
  const foods: DietFood[] = diet.diet_foods || []
  const foodsPerMeal = Math.max(1, Math.ceil(foods.length / MEAL_TIMES.length))

  const mealItemsMap = MEAL_TIMES.reduce((acc, meal, index) => {
    const start = index * foodsPerMeal
    const mealFoods = foods.slice(start, start + foodsPerMeal)
    acc[meal.key] = mealFoods
    return acc
  }, {} as Record<string, DietFood[]>)

  // Calcular progreso total
  const totalMealSlots = MEAL_TIMES.length
  let checkedCount = 0
  MEAL_TIMES.forEach((meal) => {
    const mealFoods = mealItemsMap[meal.key] || []
    if (mealFoods.length > 0) {
      const allChecked = mealFoods.every((f) => checkedMap[`${meal.key}_${f.food_id}`])
      if (allChecked) checkedCount++
    } else {
      if (checkedMap[`${meal.key}_0`]) checkedCount++
    }
  })

  const progressPercent = Math.round((checkedCount / totalMealSlots) * 100)

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {/* Header Banner */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Iconify icon="solar:checklist-minimalistic-bold-duotone" width={28} style={{ color: '#38bdf8' }} />
              <Typography variant="h5" fontWeight="bold">
                Retos Alimenticios y Seguimiento Diario
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {userName ? `Progreso interactivo de ${userName}` : 'Haz check en cada comida conforme completes tu plan diario'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<Iconify icon="solar:fire-bold" width={18} style={{ color: '#ff7043' }} />}
              label={`Racha: ${streak.streakDays} Días 🔥`}
              sx={{ bgcolor: 'rgba(255,112,67,0.15)', color: '#ff7043', fontWeight: 'bold', border: '1px solid rgba(255,112,67,0.3)' }}
            />
            <Chip
              icon={<Iconify icon="solar:medal-star-bold" width={18} style={{ color: '#facc15' }} />}
              label={`${progressPercent}% Cumplido`}
              sx={{ bgcolor: 'rgba(250,204,21,0.15)', color: '#facc15', fontWeight: 'bold', border: '1px solid rgba(250,204,21,0.3)' }}
            />
          </Stack>
        </Stack>

        {/* Progress bar */}
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {checkedCount} de {totalMealSlots} tomas completadas hoy
            </Typography>

            <Typography variant="caption" fontWeight="bold">
              Meta Diaria: {diet.calories} Kcal
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: progressPercent === 100
                  ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)'
              }
            }}
          />
        </Box>
      </Box>

      {/* Days Selector */}
      <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          {DAYS_OF_WEEK.map((day) => (
            <Button
              key={day.key}
              size="small"
              variant={selectedDay === day.key ? 'contained' : 'text'}
              color="primary"
              onClick={() => setSelectedDay(day.key)}
              sx={{
                borderRadius: 2,
                minWidth: 44,
                fontWeight: selectedDay === day.key ? 'bold' : 'normal'
              }}
            >
              {day.label}
            </Button>
          ))}
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {progressPercent === 100 && (
          <Alert severity="success" icon={<Iconify icon="solar:cup-star-bold" width={24} />} sx={{ mb: 3, borderRadius: 2 }}>
            <strong>¡Excelente trabajo! 🎉</strong> Has completado el 100% de tus retos nutricionales para este día. ¡Mantén la disciplina!
          </Alert>
        )}

        <Grid container spacing={2}>
          {MEAL_TIMES.map((meal) => {
            const mealFoods = mealItemsMap[meal.key] || []
            const isSingleCheckMode = mealFoods.length === 0
            const singleCheckKey = `${meal.key}_0`
            const isSingleChecked = !!checkedMap[singleCheckKey]

            return (
              <Grid size={{ xs: 12, md: 6 }} key={meal.key}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.25s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                      borderColor: meal.color
                    }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${meal.color}15`,
                          color: meal.color
                        }}
                      >
                        <Iconify icon={meal.icon} width={22} />
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#f8fafc' }}>
                          {meal.title}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {meal.time}
                        </Typography>
                      </Box>
                    </Stack>

                    {isSingleCheckMode && (
                      <Checkbox
                        checked={isSingleChecked}
                        disabled={readOnly}
                        onChange={() => handleToggle(meal.key, 0)}
                        sx={{
                          color: meal.color,
                          '&.Mui-checked': { color: meal.color }
                        }}
                      />
                    )}
                  </Stack>

                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontStyle: 'italic', mb: 1 }}>
                    💡 {meal.suggestedMacro}
                  </Typography>

                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

                  {mealFoods.length > 0 ? (
                    <Stack spacing={1}>
                      {mealFoods.map((f) => {
                        const checkKey = `${meal.key}_${f.food_id}`
                        const isChecked = !!checkedMap[checkKey]
                        const foodName = f.foods?.name || `Alimento #${f.food_id}`
                        const foodKcal = f.foods?.calories || 0

                        return (
                          <Box
                            key={f.id}
                            onClick={() => !readOnly && handleToggle(meal.key, f.food_id)}
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: readOnly ? 'default' : 'pointer',
                              backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                              border: '1px solid',
                              borderColor: isChecked ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.18)' : 'rgba(34, 211, 238, 0.06)',
                                borderColor: isChecked ? 'rgba(16, 185, 129, 0.5)' : 'rgba(34, 211, 238, 0.25)',
                              }
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Checkbox
                                size="small"
                                checked={isChecked}
                                disabled={readOnly}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleToggle(meal.key, f.food_id)
                                }}
                                sx={{ p: 0.5, color: meal.color, '&.Mui-checked': { color: meal.color } }}
                              />

                              <Typography
                                variant="body2"
                                fontWeight={isChecked ? 'bold' : 'medium'}
                                sx={{
                                  textDecoration: isChecked ? 'line-through' : 'none',
                                  color: isChecked ? 'text.secondary' : 'text.primary'
                                }}
                              >
                                {foodName}
                              </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1}>
                              <Chip label={`${f.quantity} g`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                              <Chip label={`${foodKcal} kcal`} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                            </Stack>
                          </Box>
                        )
                      })}
                    </Stack>
                  ) : (
                    <Box
                      onClick={() => !readOnly && handleToggle(meal.key, 0)}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: readOnly ? 'default' : 'pointer',
                        backgroundColor: isSingleChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid',
                        borderColor: isSingleChecked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: isSingleChecked ? 'rgba(16, 185, 129, 0.18)' : 'rgba(34, 211, 238, 0.06)',
                          borderColor: isSingleChecked ? 'rgba(16, 185, 129, 0.5)' : 'rgba(34, 211, 238, 0.25)',
                        }
                      }}
                    >
                      <Typography variant="body2" color={isSingleChecked ? 'text.secondary' : 'text.primary'} sx={{ textDecoration: isSingleChecked ? 'line-through' : 'none' }}>
                        {isSingleChecked ? 'Comida Registrada como Completada' : 'Marcar toma como realizada'}
                      </Typography>

                      <Chip
                        label={isSingleChecked ? 'Completado' : 'Pendiente'}
                        size="small"
                        color={isSingleChecked ? 'success' : 'default'}
                        variant={isSingleChecked ? 'filled' : 'outlined'}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default DietMealChecklist
