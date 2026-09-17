// Calculadora metabólica de calorías (BMR & TDEE) con estética Apple Liquid Glass y persistencia de datos
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  IconButton,
  Stack,
  Chip,
  Select,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Calculator,
  X,
  Flame,
  Save,
} from 'lucide-react';
import { User } from '../../types/User';
import { DietWithFoods } from '../../types/DietWithFoods';
import * as userService from '../../services/userService';
import * as dietService from '../../services/dietService';

interface CalorieCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  currentUser?: User | null;
  currentDiet?: DietWithFoods | null;
  onSuccess?: () => void;
  onApplyTargetCalories?: (targetCalories: number, macros: { protein: number; carbs: number; fat: number }) => void;
}

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#1C1C1E',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '0.92rem',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.14)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007AFF',
      borderWidth: '1.5px',
    },
  },
  '& input': {
    color: '#ffffff !important',
    fontSize: '0.92rem',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.45) !important',
      opacity: 1,
    },
  },
};

const selectFieldSx = {
  bgcolor: '#1C1C1E',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '0.88rem',
  height: 44,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#007AFF',
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

const selectMenuPaperSx = {
  bgcolor: '#1C1C1E',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '12px',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
  '& .MuiMenuItem-root': {
    fontSize: '0.88rem',
    color: '#ffffff',
    '&.Mui-selected': {
      bgcolor: 'rgba(0, 122, 255, 0.2)',
      fontWeight: 700,
    },
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.08)',
    },
  },
};

