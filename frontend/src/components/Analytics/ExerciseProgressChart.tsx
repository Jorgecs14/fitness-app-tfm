import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, MenuItem, TextField, Stack } from '@mui/material';
import Chart from 'react-apexcharts';
import { estimate1RM } from '../../lib/onerm';

interface LoggedSetHistory {
  date: string;
  weight: number;
  reps: number;
  exerciseName: string;
}

interface ExerciseProgressChartProps {
  history: LoggedSetHistory[];
}

export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ history }) => {
  // Extraer lista única de ejercicios presentes en el historial
  const exerciseNames = [...new Set(history.map(item => item.exerciseName))];
  const [selectedExercise, setSelectedExercise] = useState<string>(exerciseNames[0] || '');

  const filteredHistory = history
    .filter(item => item.exerciseName === selectedExercise)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Agrupar por fecha para obtener el 1RM máximo y el volumen total de ese día
  const groupedByDate: { [date: string]: { max1RM: number; totalVolume: number } } = {};

  filteredHistory.forEach((item) => {
    const dateStr = item.date.split('T')[0];
    const estimated1RM = estimate1RM(item.weight, item.reps);
    const setVolume = item.weight * item.reps;

    if (!groupedByDate[dateStr]) {
      groupedByDate[dateStr] = { max1RM: estimated1RM, totalVolume: setVolume };
    } else {
      groupedByDate[dateStr].max1RM = Math.max(groupedByDate[dateStr].max1RM, estimated1RM);
      groupedByDate[dateStr].totalVolume += setVolume;
    }
  });

  const dates = Object.keys(groupedByDate);
  const oneRMData = dates.map(d => groupedByDate[d].max1RM);
  const volumeData = dates.map(d => groupedByDate[d].totalVolume);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ['#00a76f', '#00b8d9'],
    stroke: { width: [3, 3], curve: 'smooth' },
    xaxis: { categories: dates },
    yaxis: [
      {
        title: { text: '1RM Estimado (kg)' },
      },
      {
        opposite: true,
        title: { text: 'Volumen Total (kg)' },
      },
    ],
    tooltip: { shared: true, intersect: false },
  };

  const series = [
    { name: '1RM Estimado (kg)', data: oneRMData },
    { name: 'Volumen Total (kg)', data: volumeData },
  ];

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            📈 Evolución de Fuerza y 1RM por Ejercicio
          </Typography>

          {exerciseNames.length > 0 && (
            <TextField
              select
              size="small"
              label="Seleccionar Ejercicio"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              {exerciseNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>

        {filteredHistory.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No hay registros de entrenamiento para este ejercicio aún.
          </Typography>
        ) : (
          <Box sx={{ height: 350 }}>
            <Chart options={chartOptions} series={series} type="line" height="100%" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
