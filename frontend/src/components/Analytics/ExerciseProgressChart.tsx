import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  TextField,
  Stack,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import Chart from 'react-apexcharts';
import { estimate1RM, estimate1RMBrzycki, estimate1RMEpley } from '../../lib/onerm';
import { BarChart3, Award, TrendingUp, Dumbbell, Info } from 'lucide-react';

interface LoggedSetHistory {
  date: string;
  weight: number;
  reps: number;
  exerciseName: string;
}

interface ExerciseProgressChartProps {
  history: LoggedSetHistory[];
}

const POPULAR_EXERCISES = [
  'Press de Banca con Barra',
  'Sentadilla Trasera con Barra',
  'Peso Muerto Convencional',
  'Press Militar con Barra',
  'Dominadas Pronas',
  'Remo con Barra 90°',
];

export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ history = [] }) => {
  // Extract unique exercise names from history
  const recordedExercises = useMemo(() => {
    return [...new Set((history || []).map((item) => item.exerciseName))];
  }, [history]);

  // Combined list of selectable exercises (recorded + popular benchmarks)
  const allAvailableExercises = useMemo(() => {
    const set = new Set([...recordedExercises, ...POPULAR_EXERCISES]);
    return Array.from(set);
  }, [recordedExercises]);

  const [selectedExercise, setSelectedExercise] = useState<string>(
    recordedExercises[0] || POPULAR_EXERCISES[0]
  );
  const [formulaMode, setFormulaMode] = useState<'brzycki' | 'epley'>('brzycki');

  // Filter history for selected exercise
  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => item.exerciseName === selectedExercise)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history, selectedExercise]);

  // Generate mock realistic progression if user has no data for this exercise yet
  const chartData = useMemo(() => {
    const groupedByDate: { [date: string]: { max1RM: number; totalVolume: number; reps: number; weight: number } } = {};

    if (filteredHistory.length > 0) {
      filteredHistory.forEach((item) => {
        const dateStr = item.date.split('T')[0];
        const estimated1RM =
          formulaMode === 'brzycki'
            ? estimate1RMBrzycki(item.weight, item.reps)
            : estimate1RMEpley(item.weight, item.reps);
        const setVolume = item.weight * item.reps;

        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = {
            max1RM: Math.round(estimated1RM * 10) / 10,
            totalVolume: setVolume,
            reps: item.reps,
            weight: item.weight,
          };
        } else {
          groupedByDate[dateStr].max1RM = Math.max(
            groupedByDate[dateStr].max1RM,
            Math.round(estimated1RM * 10) / 10
          );
          groupedByDate[dateStr].totalVolume += setVolume;
        }
      });
    } else {
      // Demo realistic trajectory
      const baseWeight = selectedExercise.includes('Sentadilla')
        ? 80
        : selectedExercise.includes('Peso Muerto')
        ? 100
        : 60;
      const datesList = ['2026-06-01', '2026-06-15', '2026-07-01', '2026-07-15', '2026-08-01', '2026-08-15', '2026-09-01'];
      datesList.forEach((d, idx) => {
        const progressionKg = baseWeight + idx * 3.5;
        groupedByDate[d] = {
          max1RM: Math.round(progressionKg * 10) / 10,
          totalVolume: Math.round(progressionKg * 4 * 8),
          reps: 8,
          weight: progressionKg * 0.8,
        };
      });
    }

    const dates = Object.keys(groupedByDate).sort();
    const oneRMData = dates.map((d) => groupedByDate[d].max1RM);
    const volumeData = dates.map((d) => groupedByDate[d].totalVolume);

    const maxPR = Math.max(...oneRMData, 0);
    const firstPR = oneRMData[0] || 0;
    const latestPR = oneRMData[oneRMData.length - 1] || 0;
    const diffPR = latestPR - firstPR;
    const percentDiff = firstPR > 0 ? ((diffPR / firstPR) * 100).toFixed(1) : '0';

    return {
      dates,
      oneRMData,
      volumeData,
      maxPR,
      latestPR,
      diffPR: Math.round(diffPR * 10) / 10,
      percentDiff,
      isDemo: filteredHistory.length === 0,
    };
  }, [filteredHistory, formulaMode, selectedExercise]);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
      foreColor: '#94a3b8',
    },
    theme: {
      mode: 'dark',
    },
    stroke: {
      curve: 'smooth',
      width: [3, 2],
    },
    colors: ['#06b6d4', '#f59e0b'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: chartData.dates.map((d) =>
        new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
      ),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: {
          text: '1RM Estimado (kg)',
          style: { color: '#06b6d4', fontWeight: 600 },
        },
        labels: {
          style: { colors: '#06b6d4' },
          formatter: (val) => `${Math.round(val)} kg`,
        },
      },
      {
        opposite: true,
        title: {
          text: 'Volumen Total (kg)',
          style: { color: '#f59e0b', fontWeight: 600 },
        },
        labels: {
          style: { colors: '#f59e0b' },
          formatter: (val) => `${Math.round(val)} kg`,
        },
      },
    ],
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.06)',
      strokeDashArray: 4,
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'dark',
      y: {
        formatter: (val) => `${val} kg`,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#e2e8f0',
      },
    },
  };

  const series = [
    { name: '1RM Estimado (kg)', data: chartData.oneRMData },
    { name: 'Volumen de Sesión (kg)', data: chartData.volumeData },
  ];

  return (
    <Box
      className="liquid-glass-card"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Header & Exercise Selector */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(16, 185, 129, 0.3))',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.35)',
              }}
            >
              <BarChart3 size={20} color="#22d3ee" />
            </Box>
            <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em' }}>
              Evolución de Fuerza y 1RM
            </Typography>
            <Chip
              label="Brzycki / Epley"
              size="small"
              sx={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Estimación de Una Repetición Máxima y sobrecarga progresiva a lo largo del tiempo.
          </Typography>
        </Box>

        {/* Formula Toggle & Exercise Dropdown */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <ToggleButtonGroup
            value={formulaMode}
            exclusive
            onChange={(_, val) => val && setFormulaMode(val)}
            size="small"
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              p: '2px',
              '& .MuiToggleButton-root': {
                borderRadius: '20px',
                px: 1.5,
                py: 0.3,
                border: 'none',
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 700,
                '&.Mui-selected': {
                  background: 'rgba(6, 182, 212, 0.25)',
                  color: '#22d3ee',
                },
              },
            }}
          >
            <Tooltip title="Fórmula Brzycki: Peso / (1.0278 - 0.0278 * Reps)">
              <ToggleButton value="brzycki">Brzycki</ToggleButton>
            </Tooltip>
            <Tooltip title="Fórmula Epley: Peso * (1 + Reps / 30)">
              <ToggleButton value="epley">Epley</ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <TextField
            select
            size="small"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 240 },
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            {allAvailableExercises.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {/* Popular Exercise Quick Pills */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1.5,
          mb: 2.5,
          '&::-webkit-scrollbar': { height: 4 },
        }}
      >
        {POPULAR_EXERCISES.map((ex) => {
          const isSelected = selectedExercise === ex;
          return (
            <Chip
              key={ex}
              label={ex}
              clickable
              onClick={() => setSelectedExercise(ex)}
              size="small"
              sx={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))'
                  : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isSelected ? '#fff' : 'text.secondary',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.78rem',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'rgba(6, 182, 212, 0.2)',
                  borderColor: '#22d3ee',
                },
              }}
            />
          );
        })}
      </Box>

      {/* KPI Highlight Strip */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mb: 3,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: 4 },
        }}
      >
        <Box
          sx={{
            flex: '1 1 140px',
            minWidth: 140,
            p: 2,
            borderRadius: 3,
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Award size={18} color="#22d3ee" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Récord Personal (PR)
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="900" sx={{ color: '#22d3ee' }}>
            {chartData.maxPR} kg
          </Typography>
        </Box>

        <Box
          sx={{
            flex: '1 1 140px',
            minWidth: 140,
            p: 2,
            borderRadius: 3,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <TrendingUp size={18} color="#10b981" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Ganancia Neta
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="900" sx={{ color: '#10b981' }}>
            {chartData.diffPR >= 0 ? `+${chartData.diffPR} kg` : `${chartData.diffPR} kg`}
          </Typography>
          <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700 }}>
            ({chartData.diffPR >= 0 ? `+${chartData.percentDiff}%` : `${chartData.percentDiff}%`})
          </Typography>
        </Box>

        <Box
          sx={{
            flex: '1 1 140px',
            minWidth: 140,
            p: 2,
            borderRadius: 3,
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Dumbbell size={18} color="#f59e0b" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Último 1RM
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="900" sx={{ color: '#f59e0b' }}>
            {chartData.latestPR} kg
          </Typography>
        </Box>
      </Stack>

      {/* Chart Canvas */}
      <Box sx={{ height: 360, width: '100%' }}>
        <Chart options={chartOptions} series={series} type="area" height="100%" />
      </Box>

      {/* Footer Info */}
      {chartData.isDemo && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Info size={18} color="#22d3ee" />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Visualizando curva de proyección y progresión estimada. A medida que completes tus series en el Reproductor en Vivo, esta gráfica se nutrirá con tus datos reales.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExerciseProgressChart;
