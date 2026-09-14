import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip
} from '@mui/material';
import {
  Calculator,
  Edit2,
  FileDown,
  Plus,
  Apple,
  Flame,
} from 'lucide-react';
import { getCurrentUser } from '../services/userService';
import { getDietsWithFoods, getDietWithFoods, getUserDiet } from '../services/dietService';
import { DietWithFoods } from '../types/DietWithFoods';
import { User } from '../types/User';
import { DietMealChecklist } from '../components/Diet/DietMealChecklist';
import { DietVisualPdfModal } from '../components/Diet/DietVisualPdfModal';
import { CalorieCalculatorModal } from '../components/Diet/CalorieCalculatorModal';
import { ClientDietBuilderModal } from '../components/Diet/ClientDietBuilderModal';
import { DietFoodsManager } from '../components/Diet/DietFoodsManager';
import { MacroRings } from '../components/Diet/MacroRings';

export const ClientMyDietPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [diet, setDiet] = useState<DietWithFoods | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [dietBuilderOpen, setDietBuilderOpen] = useState(false);
  const [foodsManagerOpen, setFoodsManagerOpen] = useState(false);
  const [editingDietTarget, setEditingDietTarget] = useState<DietWithFoods | null>(null);

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

      // 2. Si no hay dieta directa, consultar la lista completa con alimentos
      if (!matchedDiet) {
        const diets = await getDietsWithFoods();
        if (diets.length > 0) {
          try {
            matchedDiet = await getDietWithFoods(diets[0].id);
          } catch (e) {
            matchedDiet = diets[0];
          }
        }
      }

      setDiet(matchedDiet);
    } catch (err) {
      console.error('Error cargando dieta:', err);
    } finally {
      setLoading(false);
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
            Plan Nutricional & Retos
          </Typography>

          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
            Seguimiento de objetivos, registro diario de tomas y descarga de plan en PDF.
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
              variant="outlined"
              startIcon={<Edit2 size={16} />}
              onClick={() => {
                setEditingDietTarget(diet);
                setDietBuilderOpen(true);
              }}
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
              Editar Plan
            </Button>
          )}

          {diet && (
            <Button
              variant="outlined"
              startIcon={<Apple size={16} />}
              onClick={() => setFoodsManagerOpen(true)}
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
              Alimentos
            </Button>
          )}

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
            Aún no tienes una dieta configurada
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3, maxWidth: 460, mx: 'auto' }}>
            Puedes crear tu propia dieta personalizada o elegir una plantilla basada en tu gasto calórico diario.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            className="apple-button-primary"
            onClick={() => {
              setEditingDietTarget(null);
              setDietBuilderOpen(true);
            }}
            sx={{ fontWeight: 700, px: 3, py: 1 }}
          >
            Crear Plan Nutricional
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
            subtitle="Equilibrio nutricional diario calculado para optimizar tu rendimiento y composición"
          />

          {/* Ficha Resumen Dieta */}
          <Box className="apple-card" sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {diet.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5, maxWidth: 650, lineHeight: 1.5 }}>
                  {diet.description || 'Pautas de nutrición personalizadas para tu objetivo físico.'}
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
        />
      )}

      {dietBuilderOpen && currentUser && (
        <ClientDietBuilderModal
          open={dietBuilderOpen}
          onClose={() => setDietBuilderOpen(false)}
          userId={currentUser.id}
          editingDiet={editingDietTarget}
          onSuccess={() => {
            setDietBuilderOpen(false);
            loadDiet();
          }}
        />
      )}

      {foodsManagerOpen && (
        <DietFoodsManager
          open={foodsManagerOpen}
          onClose={() => setFoodsManagerOpen(false)}
        />
      )}
    </Box>
  );
};

export default ClientMyDietPage;
