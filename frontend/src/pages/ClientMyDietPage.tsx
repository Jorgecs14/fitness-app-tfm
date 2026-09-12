import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Alert,
  Stack,
  Button,
  Chip
} from '@mui/material'
import { Iconify } from '../utils/iconify'
import { getCurrentUser } from '../services/userService'
import { getDietsWithFoods, getDietWithFoods, getDietUsers } from '../services/dietService'
import { DietWithFoods } from '../types/DietWithFoods'
import { User } from '../types/User'
import { DietMealChecklist } from '../components/Diet/DietMealChecklist'
import { DietVisualPdfModal } from '../components/Diet/DietVisualPdfModal'
import { CalorieCalculatorModal } from '../components/Diet/CalorieCalculatorModal'
import { ClientDietBuilderModal } from '../components/Diet/ClientDietBuilderModal'

export const ClientMyDietPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [diet, setDiet] = useState<DietWithFoods | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [dietBuilderOpen, setDietBuilderOpen] = useState(false)

  useEffect(() => {
    loadDiet()
  }, [])

  const loadDiet = async () => {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      setCurrentUser(user)

      const diets = await getDietsWithFoods()
      let matchedDiet: DietWithFoods | null = null

      for (const d of diets) {
        try {
          const users = await getDietUsers(d.id)
          if (users.some((u: any) => u.id === user.id)) {
            matchedDiet = await getDietWithFoods(d.id)
            break
          }
        } catch (e) {
          // Si falla consulta de usuarios individuales
        }
      }

      if (!matchedDiet && diets.length > 0) {
        try {
          matchedDiet = await getDietWithFoods(diets[0].id)
        } catch (e) {
          matchedDiet = diets[0]
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
            color="primary"
            startIcon={<Iconify icon="solar:calculator-minimalistic-bold-duotone" width={20} />}
            onClick={() => setCalculatorOpen(true)}
            sx={{ borderRadius: 2.5, py: 1.2, px: 2 }}
          >
            Calculadora Calórica
          </Button>

          <Button
            variant="outlined"
            color="success"
            startIcon={<Iconify icon="solar:pen-new-square-bold" width={20} />}
            onClick={() => setDietBuilderOpen(true)}
            sx={{ borderRadius: 2.5, py: 1.2, px: 2 }}
          >
            {diet ? 'Cambiar Mi Dieta' : 'Crear Mi Dieta'}
          </Button>

          {diet && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:document-bold-duotone" width={20} />}
              onClick={() => setPdfModalOpen(true)}
              sx={{
                borderRadius: 2.5,
                py: 1.2,
                px: 2.5,
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
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <Iconify icon="solar:chef-hat-heart-bold" width={64} height={64} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Aún no tienes una dieta configurada
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Puedes crear tu propia dieta personalizada o elegir una de nuestras plantillas nutricionales basadas en tu gasto calórico.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => setDietBuilderOpen(true)}
            sx={{ fontWeight: 'bold', borderRadius: 2.5 }}
          >
            Crear Mi Plan Nutricional Ahora
          </Button>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {/* Ficha Resumen Dieta */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {diet.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                  {diet.description || 'Pautas de nutrición personalizadas para tu objetivo físico.'}
                </Typography>
              </Box>

              <Chip
                icon={<Iconify icon="solar:fire-bold" width={20} />}
                label={`${diet.calories} Kcal / día`}
                color="error"
                sx={{ fontWeight: 'bold', fontSize: '1.1rem', py: 2.5, px: 2 }}
              />
            </Stack>
          </Paper>

          {/* Componente de Retos Alimenticios Interactivos */}
          {currentUser && (
            <DietMealChecklist
              diet={diet}
              userId={currentUser.id}
              userName={`${currentUser.name} ${currentUser.surname}`}
            />
          )}

          {/* Modal PDF Visual */}
          <DietVisualPdfModal
            open={pdfModalOpen}
            onClose={() => setPdfModalOpen(false)}
            diet={diet}
            clientUser={currentUser}
            trainerUser={currentUser?.trainer || null}
          />

          {/* Modal Calculadora Calórica */}
          <CalorieCalculatorModal
            open={calculatorOpen}
            onClose={() => setCalculatorOpen(false)}
          />

          {/* Modal Creador de Dieta */}
          {currentUser && (
            <ClientDietBuilderModal
              open={dietBuilderOpen}
              onClose={() => setDietBuilderOpen(false)}
              userId={currentUser.id}
              onSuccess={loadDiet}
            />
          )}
        </Stack>
      )}
    </Box>
  )
}

export default ClientMyDietPage

