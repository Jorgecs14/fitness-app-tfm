import React, { useRef, useState } from 'react';
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
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  X,
  Download,
  Flame,
  User as UserIcon,
  ShieldCheck,
  Calendar,
  Sparkles,
  Droplets,
  Activity,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { DietWithFoods } from '../../types/DietWithFoods';
import { User } from '../../types/User';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MEAL_TIMES } from './DietMealChecklist';

interface DietVisualPdfModalProps {
  open: boolean;
  onClose: () => void;
  diet: DietWithFoods;
  clientUser?: User | null;
  trainerUser?: User | null;
  userName?: string;
}

export const DietVisualPdfModal: React.FC<DietVisualPdfModalProps> = ({
  open,
  onClose,
  diet,
  clientUser,
  trainerUser,
  userName
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Estimación de macronutrientes basada en calorías
  const totalCals = diet.calories || 2000;
  const proteinGrams = Math.round((totalCals * 0.3) / 4);
  const carbsGrams = Math.round((totalCals * 0.45) / 4);
  const fatGrams = Math.round((totalCals * 0.25) / 9);

  const clientDisplayName = userName || (clientUser ? `${clientUser.name} ${clientUser.surname || ''}`.trim() : 'Cliente General');
  const trainerDisplayName = trainerUser ? `${trainerUser.name} ${trainerUser.surname || ''}`.trim() : 'Entrenador Personal TFM';

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setDownloading(true);
      const element = printRef.current;

      // Render at fixed 800px width with high resolution scale
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight <= pdfHeight) {
        // Fits on a single A4 page perfectly
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Multi-page clean pagination
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(`Dieta_${diet.name.replace(/\s+/g, '_')}_FitnessPro.pdf`);
    } catch (e) {
      console.error('Error generando PDF visual:', e);
      alert('Error al descargar el PDF. Inténtalo de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* ===== MODAL DE PREVISUALIZACIÓN UX/UI APPLE HIG ===== */}
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: '24px' },
            bgcolor: '#121214',
            color: '#FFFFFF',
            border: '0.5px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            px: 2.5,
            borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
            bgcolor: '#161618',
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                bgcolor: 'rgba(0, 122, 255, 0.15)',
                color: '#007AFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={18} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#FFFFFF', lineHeight: 1.2 }}>
                Exportar Plan Nutricional
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Plantilla Editorial PDF en alta resolución
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={onClose} sx={{ color: 'rgba(255, 255, 255, 0.6)', p: 1 }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#121214' }}>
          {/* Card Resumen de la Dieta (Previsualización Adaptada a Móvil) */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '18px',
              bgcolor: '#1C1C1E',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
              mb: 2,
            }}
          >
            {/* Header Dieta */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box sx={{ pr: 1 }}>
                <Typography variant="caption" sx={{ color: '#007AFF', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Plan Personalizado
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#FFFFFF', lineHeight: 1.2, mt: 0.2 }}>
                  {diet.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mt: 0.5 }}>
                  {diet.description || 'Pautas de alimentación y tomas diarias.'}
                </Typography>
              </Box>

              <Chip
                icon={<Flame size={14} color="#FF9500" />}
                label={`${diet.calories} kcal`}
                sx={{
                  bgcolor: 'rgba(255, 149, 0, 0.15)',
                  color: '#FF9500',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  height: 28,
                  borderRadius: '8px',
                  flexShrink: 0,
                }}
              />
            </Stack>

            {/* Ficha Cliente / Entrenador */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
              <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, fontSize: '0.68rem', display: 'block' }}>
                  CLIENTE
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {clientDisplayName}
                </Typography>
              </Box>

              <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '0.5px solid rgba(255, 255, 255, 0.06)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, fontSize: '0.68rem', display: 'block' }}>
                  ENTRENADOR
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#34C759', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {trainerDisplayName}
                </Typography>
              </Box>
            </Box>

            {/* Grid Macros 4 Columnas */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.8, mb: 2 }}>
              <Box sx={{ p: 1, textAlign: 'center', borderRadius: '10px', bgcolor: 'rgba(0, 122, 255, 0.12)', border: '0.5px solid rgba(0, 122, 255, 0.25)' }}>
                <Typography variant="caption" sx={{ color: '#007AFF', fontWeight: 700, fontSize: '0.65rem', display: 'block' }}>
                  PROT
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#FFFFFF' }}>
                  {proteinGrams}g
                </Typography>
              </Box>

              <Box sx={{ p: 1, textAlign: 'center', borderRadius: '10px', bgcolor: 'rgba(52, 199, 89, 0.12)', border: '0.5px solid rgba(52, 199, 89, 0.25)' }}>
                <Typography variant="caption" sx={{ color: '#34C759', fontWeight: 700, fontSize: '0.65rem', display: 'block' }}>
                  CARBS
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#FFFFFF' }}>
                  {carbsGrams}g
                </Typography>
              </Box>

              <Box sx={{ p: 1, textAlign: 'center', borderRadius: '10px', bgcolor: 'rgba(255, 149, 0, 0.12)', border: '0.5px solid rgba(255, 149, 0, 0.25)' }}>
                <Typography variant="caption" sx={{ color: '#FF9500', fontWeight: 700, fontSize: '0.65rem', display: 'block' }}>
                  GRASAS
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#FFFFFF' }}>
                  {fatGrams}g
                </Typography>
              </Box>

              <Box sx={{ p: 1, textAlign: 'center', borderRadius: '10px', bgcolor: 'rgba(0, 199, 190, 0.12)', border: '0.5px solid rgba(0, 199, 190, 0.25)' }}>
                <Typography variant="caption" sx={{ color: '#00C7BE', fontWeight: 700, fontSize: '0.65rem', display: 'block' }}>
                  AGUA
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#FFFFFF' }}>
                  3.0L
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Tomas y Alimentos */}
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, display: 'block', mb: 1 }}>
              DISTRIBUCIÓN DE 5 TOMAS DIARIAS
            </Typography>

            <Stack spacing={0.8}>
              {MEAL_TIMES.map((meal, idx) => {
                const foods = diet.diet_foods || [];
                const foodsPerMeal = Math.max(1, Math.ceil(foods.length / MEAL_TIMES.length));
                const mealFoods = foods.slice(idx * foodsPerMeal, idx * foodsPerMeal + foodsPerMeal);

                return (
                  <Box
                    key={meal.key}
                    sx={{
                      p: 1.2,
                      borderRadius: '10px',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '0.5px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: meal.color }} />
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#FFFFFF', fontSize: '0.85rem' }}>
                        {meal.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        ({meal.time})
                      </Typography>
                    </Stack>

                    <Typography variant="caption" sx={{ color: mealFoods.length > 0 ? '#007AFF' : 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
                      {mealFoods.length > 0 ? `${mealFoods.length} alimentos` : 'Equilibrada'}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: '#161618',
            borderTop: '0.5px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button onClick={onClose} disabled={downloading} sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleDownloadPdf}
            disabled={downloading}
            startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />}
            className="apple-button-primary"
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              px: 2.5,
              py: 1,
            }}
          >
            {downloading ? 'Generando PDF...' : 'Descargar PDF'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== PLANTILLA IMPRIMIBLE FIJA (OFF-SCREEN A4 800PX) ===== */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: -9999,
          width: 800,
          zIndex: -1,
          pointerEvents: 'none',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box
          ref={printRef}
          sx={{
            width: 800,
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            p: '36px',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Header Banner Obsidian */}
          <Box
            sx={{
              p: '28px',
              borderRadius: '16px',
              bgcolor: '#09090B',
              color: '#FFFFFF',
              mb: '24px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ maxWidth: 520 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ bgcolor: '#007AFF', borderRadius: '6px', px: 1, py: 0.3 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      FITNESS PRO
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    • PLAN NUTRICIONAL OFICIAL
                  </Typography>
                </Stack>

                <Typography sx={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2, mb: 0.8 }}>
                  {diet.name}
                </Typography>

                <Typography sx={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5 }}>
                  {diet.description || 'Pautas de nutrición deportiva personalizadas para optimizar tu rendimiento y composición corporal.'}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Box
                  sx={{
                    bgcolor: '#FF3B30',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '15px',
                    py: '8px',
                    px: '16px',
                    borderRadius: '10px',
                    display: 'inline-block',
                    boxShadow: '0 4px 14px rgba(255, 59, 48, 0.35)',
                  }}
                >
                  {diet.calories} KCAL / DÍA
                </Box>
                <Typography sx={{ display: 'block', mt: 1, fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>
                  Emisión: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Ficha Cliente & Entrenador */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', mb: '24px' }}>
            <Box sx={{ p: '16px', borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.5 }}>
                CLIENTE ASIGNADO
              </Typography>
              <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                {clientDisplayName}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.3 }}>
                {clientUser?.email || 'ID Atleta: Activo'}
              </Typography>
            </Box>

            <Box sx={{ p: '16px', borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.5 }}>
                ENTRENADOR RESPONSABLE
              </Typography>
              <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
                {trainerDisplayName}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.3 }}>
                {trainerUser?.email || 'Soporte Nutricional Fitness Pro'}
              </Typography>
            </Box>
          </Box>

          {/* Desglose de Macronutrientes Objetivo */}
          <Box sx={{ mb: '24px' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', mb: '12px', letterSpacing: '-0.01em' }}>
              DISTRIBUCIÓN DIARIA OBJETIVO DE MACRONUTRIENTES
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {/* Proteínas */}
              <Box sx={{ p: '14px', textAlign: 'center', bgcolor: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                <Typography sx={{ fontSize: '11px', color: '#1E40AF', fontWeight: 800, textTransform: 'uppercase' }}>
                  PROTEÍNAS (30%)
                </Typography>
                <Typography sx={{ fontSize: '22px', fontWeight: 900, color: '#1D4ED8', my: 0.3 }}>
                  {proteinGrams}g
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  ~{proteinGrams * 4} kcal
                </Typography>
              </Box>

              {/* Carbos */}
              <Box sx={{ p: '14px', textAlign: 'center', bgcolor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                <Typography sx={{ fontSize: '11px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                  CARBOHIDRATOS (45%)
                </Typography>
                <Typography sx={{ fontSize: '22px', fontWeight: 900, color: '#15803D', my: 0.3 }}>
                  {carbsGrams}g
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  ~{carbsGrams * 4} kcal
                </Typography>
              </Box>

              {/* Grasas */}
              <Box sx={{ p: '14px', textAlign: 'center', bgcolor: '#FFF7ED', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                <Typography sx={{ fontSize: '11px', color: '#9A3412', fontWeight: 800, textTransform: 'uppercase' }}>
                  GRASAS (25%)
                </Typography>
                <Typography sx={{ fontSize: '22px', fontWeight: 900, color: '#C2410C', my: 0.3 }}>
                  {fatGrams}g
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  ~{fatGrams * 9} kcal
                </Typography>
              </Box>

              {/* Hidratación */}
              <Box sx={{ p: '14px', textAlign: 'center', bgcolor: '#ECFEFF', borderRadius: '12px', border: '1px solid #A5F3FC' }}>
                <Typography sx={{ fontSize: '11px', color: '#155E75', fontWeight: 800, textTransform: 'uppercase' }}>
                  HIDRATACIÓN
                </Typography>
                <Typography sx={{ fontSize: '22px', fontWeight: 900, color: '#0891B2', my: 0.3 }}>
                  3.0 L
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  Agua / Infusiones
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: '20px', borderColor: '#E2E8F0' }} />

          {/* Distribución de Tomas y Alimentos */}
          <Box sx={{ mb: '24px' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', mb: '12px', letterSpacing: '-0.01em' }}>
              PLAN DE COMIDAS & DISTRIBUCIÓN HORARIA
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {MEAL_TIMES.map((meal, idx) => {
                const foods = diet.diet_foods || [];
                const foodsPerMeal = Math.max(1, Math.ceil(foods.length / MEAL_TIMES.length));
                const mealFoods = foods.slice(idx * foodsPerMeal, idx * foodsPerMeal + foodsPerMeal);

                return (
                  <Box
                    key={meal.key}
                    sx={{
                      p: '14px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      bgcolor: '#FAFAFA',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        {meal.title}
                      </Typography>
                      <Box sx={{ bgcolor: '#F1F5F9', px: 1, py: 0.2, borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#475569' }}>
                          {meal.time}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography sx={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', mb: 1, display: 'block' }}>
                      {meal.suggestedMacro}
                    </Typography>

                    <Divider sx={{ my: 0.8, borderColor: '#E2E8F0' }} />

                    {mealFoods.length > 0 ? (
                      mealFoods.map((f) => (
                        <Box key={f.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.3 }}>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1E293B' }}>
                            • {f.foods?.name || `Alimento #${f.food_id}`}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#0284C7', fontWeight: 700 }}>
                            {f.quantity}g ({f.foods?.calories || 0} kcal)
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                        Toma equilibrada ajustada a tus macronutrientes objetivo.
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Pautas Nutricionales & Recomendaciones Oficiales */}
          <Box sx={{ p: '16px', borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #CBD5E1', mb: '20px' }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#1E293B', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📌 Pautas Nutricionales & Recomendaciones del Entrenador
            </Typography>

            <Typography sx={{ fontSize: '11px', color: '#475569', mb: 0.6, lineHeight: 1.4 }}>
              1. <strong>Pesaje en crudo:</strong> Pesar todos los alimentos en crudo antes de cocinar salvo indicación expresa de tu preparador.
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#475569', mb: 0.6, lineHeight: 1.4 }}>
              2. <strong>Aceite de Oliva Virgen Extra:</strong> Límite de 2 cucharadas soperas (20ml) al día para cocinado y aliños.
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
              3. <strong>Equivalencias de proteína:</strong> Puedes sustituir pollo por pechuga de pavo o pescado blanco manteniendo los mismos gramos netos.
            </Typography>
          </Box>

          {/* Footer Oficial */}
          <Box sx={{ pt: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>
              Documento Oficial generado por Fitness Pro App • Todos los derechos reservados
            </Typography>
            <Typography sx={{ fontSize: '10px', color: '#007AFF', fontWeight: 700 }}>
              Válido para la temporada actual
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default DietVisualPdfModal;
