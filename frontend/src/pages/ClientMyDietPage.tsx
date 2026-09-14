import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip
} from '@mui/material'
import { Iconify } from '../utils/iconify'
import { getCurrentUser } from '../services/userService'
import { getDietsWithFoods, getDietWithFoods, getUserDiet } from '../services/dietService'
import { DietWithFoods } from '../types/DietWithFoods'
import { User } from '../types/User'
import { DietMealChecklist } from '../components/Diet/DietMealChecklist'
import { DietVisualPdfModal } from '../components/Diet/DietVisualPdfModal'
import { CalorieCalculatorModal } from '../components/Diet/CalorieCalculatorModal'
import { ClientDietBuilderModal } from '../components/Diet/ClientDietBuilderModal'
import { DietFoodsManager } from '../components/Diet/DietFoodsManager'
import { MacroRings } from '../components/Diet/MacroRings'

export const ClientMyDietPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [diet, setDiet] = useState<DietWithFoods | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [dietBuilderOpen, setDietBuilderOpen] = useState(false)
  const [foodsManagerOpen, setFoodsManagerOpen] = useState(false)
  const [editingDietTarget, setEditingDietTarget] = useState<DietWithFoods | null>(null)

  useEffect(() => {
    loadDiet()
  }, [])

  const loadDiet = async () => {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      setCurrentUser(user)

      // 1. Intentar obtener la dieta directa asignada a este usuario
      let matchedDiet = await getUserDiet(user.id)

      // 2. Si no hay dieta directa, consultar la lista completa con alimentos
      if (!matchedDiet) {
        const diets = await getDietsWithFoods()
        if (diets.length > 0) {
          try {
            matchedDiet = await getDietWithFoods(diets[0].id)
          } catch (e) {
            matchedDiet = diets[0]
          }
        }
      }

      setDiet(matchedDiet)
    } catch (err) {
      console.error('Error cargando dieta:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography fontStyle="italic">Cargando tu plan nutricional y retos de comida...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            🥗 Mi Plan Nutricional & Retos Diarios
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Sigue tus objetivos de alimentación, marca cada comida realizada y exporta tu plan oficial en PDF.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          <Button
            variant="outlined"
            className="liquid-pill"
            color="primary"
            startIcon={<Iconify icon="solar:calculator-minimalistic-bold-duotone" width={20} />}
            onClick={() => setCalculatorOpen(true)}
            sx={{ px: 2.2, py: 1 }}
          >
            Calculadora Calórica
          </Button>

          {diet && (
            <Button
              variant="contained"
              className="liquid-pill"
              color="primary"
              startIcon={<Iconify icon="eva:edit-2-fill" width={20} />}
              onClick={() => {
                setEditingDietTarget(diet)
                setDietBuilderOpen(true)
              }}
              sx={{ px: 2.2, py: 1 }}
            >
              Editar Mi Dieta
            </Button>
          )}

          {diet && (
            <Button
              variant="outlined"
              className="liquid-pill"
              color="secondary"
              startIcon={<Iconify icon="solar:plate-bold" width={20} />}
              onClick={() => setFoodsManagerOpen(true)}
              sx={{ px: 2.2, py: 1 }}
            >
              Gestionar Alimentos
            </Button>
          )}

          <Button
            variant="outlined"
            className="liquid-pill"
            color="success"
            startIcon={<Iconify icon="solar:pen-new-square-bold" width={20} />}
            onClick={() => {
              setEditingDietTarget(null)
              setDietBuilderOpen(true)
            }}
            sx={{ px: 2.2, py: 1 }}
          >
            Nueva Dieta
          </Button>

          {diet && (
            <Button
              variant="contained"
              className="liquid-pill"
              color="primary"
              startIcon={<Iconify icon="solar:document-bold-duotone" width={20} />}
              onClick={() => setPdfModalOpen(true)}
              sx={{
                px: 2.5,
                py: 1,
                background: 'linear-gradient(135deg, #00a76f 0%, #007849 100%)',
                boxShadow: '0 4px 14px rgba(0, 167, 111, 0.35)'
              }}
            >
              Exportar PDF
            </Button>
          )}
        </Stack>
      </Stack>

      {!diet ? (
        <Box className="liquid-glass-card" sx={{ p: 4, textAlign: 'center' }}>
          <Iconify icon="solar:chef-hat-heart-bold" width={64} height={64} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Aún no tienes una dieta configurada
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Puedes crear tu propia dieta personalizada o elegir una de nuestras plantillas nutricionales basadas en tu gasto calórico.
          </Typography>
          <Button
            variant="contained"
            className="liquid-pill"
            color="primary"
            size="large"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => {
              setEditingDietTarget(null)
              setDietBuilderOpen(true)
            }}
            sx={{ fontWeight: 'bold', px: 3, py: 1.2 }}
          >
            Crear Mi Plan Nutricional Ahora
          </Button>
        </Box>
      ) : (
        <Stack spacing={3.5}>
          {/* Anillos de Macros Apple-Style */}
          <MacroRings
            target={{
              proteins: Math.round(((diet.calories || 2200) * 0.30) / 4),
              carbs: Math.round(((diet.calories || 2200) * 0.45) / 4),
              fats: Math.round(((diet.calories || 2200) * 0.25) / 9),
              calories: diet.calories || 2200,
            }}
            goalType={(diet.calories || 2200) < 2000 ? 'deficit' : (diet.calories || 2200) > 2600 ? 'surplus' : 'maintenance'}
            title={`Distribución de Macros • ${diet.name}`}
            subtitle="Equilibrio nutricional diario calculado para optimizar tu rendimiento y composición"
          />

          {/* Ficha Resumen Dieta */}
          <Box className="liquid-glass-card" sx={{ p: 3.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#f8fafc', letterSpacing: '-0.01em' }}>
                  {diet.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5, maxWidth: 650, lineHeight: 1.6 }}>
                  {diet.description || 'Pautas de nutrición personalizadas para tu objetivo físico.'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  icon={<Iconify icon="solar:fire-bold" width={20} sx={{ color: '#ff7043 !important' }} />}
                  label={`${diet.calories} Kcal / día`}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    py: 2,
                    px: 1.5,
                    borderRadius: '9999px',
                    bgcolor: 'rgba(255, 112, 67, 0.15)',
                    color: '#ff7043',
                    border: '1px solid rgba(255, 112, 67, 0.3)',
                    boxShadow: '0 0 16px rgba(255, 112, 67, 0.25)',
                  }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  className="liquid-pill"
                  startIcon={<Iconify icon="eva:edit-2-outline" />}
                  onClick={() => {
                    setEditingDietTarget(diet)
                    setDietBuilderOpen(true)
                  }}
                  sx={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)', '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' } }}
                >
                  Editar Plan
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  className="liquid-pill"
                  color="secondary"
                  startIcon={<Iconify icon="solar:plate-bold" />}
                  onClick={() => setFoodsManagerOpen(true)}
                >
                  Alimentos ({diet.diet_foods?.length || 0})
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Componente de Retos Alimenticios Interactivos */}
          {currentUser && (
            <DietMealChecklist
              diet={diet}
              userId={currentUser.id}
              userName={`${currentUser.name} ${currentUser.surname}`}
            />
          )}
        </Stack>
      )}

      {/* MODALES DISPONIBLES SIEMPRE (FUERA DEL CONDICIONAL) */}
      {/* Modal PDF Visual */}
      {diet && (
        <DietVisualPdfModal
          open={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          diet={diet}
          clientUser={currentUser}
          trainerUser={currentUser?.trainer || null}
        />
      )}

      {/* Modal Calculadora Calórica */}
      <CalorieCalculatorModal
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />

      {/* Modal Creador / Editor de Dieta */}
      {currentUser && (
        <ClientDietBuilderModal
          open={dietBuilderOpen}
          onClose={() => setDietBuilderOpen(false)}
          userId={currentUser.id}
          dietToEdit={editingDietTarget}
          onSuccess={loadDiet}
        />
      )}

      {/* Modal Gestor de Alimentos de la Dieta */}
      {diet && (
        <DietFoodsManager
          open={foodsManagerOpen}
          diet={diet}
          onClose={() => setFoodsManagerOpen(false)}
          onSave={loadDiet}
        />
      )}
    </Box>
  )
}

export default ClientMyDietPage