export const CalorieCalculatorModal: React.FC<CalorieCalculatorModalProps> = ({
  open,
  onClose,
  currentUser,
  currentDiet,
  onSuccess,
  onApplyTargetCalories,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('25');
  const [weight, setWeight] = useState<string>('75');
  const [height, setHeight] = useState<string>('175');
  const [activity, setActivity] = useState<number>(1.375);
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (currentUser) {
        if (currentUser.weight) setWeight(String(currentUser.weight));
        if (currentUser.height) setHeight(String(currentUser.height));
        if (currentUser.gender === 'female' || currentUser.gender === 'male') {
          setGender(currentUser.gender);
        }
        if (currentUser.fitness_goal) {
          if (currentUser.fitness_goal === 'fat_loss') setGoal('lose');
          else if (currentUser.fitness_goal === 'muscle_gain') setGoal('gain');
          else if (currentUser.fitness_goal === 'maintenance') setGoal('maintain');
        }
        if (currentUser.activity_level) {
          if (currentUser.activity_level === 'sedentary') setActivity(1.2);
          else if (currentUser.activity_level === 'light') setActivity(1.375);
          else if (currentUser.activity_level === 'moderate') setActivity(1.55);
          else if (currentUser.activity_level === 'very_active') setActivity(1.725);
        }
        if (currentUser.birth_date) {
          const birth = new Date(currentUser.birth_date);
          const diffMs = Date.now() - birth.getTime();
          const ageDt = new Date(diffMs);
          const computedAge = Math.abs(ageDt.getUTCFullYear() - 1970);
          if (computedAge > 0 && computedAge < 120) {
            setAge(String(computedAge));
          }
        }
      }

      if (currentDiet?.calories) {
        const cals = currentDiet.calories;
        if (cals < 2000) setGoal('lose');
        else if (cals > 2600) setGoal('gain');
        else setGoal('maintain');
      }

      try {
        const savedMeta = localStorage.getItem(`calc_meta_${currentUser?.id || 'guest'}`);
        if (savedMeta) {
          const parsed = JSON.parse(savedMeta);
          if (parsed.gender) setGender(parsed.gender);
          if (parsed.activity) setActivity(Number(parsed.activity));
          if (parsed.goal) setGoal(parsed.goal);
          if (parsed.weight) setWeight(String(parsed.weight));
          if (parsed.height) setHeight(String(parsed.height));
          if (parsed.age) setAge(String(parsed.age));
        }
      } catch (e) {}
    }
  }, [open, currentUser, currentDiet]);

  const numWeight = parseFloat(weight) || 75;
  const numHeight = parseFloat(height) || 175;
  const numAge = parseInt(age, 10) || 25;

  const calculateBMR = () => {
    if (gender === 'male') {
      return 10 * numWeight + 6.25 * numHeight - 5 * numAge + 5;
    } else {
      return 10 * numWeight + 6.25 * numHeight - 5 * numAge - 161;
    }
  };

  const bmr = Math.round(calculateBMR());
  const tdee = Math.round(bmr * activity);

  let targetCalories = tdee;
  if (goal === 'lose') {
    targetCalories = Math.round(tdee * 0.8);
  } else if (goal === 'gain') {
    targetCalories = Math.round(tdee * 1.15);
  }

  const proteinGrams = Math.round((targetCalories * 0.3) / 4);
  const carbsGrams = Math.round((targetCalories * 0.45) / 4);
  const fatGrams = Math.round((targetCalories * 0.25) / 9);

  const handleApply = async () => {
    try {
      setSaving(true);
      setFeedback(null);

      try {
        localStorage.setItem(
          `calc_meta_${currentUser?.id || 'guest'}`,
          JSON.stringify({ gender, activity, goal, weight, height, age, targetCalories })
        );
      } catch (e) {}

      if (currentUser?.id) {
        try {
          await userService.updateUser(currentUser.id, {
            weight: Number(weight),
            height: Number(height),
          });
        } catch (uErr) {
          console.warn('No se pudo actualizar datos antropométricos del usuario:', uErr);
        }

        if (currentDiet?.id) {
          try {
            await dietService.updateDiet(currentDiet.id, {
              ...currentDiet,
              calories: targetCalories,
            });
          } catch (dErr) {
            console.warn('Error actualizando calorías de la dieta activa:', dErr);
          }
        } else {
          try {
            const goalLabel = goal === 'lose' ? 'Déficit Calórico' : goal === 'gain' ? 'Superávit Calórico' : 'Mantenimiento';
            const newDiet = await dietService.createDiet({
              name: `Plan ${goalLabel} (${targetCalories} kcal)`,
              description: `Pautas nutricionales personalizadas calculadas con fórmula Mifflin-St Jeor.`,
              calories: targetCalories,
              export_template: 'visual',
            });
            await dietService.assignUserToDiet(newDiet.id, currentUser.id);
          } catch (createErr) {
            console.warn('Error creando dieta inicial para usuario:', createErr);
          }
        }
      }

      if (onApplyTargetCalories) {
        onApplyTargetCalories(targetCalories, {
          protein: proteinGrams,
          carbs: carbsGrams,
          fat: fatGrams,
        });
      }

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err: any) {
      setFeedback(err.message || 'Error guardando datos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#0B0B0E',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.9)',
          maxHeight: { xs: '100%', sm: '90vh' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header Apple Liquid Glass */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(22, 22, 26, 0.9)',
          backdropFilter: 'blur(24px)',
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 14px)' : 2.2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              bgcolor: 'rgba(255, 149, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FF9500',
              border: '1px solid rgba(255, 149, 0, 0.3)',
            }}
          >
            <Calculator size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              Calculadora de Calorías
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.78rem' }}>
              Fórmula científica Mifflin-St Jeor (BMR & TDEE)
            </Typography>
          </Box>
        </Stack>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#fff' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Contenido con Scroll */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: '#0B0B0E', overflowY: 'auto' }}>
        <Stack spacing={2.5}>
          {feedback && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {feedback}
            </Alert>
          )}

          {/* Selector de Género Apple Segmented */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: '#16161A',
              p: '4px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Box
              onClick={() => setGender('male')}
              sx={{
                flex: 1,
                py: 1.2,
                textAlign: 'center',
                borderRadius: '12px',
                cursor: 'pointer',
                bgcolor: gender === 'male' ? '#007AFF' : 'transparent',
                color: gender === 'male' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                fontWeight: gender === 'male' ? 800 : 600,
                fontSize: '0.88rem',
                transition: 'all 0.15s ease',
              }}
            >
              Hombre
            </Box>
            <Box
              onClick={() => setGender('female')}
              sx={{
                flex: 1,
                py: 1.2,
                textAlign: 'center',
                borderRadius: '12px',
                cursor: 'pointer',
                bgcolor: gender === 'female' ? '#AF52DE' : 'transparent',
                color: gender === 'female' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                fontWeight: gender === 'female' ? 800 : 600,
                fontSize: '0.88rem',
                transition: 'all 0.15s ease',
              }}
            >
              Mujer
            </Box>
          </Box>

          {/* Datos Biométricos Inset Grouped */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#16161A',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                  Edad (años)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  value={age}
                  placeholder="25"
                  onChange={(e) => setAge(e.target.value)}
                  inputProps={{ inputMode: 'numeric' }}
                  sx={textFieldSx}
                />
              </Grid>

              <Grid item xs={4}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                  Peso (kg)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  value={weight}
                  placeholder="75"
                  onChange={(e) => setWeight(e.target.value)}
                  inputProps={{ inputMode: 'decimal' }}
                  sx={textFieldSx}
                />
              </Grid>

              <Grid item xs={4}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                  Altura (cm)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  value={height}
                  placeholder="175"
                  onChange={(e) => setHeight(e.target.value)}
                  inputProps={{ inputMode: 'numeric' }}
                  sx={textFieldSx}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#ffffff', mb: 0.5, display: 'block', fontWeight: 700 }}>
                  Nivel de Actividad Física
                </Typography>
                <Select
                  fullWidth
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  sx={selectFieldSx}
                  MenuProps={{ PaperProps: { sx: selectMenuPaperSx } }}
                >
                  <MenuItem value={1.2}>Sedentario (Poco o ningún ejercicio)</MenuItem>
                  <MenuItem value={1.375}>Ligero (Entreno 1-3 días/sem)</MenuItem>
                  <MenuItem value={1.55}>Moderado (Entreno 3-5 días/sem)</MenuItem>
                  <MenuItem value={1.725}>Intenso (Entreno 6-7 días/sem)</MenuItem>
                  <MenuItem value={1.9}>Muy Intenso (Atleta profesional / Trabajo físico)</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Box>

          {/* Selector de Objetivo */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#16161A',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1.5, display: 'block', fontWeight: 700 }}>
              Objetivo Nutricional
            </Typography>

            <Grid container spacing={1.5}>
              {[
                { id: 'lose', label: 'Déficit (Definir)', color: '#FF9500', desc: '-20% Kcal' },
                { id: 'maintain', label: 'Mantenimiento', color: '#34C759', desc: 'Equilibrio' },
                { id: 'gain', label: 'Superávit (Volumen)', color: '#007AFF', desc: '+15% Kcal' },
              ].map((item) => {
                const isSelected = goal === item.id;
                return (
                  <Grid item xs={4} key={item.id}>
                    <Box
                      onClick={() => setGoal(item.id as any)}
                      sx={{
                        p: 1.5,
                        borderRadius: '14px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: isSelected ? `${item.color}25` : '#1C1C20',
                        border: isSelected ? `1.5px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? item.color : '#ffffff', fontSize: '0.8rem' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.72rem' }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Resultado y Macros Apple Cards */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: 'rgba(0, 122, 255, 0.1)',
              border: '1px solid rgba(0, 122, 255, 0.3)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#007AFF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Calorías Objetivo Diarias
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffffff', my: 0.5 }}>
              {targetCalories} <span style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>kcal/día</span>
            </Typography>

            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(0, 122, 255, 0.15)' }}>
                  <Typography variant="caption" sx={{ color: '#007AFF', fontWeight: 700 }}>Proteínas</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>{proteinGrams}g</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(52, 199, 89, 0.15)' }}>
                  <Typography variant="caption" sx={{ color: '#34C759', fontWeight: 700 }}>Carbos</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>{carbsGrams}g</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255, 149, 0, 0.15)' }}>
                  <Typography variant="caption" sx={{ color: '#FF9500', fontWeight: 700 }}>Grasas</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>{fatGrams}g</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      {/* Footer Botones Apple */}
      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.2,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(22, 22, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 14px)' : 2.2,
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.8)',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />}
          sx={{
            flex: 2,
            height: 44,
            borderRadius: '12px',
            bgcolor: '#007AFF',
            color: '#ffffff',
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
            '&:hover': { bgcolor: '#0062cc' },
          }}
        >
          {saving ? 'Guardando en Perfil...' : 'Guardar y Aplicar a Mi Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalorieCalculatorModal;
