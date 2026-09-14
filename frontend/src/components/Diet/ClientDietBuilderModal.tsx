// Creador y selector de pautas nutricionales para el cliente con estética Apple Liquid Glass
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  IconButton,
  Chip,
  Grid,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  UtensilsCrossed,
  Sparkles,
  X,
  Flame,
  FileText,
  Check,
  Apple,
} from 'lucide-react';
import { createDiet, updateDiet, assignUserToDiet } from '../../services/dietService';

interface ClientDietBuilderModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  dietToEdit?: any | null;
  onSuccess: () => void;
}

const NUTRITION_TEMPLATES = [
  {
    title: '🔥 Déficit Calórico & Definición',
    calories: 1950,
    color: '#FF9500',
    description: 'Enfocado en pérdida de grasa manteniendo masa muscular. Alto en proteína y moderado en hidratos.',
    meals: 'Desayuno: Tortilla de 3 claras y 1 huevo con avena.\nAlmuerzo: Pechuga de pollo con arroz integral y verduras.\nMerienda: Yogur griego con frutos rojos.\nCena: Salmón al horno con ensalada mixta.',
  },
  {
    title: '💪 Superávit Limpio & Ganancia Muscular',
    calories: 2750,
    color: '#007AFF',
    description: 'Enfocado en hipertrofia y rendimiento físico. Densidad energética y aporte óptimo de carbohidratos complejos.',
    meals: 'Desayuno: Bowl de avena con proteína en polvo, plátano y crema de cacahuete.\nAlmuerzo: Ternera magra con patatas al horno y verduras.\nMerienda: Tostadas con atún y aguacate.\nCena: Merluza con boniato y espárragos.',
  },
  {
    title: '🥑 Mantenimiento & Salud Metabólica',
    calories: 2300,
    color: '#34C759',
    description: 'Equilibrio de macronutrientes para mantener peso y maximizar energía y vitalidad diaria.',
    meals: 'Desayuno: Tostada de pan integral con aceite de oliva, tomate y jamón serrano.\nAlmuerzo: Lentejas estofadas con verduras y pollo.\nMerienda: Fruta fresca con puñado de nueces.\nCena: Pechuga de pavo con crema de calabacín.',
  },
];

