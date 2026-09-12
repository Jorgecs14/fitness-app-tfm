import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  Divider,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
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
    description: 'Enfocado en pérdida de grasa manteniendo masa muscular. Alto en proteína y moderado en hidratos.',
    meals: 'Desayuno: Tortilla de 3 claras y 1 huevo con avena. Almuerzo: Pechuga de pollo con arroz integral y verduras. Merienda: Yogur griego con frutos rojos. Cena: Salmón al horno con ensalada mixta.',
  },
  {
    title: '💪 Superávit Limpio & Ganancia Muscular',
    calories: 2750,
    description: 'Enfocado en hipertrofia y rendimiento físico. Densidad energética y aporte óptimo de carbohidratos complejos.',
    meals: 'Desayuno: Bowl de avena con proteína en polvo, plátano y crema de cacahuete. Almuerzo: Ternera magra con patatas al horno y verduras. Merienda: Tostadas con atún y aguacate. Cena: Merluza con boniato y espárragos.',
  },
  {
    title: '🥑 Mantenimiento & Salud Metabólica',
    calories: 2300,
    description: 'Equilibrio de macronutrientes para mantener peso y maximizar energía y vitalidad diaria.',
    meals: 'Desayuno: Tostada de pan integral con aceite de oliva, tomate y jamón serrano. Almuerzo: Lentejas estofadas con verduras y pollo. Merienda: Fruta fresca con puñado de nueces. Cena: Pechuga de pavo con crema de calabacín.',
  },
];

export const ClientDietBuilderModal: React.FC<ClientDietBuilderModalProps> = ({
  open,
  onClose,
  userId,
  dietToEdit,
  onSuccess,
}) => {
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
      if (dietToEdit?.id) {
        // Actualizar dieta existente
        await updateDiet(dietToEdit.id, {
          name: name.trim(),
          description: description.trim() || 'Plan nutricional personalizado',
          calories: Number(calories),
        });
      } else {
        // Crear nueva dieta y asignar
        const newDiet = await createDiet({
          name: name.trim(),
          description: description.trim() || 'Plan nutricional personalizado',
          calories: Number(calories),
        });
        await assignUserToDiet(newDiet.id, userId);
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al guardar la dieta.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="bold">
          🥗 Planificador Nutricional Personal
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 3 }}>
          <Tab icon={<Iconify icon="solar:pen-new-square-bold" />} label="Crear Mi Plan" />
          <Tab icon={<Iconify icon="solar:magic-stick-3-bold" />} label="Plantillas Nutricionales Rápidas" />
        </Tabs>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {activeTab === 0 ? (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="Nombre del Plan"
                  placeholder="Ej: Mi Dieta de Definición 2,000 Kcal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Calorías Diarias (Kcal)"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  fullWidth
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Descripción, Pautas y Distribución de Comidas"
                  placeholder="Escribe aquí las pautas de tus comidas (Desayuno, Almuerzo, Comida, Merienda, Cena)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={6}
                />
              </Grid>
            </Grid>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Escoge una plantilla nutricional contrastada. Podrás editar las calorías o notas antes de guardarla en tu perfil.
            </Alert>

            <Grid container spacing={2}>
              {NUTRITION_TEMPLATES.map((tmpl, idx) => (
                <Grid size={{ xs: 12, sm: 4 }} key={idx}>
                  <Card sx={{ borderRadius: 2.5, height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {tmpl.title}
                      </Typography>
                      <Chip
                        icon={<Iconify icon="solar:fire-bold" />}
                        label={`${tmpl.calories} Kcal / día`}
                        color="primary"
                        size="small"
                        sx={{ mb: 1.5, fontWeight: 'bold' }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {tmpl.description}
                      </Typography>

                      <Button
                        variant="contained"
                        fullWidth
                        color="success"
                        startIcon={<Iconify icon="solar:download-square-bold" />}
                        onClick={() => handleSelectTemplate(tmpl)}
                        sx={{ fontWeight: 'bold', mt: 'auto' }}
                      >
                        Usar Esta Plantilla
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, px: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveDiet}
          disabled={isSubmitting || !name.trim() || !calories}
          startIcon={<Iconify icon="solar:diskette-bold" />}
          sx={{ fontWeight: 'bold' }}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar y Activar Mi Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
