import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Tooltip, Stack } from '@mui/material';
import { MuscleStatusMap, getMuscleColor } from '../../lib/recovery';

interface BodyHeatmapProps {
  muscleStatus: MuscleStatusMap;
}

export const BodyHeatmap: React.FC<BodyHeatmapProps> = ({ muscleStatus }) => {
  const musclesList = Object.values(muscleStatus);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🧠 Estado de Recuperación y Fatiga Muscular
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Basado en el volumen de entrenamiento y descansos de los últimos días.
        </Typography>

        {/* Leyenda de Colores */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Chip label="Totalmente Recuperado (0-25%)" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
          <Chip label="Trabajado Recientemente (26-60%)" sx={{ bgcolor: '#fff3e0', color: '#ed6c02', fontWeight: 'bold' }} />
          <Chip label="Fatiga Alta / Necesita Descanso (>60%)" sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 'bold' }} />
        </Stack>

        {/* Grid de Grupos Musculares */}
        <Grid container spacing={2}>
          {musclesList.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.muscle}>
              <Tooltip title={`Fatiga calculada: ${item.fatigue}%`}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: item.color,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Typography variant="subtitle2" textTransform="capitalize" fontWeight="bold">
                    {item.muscle === 'chest' ? 'Pecho' :
                     item.muscle === 'back' ? 'Espalda' :
                     item.muscle === 'shoulders' ? 'Hombros' :
                     item.muscle === 'biceps' ? 'Bíceps' :
                     item.muscle === 'triceps' ? 'Tríceps' :
                     item.muscle === 'abs' ? 'Core / Abdomen' :
                     item.muscle === 'quads' ? 'Cuádriceps' :
                     item.muscle === 'hamstrings' ? 'Isquiotibiales' :
                     item.muscle === 'glutes' ? 'Glúteos' :
                     item.muscle === 'calves' ? 'Gemelos' : item.muscle}
                  </Typography>

                  <Chip
                    size="small"
                    label={`${item.fatigue}% fatiga`}
                    sx={{
                      bgcolor: item.color,
                      color: '#ffffff',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