export const ClientDietBuilderModal: React.FC<ClientDietBuilderModalProps> = ({
  open,
  onClose,
  userId,
  dietToEdit,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [calories, setCalories] = useState<number>(2200);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (dietToEdit) {
        setName(dietToEdit.name || '');
        setCalories(dietToEdit.calories || 2200);
        setDescription(dietToEdit.description || '');
      } else {
        setName('');
        setCalories(2200);
        setDescription('');
      }
      setErrorMsg(null);
      setActiveTab(0);
    }
  }, [open, dietToEdit]);

  const handleSelectTemplate = (template: (typeof NUTRITION_TEMPLATES)[0]) => {
    setName(template.title.replace(/^[^\w\s]+/, '').trim());
    setCalories(template.calories);
    setDescription(`${template.description}\n\nPauta diaria sugerida:\n${template.meals}`);
    setActiveTab(0);
  };

  const handleSaveDiet = async () => {
    if (!name.trim()) {
      setErrorMsg('Por favor, indica un nombre para el plan de nutrición.');
      return;
    }
    if (!calories || calories < 800) {
      setErrorMsg('Introduce un número de calorías objetivo válido (mínimo 800 Kcal).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (dietToEdit) {
        await updateDiet(dietToEdit.id, {
          name: name.trim(),
          calories,
          description: description.trim(),
        });
      } else {
        const newDiet = await createDiet({
          name: name.trim(),
          calories,
          description: description.trim(),
        });

        if (newDiet && newDiet.id && userId) {
          try {
            await assignUserToDiet(newDiet.id, userId);
          } catch (assignErr) {
            console.warn('Advertencia al asociar pauta con usuario:', assignErr);
          }
        }
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al guardar el plan de nutrición.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#000000',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          maxHeight: { xs: '100%', sm: '92vh' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header Apple Liquid Glass */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: 'rgba(52, 199, 89, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34C759',
              border: '0.5px solid rgba(52, 199, 89, 0.3)',
            }}
          >
            <Apple size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              {dietToEdit ? 'Editar Mi Pauta' : 'Creador de Plan Nutricional'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Pautas y calorías personalizadas
            </Typography>
          </Box>
        </Stack>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'rgba(235, 235, 245, 0.8)',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Selector de Pestañas Apple Segmented */}
      <Box sx={{ p: 2, px: { xs: 2, sm: 3 }, bgcolor: '#000000', borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
        <Box
          sx={{
            display: 'flex',
            bgcolor: '#1C1C1E',
            p: '4px',
            borderRadius: '14px',
            border: '0.5px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Box
            onClick={() => setActiveTab(0)}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              borderRadius: '10px',
              cursor: 'pointer',
              bgcolor: activeTab === 0 ? '#2C2C2E' : 'transparent',
              color: activeTab === 0 ? '#ffffff' : 'rgba(235, 235, 245, 0.6)',
              fontWeight: activeTab === 0 ? 700 : 500,
              fontSize: '0.85rem',
              transition: 'all 0.15s ease',
            }}
          >
            Personalizar Plan
          </Box>
          <Box
            onClick={() => setActiveTab(1)}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              borderRadius: '10px',
              cursor: 'pointer',
              bgcolor: activeTab === 1 ? '#34C759' : 'transparent',
              color: activeTab === 1 ? '#000000' : '#ffffff',
              fontWeight: activeTab === 1 ? 700 : 500,
              fontSize: '0.85rem',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <Sparkles size={14} /> Plantillas Nutricionales
          </Box>
        </Box>
      </Box>

      {/* Contenido con Scroll */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#000000', overflowY: 'auto' }}>
        {errorMsg && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '14px',
              bgcolor: 'rgba(255, 59, 48, 0.15)',
              color: '#FF453A',
              border: '0.5px solid rgba(255, 59, 48, 0.3)',
            }}
          >
            {errorMsg}
          </Alert>
        )}

        {activeTab === 0 ? (
          <Stack spacing={2.5}>
            {/* Formulario Inset Grouped */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Nombre del Plan *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej: Dieta de Definición 2.000 Kcal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Calorías Diarias (Kcal) *
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block', fontWeight: 500 }}>
                    Pautas y Descripción de Comidas
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Escribe aquí las pautas de comidas, horarios, alimentos recomendados o suplementos..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        ) : (
          /* Pestaña: Plantillas Nutricionales */
          <Stack spacing={2}>
            <Alert
              severity="info"
              sx={{
                borderRadius: '14px',
                bgcolor: 'rgba(52, 199, 89, 0.12)',
                color: '#ffffff',
                border: '0.5px solid rgba(52, 199, 89, 0.3)',
              }}
            >
              Selecciona una estrategia nutricional. Se cargará de inmediato para que puedas adaptarla a tus gustos.
            </Alert>

            <Grid container spacing={2}>
              {NUTRITION_TEMPLATES.map((tmpl, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '20px',
                      bgcolor: '#1C1C1E',
                      border: '0.5px solid rgba(255, 255, 255, 0.08)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'rgba(52, 199, 89, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.5 }}>
                      {tmpl.title}
                    </Typography>
                    <Chip
                      label={`${tmpl.calories} kcal / día`}
                      size="small"
                      sx={{
                        bgcolor: `${tmpl.color}20`,
                        color: tmpl.color,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        width: 'fit-content',
                        mb: 1.5,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 2, fontSize: '0.85rem' }}>
                      {tmpl.description}
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleSelectTemplate(tmpl)}
                      startIcon={<Sparkles size={16} />}
                      sx={{
                        mt: 'auto',
                        bgcolor: '#34C759',
                        color: '#000000',
                        fontWeight: 700,
                        borderRadius: '12px',
                        textTransform: 'none',
                        height: 40,
                        '&:hover': { bgcolor: '#2eb34f' },
                      }}
                    >
                      Cargar Esta Pauta
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}
      </DialogContent>

      {/* Footer Botones Apple */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
          bgcolor: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 12px)' : 2,
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: '12px',
            color: '#ffffff',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveDiet}
          disabled={isSubmitting || !name.trim()}
          variant="contained"
          sx={{
            flex: 2,
            height: 44,
            borderRadius: '12px',
            bgcolor: '#34C759',
            color: '#000000',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: '0 4px 14px rgba(52, 199, 89, 0.3)',
            '&:hover': { bgcolor: '#2eb34f' },
          }}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Pauta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientDietBuilderModal;
