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
import { getDietsWithFoods, getDietWithFoods } from '../services/dietService'
import { DietWithFoods } from '../types/DietWithFoods'
import { User } from '../types/User'
import { DietMealChecklist } from '../components/Diet/DietMealChecklist'
import { DietVisualPdfModal } from '../components/Diet/DietVisualPdfModal'

export const ClientMyDietPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [diet, setDiet] = useState<DietWithFoods | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)

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

      if (diets.length > 0) {
        // Cargar primera dieta o detallada
        try {
          const detail = await getDietWithFoods(diets[0].id)
          matchedDiet = detail
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
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
            }}
          >
            Exportar PDF Visual
          </Button>
        )}
      </Stack>

      {!diet ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No tienes una dieta asignada actualmente. Contacta a tu Entrenador Personal para que te active un plan nutricional a tu medida.
        </Alert>
      ) : (
        <Stack spacing={3}>
          {/* Ficha Resumen Dieta */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {diet.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
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
        </Stack>
      )}
    </Box>
  )
}

export default ClientMyDietPage

