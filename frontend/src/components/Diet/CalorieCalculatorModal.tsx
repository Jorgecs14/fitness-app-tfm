import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material'
import { Iconify } from '../../utils/iconify'

interface CalorieCalculatorModalProps {
  open: boolean
  onClose: () => void
  onApplyTargetCalories?: (targetCalories: number, macros: { protein: number; carbs: number; fat: number }) => void
}

export const CalorieCalculatorModal: React.FC<CalorieCalculatorModalProps> = ({
  open,
  onClose,
  onApplyTargetCalories
}) => {
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState<number>(25)
  const [weight, setWeight] = useState<number>(75)
  const [height, setHeight] = useState<number>(175)
  const [activity, setActivity] = useState<number>(1.375)
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose')

  // BMR Formula (Mifflin-St Jeor)
  const calculateBMR = () => {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161
    }
  }

  const bmr = Math.round(calculateBMR())
  const tdee = Math.round(bmr * activity)

  let targetCalories = tdee
  if (goal === 'lose') {
    targetCalories = Math.round(tdee * 0.8) // Deficit 20%
  } else if (goal === 'gain') {
    targetCalories = Math.round(tdee * 1.15) // Surplus 15%
  }

  // Distribution: Protein 30%, Carbs 45%, Fat 25%
  const proteinGrams = Math.round((targetCalories * 0.3) / 4)
  const carbsGrams = Math.round((targetCalories * 0.45) / 4)
  const fatGrams = Math.round((targetCalories * 0.25) / 9)

  const handleApply = () => {
    if (onApplyTargetCalories) {
      onApplyTargetCalories(targetCalories, {
        protein: proteinGrams,
        carbs: carbsGrams,
        fat: fatGrams
      })
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon='solar:calculator-minimalistic-bold-duotone' width={28} color='#00a76f' />
        Calculadora de Calorías Diarias y Macros
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label='Género'
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
            >
              <MenuItem value='male'>👨 Hombre</MenuItem>
              <MenuItem value='female'>👩 Mujer</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type='number'
              label='Edad (años)'
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type='number'
              label='Peso (kg)'
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type='number'
              label='Altura (cm)'
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label='Nivel de Actividad Física'
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
            >
              <MenuItem value={1.2}>🪑 Sedentario (poco o ningún ejercicio)</MenuItem>
              <MenuItem value={1.375}>🚶 Ligero (1-3 días/semana)</MenuItem>
              <MenuItem value={1.55}>🏃 Moderado (3-5 días/semana)</MenuItem>
              <MenuItem value={1.725}>🏋️ Fuerte (6-7 días/semana)</MenuItem>
              <MenuItem value={1.9}>⚡ Muy Intenso (atleta profesional)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label='Objetivo Nutricional'
              value={goal}
              onChange={(e) => setGoal(e.target.value as any)}
            >
              <MenuItem value='lose'>🔥 Perder Grasa / Definición (-20% cal)</MenuItem>
              <MenuItem value='maintain'>⚖️ Mantener Peso Actual</MenuItem>
              <MenuItem value='gain'>💪 Ganar Masa Muscular / Volumen (+15% cal)</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ bgcolor: 'background.neutral', p: 2, borderRadius: 2 }}>
          <Typography variant='subtitle1' fontWeight='bold' gutterBottom align='center'>
            📊 Tus Resultados Estimados
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant='caption' color='text.secondary'>Metabolismo Basal</Typography>
                  <Typography variant='h6' color='primary.main'>{bmr} kcal</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant='caption' color='text.secondary'>Mantenimiento (TDEE)</Typography>
                  <Typography variant='h6' color='warning.main'>{tdee} kcal</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant='caption' color='text.secondary'>Objetivo Diario</Typography>
                  <Typography variant='h6' color='success.main'>{targetCalories} kcal</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2.5, p: 1.5, borderRadius: 1.5, border: '1px dashed #bdbdbd' }}>
            <Typography variant='subtitle2' align='center' gutterBottom>
              🥩 Desglose Recomendado de Macronutrientes
            </Typography>
            <Grid container spacing={1} textAlign='center'>
              <Grid item xs={4}>
                <Typography variant='body2' fontWeight='bold' color='info.main'>Proteínas</Typography>
                <Typography variant='h6'>{proteinGrams} g</Typography>
                <Typography variant='caption' color='text.secondary'>30% ({proteinGrams * 4} kcal)</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant='body2' fontWeight='bold' color='warning.main'>Carbohidratos</Typography>
                <Typography variant='h6'>{carbsGrams} g</Typography>
                <Typography variant='caption' color='text.secondary'>45% ({carbsGrams * 4} kcal)</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant='body2' fontWeight='bold' color='error.main'>Grasas</Typography>
                <Typography variant='h6'>{fatGrams} g</Typography>
                <Typography variant='caption' color='text.secondary'>25% ({fatGrams * 9} kcal)</Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color='inherit'>
          Cerrar
        </Button>
        <Button onClick={handleApply} variant='contained' color='primary' startIcon={<Iconify icon='solar:check-circle-bold' />}>
          Usar {targetCalories} kcal en mi Dieta
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default CalorieCalculatorModal
