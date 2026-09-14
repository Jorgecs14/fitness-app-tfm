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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
          <Iconify icon='solar:calculator-minimalistic-bold-duotone' width={26} height={26} />
        </Box>
        <Typography variant='h6' fontWeight={800} sx={{ color: '#f8fafc' }}>
          Calculadora de Calorías Diarias y Macros
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label='Género'
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
            >
              <MenuItem value='male'>👨 Hombre</MenuItem>
              <MenuItem value='female'>👩 Mujer</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              type='number'
              label='Edad (años)'
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              type='number'
              label='Peso (kg)'
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              type='number'
              label='Altura (cm)'
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label='Nivel de Actividad Física'
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
            >
              <MenuItem value={1.2}>🪑 Sedentario (oficina, poco o ningún ejercicio)</MenuItem>
              <MenuItem value={1.375}>🚶 Ligero (actividad leve, 1-3 días/semana)</MenuItem>
              <MenuItem value={1.55}>🏃 Moderado (fuerza o cardio 3-5 días/semana)</MenuItem>
              <MenuItem value={1.725}>🏋️ Fuerte (entrenamiento intenso 6-7 días/semana)</MenuItem>
              <MenuItem value={1.9}>⚡ Muy Intenso (doble sesión o atleta profesional)</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label='Objetivo Físico'
              value={goal}
              onChange={(e) => setGoal(e.target.value as any)}
            >
              <MenuItem value='lose'>🔥 Perder Grasa / Definición (-20% cal)</MenuItem>
              <MenuItem value='maintain'>⚖️ Mantener Peso / Recomposición</MenuItem>
              <MenuItem value='gain'>💪 Ganar Masa Muscular / Volumen (+15% cal)</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Resultados Estimados */}
        <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', p: 2.5, borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Typography variant='subtitle2' fontWeight={800} sx={{ color: '#f8fafc', textAlign: 'center', mb: 2 }}>
            📊 Estimación Metabólica (Mifflin-St Jeor)
          </Typography>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '14px', bgcolor: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
                <Typography variant='caption' sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>Metabolismo Basal</Typography>
                <Typography variant='subtitle1' fontWeight={800} sx={{ color: '#38bdf8' }}>{bmr} kcal</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '14px', bgcolor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Typography variant='caption' sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>Gasto Total (TDEE)</Typography>
                <Typography variant='subtitle1' fontWeight={800} sx={{ color: '#fbbf24' }}>{tdee} kcal</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '14px', bgcolor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <Typography variant='caption' sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>Objetivo Diario</Typography>
                <Typography variant='subtitle1' fontWeight={800} sx={{ color: '#34d399' }}>{targetCalories} kcal</Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Desglose de Macros */}
          <Box sx={{ mt: 2.5, p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant='caption' sx={{ fontWeight: 800, color: '#e2e8f0', display: 'block', textAlign: 'center', mb: 1.5 }}>
              🥩 Reparto Recomendado de Macronutrientes
            </Typography>
            <Grid container spacing={1} textAlign='center'>
              <Grid size={{ xs: 4 }}>
                <Typography variant='caption' fontWeight={700} sx={{ color: '#fb7185' }}>Proteínas</Typography>
                <Typography variant='h6' fontWeight={800} sx={{ color: '#f8fafc' }}>{proteinGrams}g</Typography>
                <Typography variant='caption' sx={{ color: '#94a3b8' }}>30% ({proteinGrams * 4} kcal)</Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant='caption' fontWeight={700} sx={{ color: '#38bdf8' }}>Carbohidratos</Typography>
                <Typography variant='h6' fontWeight={800} sx={{ color: '#f8fafc' }}>{carbsGrams}g</Typography>
                <Typography variant='caption' sx={{ color: '#94a3b8' }}>45% ({carbsGrams * 4} kcal)</Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant='caption' fontWeight={700} sx={{ color: '#fbbf24' }}>Grasas</Typography>
                <Typography variant='h6' fontWeight={800} sx={{ color: '#f8fafc' }}>{fatGrams}g</Typography>
                <Typography variant='caption' sx={{ color: '#94a3b8' }}>25% ({fatGrams * 9} kcal)</Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: 'rgba(15, 23, 42, 0.7)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button onClick={onClose} sx={{ borderRadius: '9999px', color: '#94a3b8', fontWeight: 600, '&:hover': { color: '#f8fafc' } }}>
          Cerrar
        </Button>
        <Button
          onClick={handleApply}
          variant='contained'
          startIcon={<Iconify icon='solar:check-circle-bold' width={18} />}
          sx={{
            borderRadius: '9999px',
            px: 3,
            py: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
              boxShadow: '0 6px 20px rgba(6, 182, 212, 0.5)',
            },
          }}
        >
          Usar {targetCalories} kcal en mi Plan
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default CalorieCalculatorModal
