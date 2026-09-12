import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { Iconify } from '../../utils/iconify';

export interface MacroData {
  proteins: number; // en gramos
  carbs: number;    // en gramos
  fats: number;     // en gramos
  calories: number; // Kcal totales
}

interface MacroRingsProps {
  current?: MacroData;
  target: MacroData;
  title?: string;
  subtitle?: string;
  goalType?: 'deficit' | 'maintenance' | 'surplus';
}

export const MacroRings: React.FC<MacroRingsProps> = ({
  current,
  target,
  title = 'Balance de Macronutrientes',
  subtitle = 'Distribución calórica diaria recomendada',
  goalType = 'maintenance',
}) => {
  // Si no se provee current, asumimos que estamos visualizando la meta al 100%
  const currentMacros = current || target;

  // Ratios de cumplimiento (clamp entre 0 y 1.25 para permitir sobrecumplimiento visual)
  const protRatio = Math.min(1.25, Math.max(0, currentMacros.proteins / (target.proteins || 1)));
  const carbRatio = Math.min(1.25, Math.max(0, currentMacros.carbs / (target.carbs || 1)));
  const fatRatio = Math.min(1.25, Math.max(0, currentMacros.fats / (target.fats || 1)));

  // Parámetros de los anillos SVG concéntricos
  const size = 220;
  const strokeWidth = 14;
  const center = size / 2;

  // Radios de los 3 anillos
  const rProt = 86; // Exterior: Proteína
  const rCarb = 68; // Medio: Carbohidratos
  const rFat = 50;  // Interior: Grasas

  const cProt = 2 * Math.PI * rProt;
  const cCarb = 2 * Math.PI * rCarb;
  const cFat = 2 * Math.PI * rFat;

  // Offsets
  const offsetProt = cProt - cProt * Math.min(1, protRatio);
  const offsetCarb = cCarb - cCarb * Math.min(1, carbRatio);
  const offsetFat = cFat - cFat * Math.min(1, fatRatio);

  const getGoalBadge = () => {
    switch (goalType) {
      case 'deficit':
        return { label: 'Déficit Calórico (Definición)', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' };
      case 'surplus':
        return { label: 'Superávit Calórico (Volumen)', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' };
      default:
        return { label: 'Mantenimiento / Recomposición', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
    }
  };

  const badge = getGoalBadge();

  return (
    <Box className="liquid-glass-card" sx={{ p: { xs: 2.5, sm: 3.5 }, position: 'relative', overflow: 'hidden' }}>
      {/* Encabezado */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a', letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {subtitle}
          </Typography>
        </Box>

        <Chip
          label={badge.label}
          size="small"
          sx={{
            bgcolor: badge.bg,
            color: badge.color,
            fontWeight: 700,
            fontSize: '0.75rem',
            border: `1px solid ${badge.color}40`,
            borderRadius: '9999px',
          }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-around" spacing={3}>
        {/* Gráfico de Anillos Concéntricos SVG (Apple Watch Style) */}
        <Box sx={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Sombras de fondo inactivas */}
            <circle cx={center} cy={center} r={rProt} fill="none" stroke="rgba(244, 63, 94, 0.15)" strokeWidth={strokeWidth} />
            <circle cx={center} cy={center} r={rCarb} fill="none" stroke="rgba(2, 132, 199, 0.15)" strokeWidth={strokeWidth} />
            <circle cx={center} cy={center} r={rFat} fill="none" stroke="rgba(245, 158, 11, 0.15)" strokeWidth={strokeWidth} />

            {/* Anillo 1: Proteínas (Coral Neón) */}
            <circle
              cx={center}
              cy={center}
              r={rProt}
              fill="none"
              stroke="#f43f5e"
              strokeWidth={strokeWidth}
              strokeDasharray={cProt}
              strokeDashoffset={offsetProt}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.45))',
              }}
            />

            {/* Anillo 2: Carbohidratos (Cyan Neón) */}
            <circle
              cx={center}
              cy={center}
              r={rCarb}
              fill="none"
              stroke="#0284c7"
              strokeWidth={strokeWidth}
              strokeDasharray={cCarb}
              strokeDashoffset={offsetCarb}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
                filter: 'drop-shadow(0 0 6px rgba(2, 132, 199, 0.45))',
              }}
            />

            {/* Anillo 3: Grasas (Ámbar Neón) */}
            <circle
              cx={center}
              cy={center}
              r={rFat}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              strokeDasharray={cFat}
              strokeDashoffset={offsetFat}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
                filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.45))',
              }}
            />
          </svg>

          {/* Centro del Anillo: Calorías Totales */}
          <Box sx={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
            <Iconify icon="solar:fire-bold" width={22} height={22} sx={{ color: '#f59e0b', mb: 0.2 }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', lineHeight: 1.1 }}>
              {target.calories.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.72rem' }}>
              Kcal / día
            </Typography>
          </Box>
        </Box>

        {/* Desglose de Macronutrientes en Tarjetas Liquid Glass */}
        <Stack spacing={1.5} sx={{ width: { xs: '100%', md: '55%' } }}>
          {/* Fila Proteína */}
          <Box
            sx={{
              p: 1.5,
              px: 2,
              borderRadius: '16px',
              bgcolor: 'rgba(244, 63, 94, 0.06)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f43f5e', boxShadow: '0 0 8px #f43f5e' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a' }}>
                  Proteínas
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  4 Kcal/g • Construcción muscular
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f43f5e' }}>
                {target.proteins}g
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                {Math.round((target.proteins * 4 / (target.calories || 1)) * 100)}% ({target.proteins * 4} Kcal)
              </Typography>
            </Box>
          </Box>

          {/* Fila Carbohidratos */}
          <Box
            sx={{
              p: 1.5,
              px: 2,
              borderRadius: '16px',
              bgcolor: 'rgba(2, 132, 199, 0.06)',
              border: '1px solid rgba(2, 132, 199, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#0284c7', boxShadow: '0 0 8px #0284c7' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a' }}>
                  Carbohidratos
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  4 Kcal/g • Energía glucolítica
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#0284c7' }}>
                {target.carbs}g
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                {Math.round((target.carbs * 4 / (target.calories || 1)) * 100)}% ({target.carbs * 4} Kcal)
              </Typography>
            </Box>
          </Box>

          {/* Fila Grasas Saludables */}
          <Box
            sx={{
              p: 1.5,
              px: 2,
              borderRadius: '16px',
              bgcolor: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a' }}>
                  Grasas Saludables
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  9 Kcal/g • Regulación hormonal
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f59e0b' }}>
                {target.fats}g
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                {Math.round((target.fats * 9 / (target.calories || 1)) * 100)}% ({target.fats * 9} Kcal)
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
