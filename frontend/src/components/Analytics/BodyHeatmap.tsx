import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Grid,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { BodyMap } from './BodyMap';
import { MUSCLE_NAMES_ES, MuscleSlug } from '../../lib/muscles';

interface BodyHeatmapProps {
  muscleLoad?: Record<string, number>;
  activeExercises?: Array<{ name: string; target_muscle?: string; sets?: number }>;
}

export const BodyHeatmap: React.FC<BodyHeatmapProps> = ({
  muscleLoad = {},
  activeExercises = [],
}) => {
  const [viewMode, setViewMode] = useState<'dual' | 'front' | 'back'>('dual');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>('chest');

  const selectedSets = selectedMuscle ? muscleLoad[selectedMuscle] || 0 : 0;
  const selectedDisplayName = selectedMuscle ? MUSCLE_NAMES_ES[selectedMuscle] || selectedMuscle : 'Selecciona un músculo';

  // Buscar qué ejercicios del usuario impactaron en este músculo
  const matchingExercises = activeExercises.filter((ex) => {
    if (!selectedMuscle) return false;
    const target = (ex.target_muscle || '').toLowerCase();
    const name = (ex.name || '').toLowerCase();
    if (selectedMuscle === 'chest' && (target.includes('chest') || name.includes('press') || name.includes('push'))) return true;
    if (selectedMuscle === 'quadriceps' && (target.includes('quad') || name.includes('squat') || name.includes('leg'))) return true;
    if (selectedMuscle === 'upper-back' && (target.includes('back') || name.includes('pull') || name.includes('row'))) return true;
    if (selectedMuscle === 'biceps' && (target.includes('bicep') || name.includes('curl'))) return true;
    if (selectedMuscle === 'triceps' && (target.includes('tricep') || name.includes('extension') || name.includes('dip'))) return true;
    if (selectedMuscle === 'deltoids' && (target.includes('shoulder') || target.includes('delt') || name.includes('shoulder'))) return true;
    if (selectedMuscle === 'abs' && (target.includes('abs') || name.includes('crunch') || name.includes('plank'))) return true;
    if (selectedMuscle === 'gluteal' && (target.includes('glute') || name.includes('thrust') || name.includes('squat'))) return true;
    if (selectedMuscle === 'hamstring' && (target.includes('hamstring') || name.includes('deadlift') || name.includes('curl'))) return true;
    if (selectedMuscle === 'calves' && (target.includes('calf') || name.includes('calf') || name.includes('raise'))) return true;
    return target.includes(selectedMuscle);
  });

  // Estadísticas globales de balance
  const activeMusclesCount = Object.values(muscleLoad).filter((v) => v > 0).length;
  const totalSetsSum = Object.values(muscleLoad).reduce((a, b) => a + b, 0);

  return (
    <Box className="liquid-glass-card" sx={{ p: { xs: 2.5, sm: 3.5 } }}>
      {/* Cabecera del Módulo */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(56, 189, 248, 0.15)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
              }}
            >
              <Iconify icon="solar:body-bold" width={24} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: '-0.02em' }}>
                Mapa Anatómico de Carga Semanal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Volumen acumulado de series en los músculos trabajados esta semana
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Controles estilo iOS Liquid Glass */}
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '9999px',
              p: 0.3,
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '9999px',
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'white',
                  color: 'primary.main',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
              },
            }}
          >
            <ToggleButton value="dual">Dual</ToggleButton>
            <ToggleButton value="front">Frontal</ToggleButton>
            <ToggleButton value="back">Dorsal</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            size="small"
            value={gender}
            exclusive
            onChange={(_, val) => val && setGender(val)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              borderRadius: '9999px',
              p: 0.3,
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '9999px',
                px: 1.2,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'white',
                  color: 'secondary.main',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
              },
            }}
          >
            <ToggleButton value="male">Hombre</ToggleButton>
            <ToggleButton value="female">Mujer</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Grid container spacing={3} alignItems="center">
        {/* Lado Izquierdo: Cuerpo Vectorial Anatómico */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              bgcolor: 'rgba(248, 250, 252, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(226, 232, 240, 0.8)',
              p: 2,
              minHeight: 380,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <BodyMap
              load={muscleLoad}
              body={gender}
              viewMode={viewMode}
              selectedMuscle={selectedMuscle}
              onSelectMuscle={(slug) => setSelectedMuscle(slug)}
            />

            {/* Leyenda de Intensidad Glass */}
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}
            >
              <Box className="bm-legend-pill">
                <Box className="bm-heat-dot" sx={{ bgcolor: 'rgba(203, 213, 225, 0.8)' }} />
                <span>0 series (Descanso)</span>
              </Box>
              <Box className="bm-legend-pill">
                <Box className="bm-heat-dot" sx={{ bgcolor: '#38bdf8' }} />
                <span>1-4 series</span>
              </Box>
              <Box className="bm-legend-pill">
                <Box className="bm-heat-dot" sx={{ bgcolor: '#10b981' }} />
                <span>5-9 series</span>
              </Box>
              <Box className="bm-legend-pill">
                <Box className="bm-heat-dot" sx={{ bgcolor: '#f59e0b' }} />
                <span>10-14 series (Óptimo)</span>
              </Box>
              <Box className="bm-legend-pill">
                <Box className="bm-heat-dot" sx={{ bgcolor: '#f43f5e' }} />
                <span>15+ series (Máximo)</span>
              </Box>
            </Stack>
          </Box>
        </Grid>

        {/* Lado Derecho: Ficha Detallada del Músculo Seleccionado */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            {/* Tarjeta del Músculo */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                bgcolor: 'white',
                border: '1.5px solid',
                borderColor: selectedSets >= 15 ? '#f43f5e' : selectedSets >= 9 ? '#f59e0b' : selectedSets >= 5 ? '#10b981' : selectedSets > 0 ? '#38bdf8' : 'rgba(226, 232, 240, 0.9)',
                boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.06)',
                transition: 'all 0.25s ease',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">
                    MÚSCULO SELECCIONADO
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {selectedDisplayName}
                  </Typography>
                </Box>

                <Chip
                  label={
                    selectedSets >= 15 ? 'Alta Intensidad' :
                    selectedSets >= 9 ? 'Volumen Óptimo' :
                    selectedSets >= 4 ? 'Estímulo Moderado' :
                    selectedSets > 0 ? 'Activación Ligera' : 'En Descanso'
                  }
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    bgcolor:
                      selectedSets >= 15 ? '#ffe4e6' :
                      selectedSets >= 9 ? '#fef3c7' :
                      selectedSets >= 4 ? '#d1fae5' :
                      selectedSets > 0 ? '#e0f2fe' : '#f1f5f9',
                    color:
                      selectedSets >= 15 ? '#e11d48' :
                      selectedSets >= 9 ? '#d97706' :
                      selectedSets >= 4 ? '#059669' :
                      selectedSets > 0 ? '#0284c7' : '#64748b',
                  }}
                />
              </Stack>

              <Box sx={{ my: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progreso semanal hacia objetivo (12-16 series):
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                    {selectedSets.toFixed(1)} series
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (selectedSets / 16) * 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(226, 232, 240, 0.8)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor:
                        selectedSets >= 15 ? '#f43f5e' :
                        selectedSets >= 9 ? '#f59e0b' :
                        selectedSets >= 4 ? '#10b981' : '#38bdf8',
                    },
                  }}
                />
              </Box>

              {/* Ejercicios que contribuyeron */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  EJERCICIOS ASOCIADOS EN TU PLAN:
                </Typography>
                {matchingExercises.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No hay ejercicios registrados para este grupo esta semana. Pulsa otro músculo en el cuerpo para inspeccionarlo.
                  </Typography>
                ) : (
                  <Stack spacing={0.8}>
                    {matchingExercises.slice(0, 4).map((ex, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: '#f8fafc',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.825rem',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{ex.name}</span>
                        <Chip label={`${ex.sets || 3} series`} size="small" variant="outlined" />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Box>

            {/* Resumen Global de Balance Semanal */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(241, 245, 249, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(226, 232, 240, 0.7)',
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    GRUPOS ACTIVADOS
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {activeMusclesCount} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 18</span>
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    SERIES TOTALES
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {totalSetsSum.toFixed(0)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>series</span>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BodyHeatmap;
