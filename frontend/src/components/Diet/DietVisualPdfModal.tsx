import React, { useRef, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Stack,
  Chip,
  Divider,
  Paper
} from '@mui/material'
import { Iconify } from '../../utils/iconify'
import { DietWithFoods } from '../../types/DietWithFoods'
import { User } from '../../types/User'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { MEAL_TIMES } from './DietMealChecklist'

interface DietVisualPdfModalProps {
  open: boolean
  onClose: () => void
  diet: DietWithFoods
  clientUser?: User | null
  trainerUser?: User | null
}

export const DietVisualPdfModal: React.FC<DietVisualPdfModalProps> = ({
  open,
  onClose,
  diet,
  clientUser,
  trainerUser
}) => {
  const printRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  // Estimación de macronutrientes basada en calorías
  const totalCals = diet.calories || 2000
  const proteinGrams = Math.round((totalCals * 0.3) / 4)
  const carbsGrams = Math.round((totalCals * 0.45) / 4)
  const fatGrams = Math.round((totalCals * 0.25) / 9)

  const handleDownloadPdf = async () => {
    if (!printRef.current) return
    try {
      setDownloading(true)
      const element = printRef.current

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      pdf.save(`Dieta_Semanal_${diet.name.replace(/\s+/g, '_')}.pdf`)
    } catch (e) {
      console.error('Error generando PDF visual:', e)
      alert('Error al descargar el PDF. Inténtalo de nuevo.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
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
            <Iconify icon="solar:document-bold-duotone" width={26} height={26} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#f8fafc' }}>
            Plantilla PDF Editorial de Dieta Semanal
          </Typography>
        </Stack>
        <Button size="small" onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}>
          Cerrar
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1, sm: 3 }, bgcolor: 'transparent' }}>
        {/* Plantilla imprimible capturada por html2canvas */}
        <Box
          ref={printRef}
          sx={{
            width: '100%',
            bgcolor: '#ffffff',
            borderRadius: 3,
            p: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: 'white',
              mb: 4
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="overline" letterSpacing={2} sx={{ color: '#38bdf8', fontWeight: 'bold' }}>
                  FITNESS APP TFM • PLAN NUTRICIONAL
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>
                  {diet.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                  {diet.description || 'Plan de nutrición personalizado y pautas de alimentación diaria.'}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Chip
                  label={`${diet.calories} KCAL / DÍA`}
                  sx={{
                    bgcolor: '#ef4444',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    py: 2.5,
                    px: 2,
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                  Emisión: {new Date().toLocaleDateString('es-ES')}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Ficha Cliente & Entrenador */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  CLIENTE ASIGNADO
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                  {clientUser ? `${clientUser.name} ${clientUser.surname}` : 'Cliente General'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {clientUser?.email || 'N/A'}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  ENTRENADOR RESPONSABLE
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="secondary.main">
                  {trainerUser ? `${trainerUser.name} ${trainerUser.surname}` : 'Entrenador Personal TFM'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trainerUser?.email || 'Soporte Nutricional TFM'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Desglose de Macronutrientes Visual */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:chart-2-bold-duotone" width={22} style={{ color: '#6366f1' }} />
            Distribución Diaria Objetivo de Macronutrientes
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 3 }}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                <Typography variant="caption" color="#1e40af" fontWeight="bold">
                  PROTEÍNAS (30%)
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#1d4ed8">
                  {proteinGrams}g
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ~{proteinGrams * 4} kcal
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 3 }}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Typography variant="caption" color="#166534" fontWeight="bold">
                  CARBOHIDRATOS (45%)
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#15803d">
                  {carbsGrams}g
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ~{carbsGrams * 4} kcal
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 3 }}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff7ed', borderRadius: 2, border: '1px solid #fed7aa' }}>
                <Typography variant="caption" color="#9a3412" fontWeight="bold">
                  GRASAS SALUDABLES (25%)
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#c2410c">
                  {fatGrams}g
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ~{fatGrams * 9} kcal
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 3 }}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#ecfeff', borderRadius: 2, border: '1px solid #a5f3fc' }}>
                <Typography variant="caption" color="#155e75" fontWeight="bold">
                  HIDRATACIÓN
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#0891b2">
                  3.0 Litros
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Agua / Infusiones
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Estructura Semanal por Tomas */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:calendar-bold-duotone" width={22} style={{ color: '#059669' }} />
            Distribución de Tomas Diarias y Alimentos
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {MEAL_TIMES.map((meal, idx) => {
              const foods = diet.diet_foods || []
              const foodsPerMeal = Math.max(1, Math.ceil(foods.length / MEAL_TIMES.length))
              const mealFoods = foods.slice(idx * foodsPerMeal, idx * foodsPerMeal + foodsPerMeal)

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={meal.key}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: '1px solid #e2e8f0',
                      bgcolor: '#fafafa'
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon={meal.icon} width={20} style={{ color: meal.color }} />
                        <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                          {meal.title}
                        </Typography>
                      </Stack>

                      <Chip label={meal.time} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
                      {meal.suggestedMacro}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {mealFoods.length > 0 ? (
                      mealFoods.map((f) => (
                        <Box key={f.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                          <Typography variant="body2" fontWeight="medium">
                            • {f.foods?.name || `Alimento #${f.food_id}`}
                          </Typography>
                          <Typography variant="caption" color="primary.main" fontWeight="bold">
                            {f.quantity} g ({f.foods?.calories || 0} kcal)
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Toma equilibrada según macros objetivo.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              )
            })}
          </Grid>

          {/* Sección de Pautas y Recomendaciones */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #cbd5e1' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
              📌 Pautas Nutricionales & Recomendaciones del Entrenador
            </Typography>

            <Typography variant="caption" color="text.secondary" paragraph sx={{ mb: 1 }}>
              1. <strong>Pesaje de Alimentos:</strong> Pesar todos los alimentos en crudo antes de cocinar salvo indicación expresa.
            </Typography>

            <Typography variant="caption" color="text.secondary" paragraph sx={{ mb: 1 }}>
              2. <strong>Aceite de Oliva:</strong> Máximo 2 cucharadas soperas (20ml) al día para aliño y cocinado.
            </Typography>

            <Typography variant="caption" color="text.secondary" paragraph sx={{ mb: 0 }}>
              3. <strong>Sustituciones:</strong> Puedes sustituir fuentes de proteína (pollo por pavo o pescado blanco) manteniendo los mismos gramos.
            </Typography>
          </Paper>

          {/* Footer de la Plantilla */}
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Documento Oficial generado por Fitness App TFM • Todos los derechos reservados
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: 'rgba(15, 23, 42, 0.7)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button onClick={onClose} disabled={downloading} sx={{ borderRadius: '9999px', color: '#94a3b8', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleDownloadPdf}
          disabled={downloading}
          startIcon={<Iconify icon="solar:download-minimalistic-bold" width={20} />}
          sx={{
            borderRadius: '9999px',
            px: 3,
            py: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0891b2 0%, #059669 100%)',
              boxShadow: '0 6px 20px rgba(6, 182, 212, 0.5)',
            },
          }}
        >
          {downloading ? 'Generando PDF Alta Calidad...' : 'Descargar PDF Profesional'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DietVisualPdfModal
