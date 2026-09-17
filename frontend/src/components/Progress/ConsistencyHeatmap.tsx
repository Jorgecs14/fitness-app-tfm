import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Stack,
  Chip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Flame, Trophy, Dumbbell, Target } from 'lucide-react';

interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number; // number of workouts or sets completed
  volume?: number;
  durationMinutes?: number;
  notes?: string;
}

interface ConsistencyHeatmapProps {
  activityData?: DayActivity[];
  year?: number;
}

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({
  activityData = [],
  year = new Date().getFullYear(),
}) => {
  const [rangeWeeks, setRangeWeeks] = useState<number>(26); // default 26 weeks (6 months)

  // Map activities by date string for O(1) lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, DayActivity>();
    activityData.forEach((item) => {
      map.set(item.date, item);
    });
    return map;
  }, [activityData]);

  // Generate grid of days for the selected range of weeks up to today
  const { weeks, stats } = useMemo(() => {
    const today = new Date();
    const resultWeeks: Array<Array<{ date: Date; dateStr: string; count: number; dayOfWeek: number }>> = [];

    // Calculate start date: (rangeWeeks * 7) days ago, aligned to Monday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (rangeWeeks * 7));
    const dayOfWeek = startDate.getDay();
    const diffToMonday = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startDate.setDate(diffToMonday);

    let curr = new Date(startDate);
    let totalWorkouts = 0;
    let activeDaysCount = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    let currentWeek: Array<{ date: Date; dateStr: string; count: number; dayOfWeek: number }> = [];

    while (curr <= today) {
      const dateStr = curr.toISOString().split('T')[0];
      const activity = activityMap.get(dateStr);
      const count = activity ? activity.count : 0;

      if (count > 0) {
        totalWorkouts += count;
        activeDaysCount += 1;
        tempStreak += 1;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }

      currentWeek.push({
        date: new Date(curr),
        dateStr,
        count,
        dayOfWeek: curr.getDay(),
      });

      if (curr.getDay() === 0) {
        // Sunday ends the week
        resultWeeks.push(currentWeek);
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      resultWeeks.push(currentWeek);
    }

    // Compute current active streak ending today
    let checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const act = activityMap.get(dateStr);
      const c = act ? act.count : 0;
      if (c > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const totalDays = rangeWeeks * 7;
    const adherenceRate = totalDays > 0 ? Math.min(100, Math.round((activeDaysCount / (totalDays * (4 / 7))) * 100)) : 0;

    return {
      weeks: resultWeeks,
      stats: {
        totalWorkouts,
        activeDaysCount,
        currentStreak,
        longestStreak,
        adherenceRate,
      },
    };
  }, [activityMap, activityData, rangeWeeks]);

  // Color mapper based on workout count
  const getCellColor = (count: number) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.04)';
    if (count === 1) return '#06b6d4'; // Cyan neon
    if (count === 2) return '#10b981'; // Emerald neon
    return '#f43f5e'; // Coral/PR fire
  };

  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

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
      {/* Header & Controls */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3), rgba(245, 158, 11, 0.3))',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(244, 63, 94, 0.35)',
              }}
            >
              <Flame size={20} color="#f43f5e" />
            </Box>
            <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em' }}>
              Consistencia de Entrenamiento
            </Typography>
            <Chip
              label="Activity Matrix"
              size="small"
              sx={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#f43f5e',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Registro visual diario de sesiones completadas y adherencia a tu plan.
          </Typography>
        </Box>

        {/* Range Selector */}
        <ToggleButtonGroup
          value={rangeWeeks}
          exclusive
          onChange={(_, val) => val && setRangeWeeks(val)}
          size="small"
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            p: '2px',
            '& .MuiToggleButton-root': {
              borderRadius: '20px',
              px: 1.5,
              py: 0.4,
              border: 'none',
              color: 'text.secondary',
              fontSize: '0.78rem',
              fontWeight: 600,
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3), rgba(245, 158, 11, 0.3))',
                color: '#fff',
                fontWeight: 700,
              },
            },
          }}
        >
          <ToggleButton value={16}>4 Meses</ToggleButton>
          <ToggleButton value={26}>6 Meses</ToggleButton>
          <ToggleButton value={52}>1 Año</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Metric Cards Banner */}
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
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Flame size={18} color="#f43f5e" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Racha Actual
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="900" sx={{ color: '#f43f5e' }}>
            {stats.currentStreak} días
          </Typography>
        </Box>

        <Box
          sx={{
            flex: '1 1 140px',
            minWidth: 140,
            p: 2,
            borderRadius: 3,
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Trophy size={18} color="#f59e0b" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Mejor Racha
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="900" sx={{ color: '#f59e0b' }}>
            {stats.longestStreak} días
          </Typography>
        </Box>

        <Box
          sx={{
            flex: '1 1 140px',
            minWidth: 140,
            p: 2,
            borderRadius: 3,
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Dumbbell size={18} color="#06b6d4" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Sesiones Totales
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="900" sx={{ color: '#06b6d4' }}>
            {stats.totalWorkouts}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: '1 1 140px',
            minWidth: 140,
            p: 2,
            borderRadius: 3,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Target size={18} color="#10b981" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Adherencia
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="900" sx={{ color: '#10b981' }}>
            {stats.adherenceRate}%
          </Typography>
        </Box>
      </Stack>

      {/* Heatmap Grid Container */}
      <Box
        sx={{
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, minWidth: 'max-content' }}>
          {/* Day of week labels */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', pr: 1, pt: '2px' }}>
            {dayLabels.map((lbl, idx) => (
              <Typography
                key={`lbl-${idx}`}
                variant="caption"
                sx={{
                  height: 14,
                  lineHeight: '14px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: idx % 2 === 0 ? 'text.secondary' : 'transparent',
                }}
              >
                {lbl}
              </Typography>
            ))}
          </Box>

          {/* Heatmap Columns (Weeks) */}
          <Box sx={{ display: 'flex', gap: '4px' }}>
            {weeks.map((week, wIdx) => (
              <Box key={`week-${wIdx}`} sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {week.map((day) => {
                  const color = getCellColor(day.count);
                  const isToday = new Date().toISOString().split('T')[0] === day.dateStr;

                  return (
                    <Tooltip
                      key={day.dateStr}
                      title={
                        <Box sx={{ p: 0.5, textAlign: 'center' }}>
                          <Typography variant="caption" fontWeight="bold">
                            {day.date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </Typography>
                          <Typography variant="caption" display="block" color="#22d3ee">
                            {day.count === 0 ? 'Día de descanso' : `${day.count} sesión(es) completada(s)`}
                          </Typography>
                        </Box>
                      }
                      arrow
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '3px',
                          background: color,
                          boxShadow: day.count > 0 ? `0 0 6px ${color}` : 'none',
                          border: isToday ? '1.5px solid #fff' : '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'all 0.15s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scale(1.4)',
                            zIndex: 10,
                            boxShadow: `0 0 12px ${color || '#fff'}`,
                          },
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Legend */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          mt: 2,
          pt: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Matriz adaptada a tu plan semanal de entrenamiento
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5 }}>
            Menos
          </Typography>
          <Box sx={{ width: 12, height: 12, borderRadius: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '2px', background: '#06b6d4', boxShadow: '0 0 4px #06b6d4' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '2px', background: '#10b981', boxShadow: '0 0 4px #10b981' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '2px', background: '#f43f5e', boxShadow: '0 0 4px #f43f5e' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
            Más (PR)
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ConsistencyHeatmap;
