import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Calculator,
  FileDown,
  Apple,
  Flame,
  MessageSquarePlus,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import { getCurrentUser } from '../services/userService';
import {
  getDietsWithFoods,
  getDietWithFoods,
  getUserDiet,
  getDietUsers,
  saveDietObservation,
  getTodayDietObservation
} from '../services/dietService';
import { DietWithFoods } from '../types/DietWithFoods';
import { User } from '../types/User';
import { DietMealChecklist } from '../components/Diet/DietMealChecklist';
import { DietVisualPdfModal } from '../components/Diet/DietVisualPdfModal';
import { CalorieCalculatorModal } from '../components/Diet/CalorieCalculatorModal';
import { MacroRings } from '../components/Diet/MacroRings';

export const ClientMyDietPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [diet, setDiet] = useState<DietWithFoods | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  // Estados para la Observación Diaria
  const [dailyObservation, setDailyObservation] = useState('');
  const [savingObservation, setSavingObservation] = useState(false);
  const [observationSaved, setObservationSaved] = useState(false);

  useEffect(() => {
    loadDiet();
  }, []);

  const loadDiet = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      // 1. Intentar obtener la dieta directa asignada a este usuario
      let matchedDiet = await getUserDiet(user.id);

      // 2. Si no viene por endpoint directo, buscar si está en el join user_diets
      if (!matchedDiet) {
        const diets = await getDietsWithFoods();
        for (const d of diets) {
          try {
            const dietUsers = await getDietUsers(d.id);
            if (dietUsers.some((u: any) => u.id === user.id)) {
              matchedDiet = await getDietWithFoods(d.id);
              break;
            }
          } catch (e) {
            // continue
          }
        }
      }

      setDiet(matchedDiet || null);

      // 3. Cargar la observación de hoy si ya la rellenó
      try {
        const todayObs = await getTodayDietObservation(user.id);
        if (todayObs && todayObs.note) {
          setDailyObservation(todayObs.note);
        }
      } catch (obsErr) {
        console.log('Sin observación previa:', obsErr);
      }
    } catch (err) {
      console.error('Error cargando dieta:', err);
      setDiet(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveObservation = async () => {
    if (!currentUser || !dailyObservation.trim()) return;
    try {
      setSavingObservation(true);
      await saveDietObservation({
        user_id: currentUser.id,
        diet_id: diet?.id,
        note: dailyObservation.trim(),
      });
      setObservationSaved(true);
      setTimeout(() => setObservationSaved(false), 3500);
    } catch (err) {
      console.error('Error guardando observación:', err);
    } finally {
      setSavingObservation(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Cargando plan nutricional...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, mx: 'auto', pb: 8 }}>
      {/* Header Apple Inset Grouped */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Plan Nutricional
          </Typography>

          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
            Seguimiento de tomas, macronutrientes pautados y reporte de observaciones a tu entrenador.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
          <Button
            variant="outlined"
            startIcon={<Calculator size={16} />}
            onClick={() => setCalculatorOpen(true)}
            sx={{
              borderRadius: '10px',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.82rem',
              px: 1.8,
            }}
          >
            Calculadora
          </Button>

          {diet && (
            <Button
              variant="contained"
              startIcon={<FileDown size={16} />}
              onClick={() => setPdfModalOpen(true)}
              className="apple-button-primary"
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.82rem',
                px: 2,
              }}
            >
              Exportar PDF
            </Button>
          )}
        </Stack>
      </Stack>

      {!diet ? (
        <Box className="apple-card" sx={{ p: 5, textAlign: 'center' }}>
          <Apple size={48} color="#007AFF" style={{ marginBottom: 16 }} />
          <Typography variant="h5" fontWeight="800" sx={{ color: '#FFFFFF', mb: 1 }}>
            Aún no tienes un plan nutricional asignado
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
            Tu entrenador está diseñando tu pauta de nutrición personalizada. Mientras tanto, puedes usar la calculadora para calcular tu gasto calórico diario.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Calculator size={16} />}
            className="apple-button-primary"
            onClick={() => setCalculatorOpen(true)}
            sx={{ fontWeight: 700, px: 3, py: 1.2, borderRadius: '12px' }}
          >
            Calcular Mis Calorías (BMR & TDEE)
          </Button>
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Anillos de Macros Apple-Style */}
          <MacroRings
            target={{
              proteins: Math.round(((diet.calories || 2200) * 0.30) / 4),
              carbs: Math.round(((diet.calories || 2200) * 0.45) / 4),
              fats: Math.round(((diet.calories || 2200) * 0.25) / 9),
              calories: diet.calories || 2200,
            }}
            goalType={(diet.calories || 2200) < 2000 ? 'deficit' : (diet.calories || 2200) > 2600 ? 'surplus' : 'maintenance'}
            title={`Distribución de Macronutrientes • ${diet.name}`}
            subtitle="Pauta nutricional prescrita por tu entrenador personal"
          />

          {/* Ficha Resumen Dieta */}
          <Box className="apple-card" sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {diet.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5, maxWidth: 650, lineHeight: 1.5 }}>
                  {diet.description || 'Pautas de nutrición personalizadas prescritas por tu entrenador.'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  icon={<Flame size={16} color="#FF9500" />}
                  label={`${diet.calories} Kcal / día`}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    py: 1.8,
                    px: 1.5,
                    borderRadius: '10px',
                    bgcolor: 'rgba(255, 149, 0, 0.15)',
                    color: '#FF9500',
                  }}
                />
              </Stack>
            </Stack>
          </Box>

          {/* Componente de Retos Alimenticios Interactivos */}
          {currentUser && (
            <DietMealChecklist
              diet={diet}
              userId={currentUser.id}
            />
          )}

          {/* Tarjeta de Observaciones Diarias del Alumno para su Entrenador */}
          <Box
            className="apple-card"
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              bgcolor: '#1C1C1E',
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: 'rgba(0, 122, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#007AFF',
                  border: '0.5px solid rgba(0, 122, 255, 0.3)',
                }}
              >
                <MessageSquarePlus size={20} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  Observaciones del Día sobre tu Dieta
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Anota tus sensaciones, nivel de apetito o antojos para que tu entrenador ajuste tu plan
                </Typography>
              </Box>
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={3}
              value={dailyObservation}
              onChange={(e) => setDailyObservation(e.target.value)}
              placeholder="Ej: Hoy he pasado bastante hambre a media tarde y he tenido antojos de chocolate. La comida 2 me costó terminarla..."
              InputProps={{
                sx: {
                  color: '#FFFFFF',
                  bgcolor: '#2C2C2E',
                  borderRadius: '12px',
                  fontSize: '16px',
                  p: 1.5,
                  mt: 1.5,
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 122, 255, 0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                },
              }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mt: 2 }}>
              <Box>
                {observationSaved && (
                  <Alert severity="success" sx={{ py: 0.5, px: 2, borderRadius: '10px', bgcolor: 'rgba(52, 199, 89, 0.15)', color: '#34C759' }}>
                    ¡Observación guardada para tu entrenador!
                  </Alert>
                )}
              </Box>

              <Button
                variant="contained"
                disabled={savingObservation || !dailyObservation.trim()}
                startIcon={savingObservation ? <CircularProgress size={16} color="inherit" /> : observationSaved ? <Check size={16} /> : <Send size={16} />}
                onClick={handleSaveObservation}
                className="apple-button-primary"
                sx={{
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                }}
              >
                {savingObservation ? 'Guardando...' : observationSaved ? 'Guardado' : 'Guardar Observación'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      )}

      {/* Modales Nutricionales */}
      {pdfModalOpen && diet && (
        <DietVisualPdfModal
          open={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          diet={diet}
          userName={currentUser?.name}
        />
      )}

      {calculatorOpen && (
        <CalorieCalculatorModal
          open={calculatorOpen}
          onClose={() => setCalculatorOpen(false)}
          currentUser={currentUser}
          currentDiet={diet}
          onSuccess={() => {
            loadDiet();
          }}
        />
      )}
    </Box>
  );
};

export default ClientMyDietPage;
