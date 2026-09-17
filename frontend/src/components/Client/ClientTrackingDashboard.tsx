import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Chip,
  Avatar,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { User } from '../../types/User';
import { WeeklyTracking } from '../../types/WeeklyTracking';
import { MonthlyTracking } from '../../types/MonthlyTracking';
import { ClientMedicalInfo } from '../../types/ClientMedicalInfo';
import { ClientProgressPhoto } from '../../types/ClientProgressPhoto';
import { weeklyTrackingService } from '../../services/weeklyTrackingService';
import { monthlyTrackingService } from '../../services/monthlyTrackingService';
import { clientMedicalInfoService } from '../../services/clientMedicalInfoService';
import { clientProgressPhotoService } from '../../services/clientProgressPhotoService';
import WeeklyTrackingForm from './WeeklyTrackingForm';
import ProgressPhotosManager from './ProgressPhotosManager';
import BeforeAfterSlider from '../Progress/BeforeAfterSlider';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ClientTrackingDashboardProps {
  user: User;
}

const normalizeDate = (d: string | undefined | null): string => {
  if (!d) return '';
  return d.split('T')[0];
};

export const ClientTrackingDashboard: React.FC<ClientTrackingDashboardProps> = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);
  const [weeklyTrackings, setWeeklyTrackings] = useState<WeeklyTracking[]>([]);
  const [monthlyTrackings, setMonthlyTrackings] = useState<MonthlyTracking[]>([]);
  const [medicalInfo, setMedicalInfo] = useState<ClientMedicalInfo | null>(null);
  const [clientPhotos, setClientPhotos] = useState<ClientProgressPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [weeklyFormOpen, setWeeklyFormOpen] = useState(false);
  const [progressPhotosOpen, setProgressPhotosOpen] = useState(false);
  const [selectedWeekDate, setSelectedWeekDate] = useState('');
  const [selectedPhotoDate, setSelectedPhotoDate] = useState('');

  useEffect(() => {
    if (user && user.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo con control de fallback individual para que un 404 o error no rompa todo el dashboard
      const [weeklyData, monthlyData, medicalData, photosData] = await Promise.all([
        weeklyTrackingService.getByUserId(user.id).catch((err) => {
          console.warn('No hay registros de seguimiento semanal o error:', err);
          return [] as WeeklyTracking[];
        }),
        monthlyTrackingService.getByUserId(user.id).catch((err) => {
          console.warn('No hay registros mensuales o error:', err);
          return [] as MonthlyTracking[];
        }),
        clientMedicalInfoService.getByUserId(user.id).catch((err) => {
          console.warn('No hay información médica registrada o error:', err);
          return null;
        }),
        clientProgressPhotoService.getByUserId(user.id).catch((err) => {
          console.warn('No hay fotos de progreso o error:', err);
          return [] as ClientProgressPhoto[];
        }),
      ]);

      // Ordenar seguimientos semanales por fecha descendente
      const sortedWeekly = (weeklyData || []).sort(
        (a, b) => new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
      );

      // Ordenar mensuales por fecha descendente
      const sortedMonthly = (monthlyData || []).sort(
        (a, b) => new Date(b.month_date).getTime() - new Date(a.month_date).getTime()
      );

      setWeeklyTrackings(sortedWeekly);
      setMonthlyTrackings(sortedMonthly);
      setMedicalInfo(medicalData);
      setClientPhotos(photosData || []);

    } catch (error: any) {
      console.error('Error al cargar datos del cliente:', error);
      setError('Error inesperado al cargar los datos del cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getWeekStartDate = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    const monday = new Date(d.setDate(diff));
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const dayStr = String(monday.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getCurrentWeekStart = (): string => {
    return getWeekStartDate(new Date());
  };

  const getMonthDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const getCurrentMonthDate = (): string => {
    return getMonthDate(new Date());
  };

  const handleOpenWeeklyForm = (weekDate?: string) => {
    setSelectedWeekDate(weekDate || getCurrentWeekStart());
    setWeeklyFormOpen(true);
  };

  const handleOpenProgressPhotos = (photoDate?: string) => {
    setSelectedPhotoDate(photoDate || new Date().toISOString().split('T')[0]);
    setProgressPhotosOpen(true);
  };

  const hasWeeklyData = (weekDate: string): boolean => {
    return weeklyTrackings.some(w => normalizeDate(w.week_start_date) === weekDate);
  };

  const hasMonthlyPhotos = (monthDate: string): boolean => {
    return monthlyTrackings.some(
      m => normalizeDate(m.month_date).substring(0, 7) === monthDate.substring(0, 7) && m.progress_photos_completed
    );
  };

  const getLastNWeeks = (n: number): string[] => {
    const weeks: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < n; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      weeks.push(getWeekStartDate(date));
    }
    
    return weeks;
  };

  const getLastNMonths = (n: number): string[] => {
    const months: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < n; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(getMonthDate(date));
    }
    
    return months;
  };

  if (!user) return null;

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      {/* Hero Header Liquid Glass */}
      <Box
        className="liquid-glass-card"
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                fontWeight: 800,
                fontSize: '1.3rem',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {user.name.charAt(0).toUpperCase()}
              {user.surname.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.02em' }}>
                  {user.name} {user.surname}
                </Typography>
                <Chip
                  label={user.role === 'client' ? 'Cliente' : user.role}
                  size="small"
                  sx={{
                    background: 'rgba(6, 182, 212, 0.2)',
                    color: '#22d3ee',
                    fontWeight: 700,
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                  }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2 }}>
                {user.email} • ID #{user.id}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={loadData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Iconify icon="solar:refresh-bold" />}
            sx={{
              borderRadius: '20px',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              px: 2,
            }}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#22d3ee',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#22d3ee',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab 
            icon={<Iconify icon="solar:user-bold-duotone" width={20} />} 
            iconPosition="start"
            label="Información Médica" 
            id="client-tab-0"
            aria-controls="client-tabpanel-0"
          />
          <Tab 
            icon={<Iconify icon="solar:chart-2-bold-duotone" width={20} />} 
            iconPosition="start"
            label="Seguimiento Semanal" 
            id="client-tab-1"
            aria-controls="client-tabpanel-1"
          />
          <Tab 
            icon={<Iconify icon="solar:camera-bold-duotone" width={20} />} 
            iconPosition="start"
            label="Fotos de Progreso" 
            id="client-tab-2"
            aria-controls="client-tabpanel-2"
          />
          <Tab 
            icon={<Iconify icon="solar:document-bold-duotone" width={20} />} 
            iconPosition="start"
            label="Resumen Métrico" 
            id="client-tab-3"
            aria-controls="client-tabpanel-3"
          />
        </Tabs>
      </Box>

      {/* Tab 0: Información Médica */}
      <TabPanel value={tabValue} index={0}>
        <Box
          className="liquid-glass-card"
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Typography variant="h6" fontWeight="800" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:medical-kit-bold" width={22} sx={{ color: '#22d3ee' }} />
            Ficha Médica y Anamnesis Inicial
          </Typography>
          <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

          {medicalInfo ? (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Alergias Conocidas</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>{medicalInfo.allergies || 'Ninguna especificada'}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Intolerancias Alimentarias</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>{medicalInfo.food_intolerances || 'Ninguna especificada'}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Lesiones o Molestias Articulares</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>{medicalInfo.injuries_conditions || 'Sin lesiones previas'}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Alimentos que no le gustan</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>{medicalInfo.disliked_foods || 'No especificados'}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Analítica Sanguínea / Resultados Clínicos</Typography>
                  <Typography variant="body1" fontWeight="500" sx={{ mt: 0.5 }}>{medicalInfo.lab_results || 'No disponible o pendiente'}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Registro de Alimentación Típica</Typography>
                  <Typography variant="body1" fontWeight="500" sx={{ mt: 0.5 }}>{medicalInfo.daily_nutrition_log || 'No especificada'}</Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              No se ha registrado información médica inicial para este cliente aún.
            </Alert>
          )}
        </Box>
      </TabPanel>

      {/* Tab 1: Seguimiento Semanal */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="800">
              Historial de Semanas (Últimas 8 Semanas)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Haz clic en cada semana para revisar el pesaje, medidas o completar el reporte.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => handleOpenWeeklyForm()}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            sx={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              fontWeight: 700,
            }}
          >
            Nuevo Seguimiento Semanal
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {getLastNWeeks(8).map((weekDate) => {
            const isCompleted = hasWeeklyData(weekDate);
            const dateFormatted = new Date(weekDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={weekDate}>
                <Box
                  className="liquid-glass-card"
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: isCompleted ? '#10b981' : '#f59e0b',
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="subtitle2" fontWeight="800">
                      Semana {dateFormatted}
                    </Typography>
                    {isCompleted ? (
                      <Chip label="Completado" color="success" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    ) : (
                      <Chip label="Pendiente" color="warning" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    )}
                  </Box>

                  <Button
                    variant={isCompleted ? 'outlined' : 'contained'}
                    size="small"
                    fullWidth
                    onClick={() => handleOpenWeeklyForm(weekDate)}
                    sx={{
                      borderRadius: '16px',
                      textTransform: 'none',
                      fontWeight: 700,
                      mt: 1,
                      ...(isCompleted ? {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                      } : {
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      }),
                    }}
                  >
                    {isCompleted ? 'Ver / Editar Reporte' : 'Completar Semana'}
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>

      {/* Tab 2: Fotos de Progreso */}
      <TabPanel value={tabValue} index={2}>
        {/* Interactive Before & After Visual Slider */}
        <Box sx={{ mb: 4 }}>
          <BeforeAfterSlider photos={clientPhotos} onUploadClick={() => handleOpenProgressPhotos()} />
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="800">
              Historial de Sesiones Fotográficas
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Álbumes mensuales de poses corporales (Frente, Perfil, Espalda).
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => handleOpenProgressPhotos()}
            startIcon={<Iconify icon="solar:camera-add-bold" />}
            sx={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              fontWeight: 700,
            }}
          >
            Gestionar Fotos de Hoy
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {getLastNMonths(6).map((monthDate) => {
            const isCompleted = hasMonthlyPhotos(monthDate);
            const monthLabel = new Date(monthDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={monthDate}>
                <Box
                  className="liquid-glass-card"
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="800" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {monthLabel}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {isCompleted ? (
                      <Chip label="Fotos Completadas" color="success" size="small" sx={{ fontWeight: 700 }} />
                    ) : (
                      <Chip label="Fotos Pendientes" color="warning" size="small" sx={{ fontWeight: 700 }} />
                    )}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleOpenProgressPhotos(monthDate)}
                    sx={{
                      borderRadius: '16px',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                    }}
                  >
                    Ver Álbum
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>

      {/* Tab 3: Resumen Métrico */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              className="liquid-glass-card"
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Iconify icon="solar:chart-2-bold" width={24} sx={{ color: '#06b6d4' }} />
                <Typography variant="h6" fontWeight="800">
                  Seguimientos Semanales
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="900" sx={{ color: '#06b6d4', my: 1 }}>
                {weeklyTrackings.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Reportes biométricos registrados hasta la fecha
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              className="liquid-glass-card"
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Iconify icon="solar:camera-bold" width={24} sx={{ color: '#10b981' }} />
                <Typography variant="h6" fontWeight="800">
                  Sesiones Fotográficas
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="900" sx={{ color: '#10b981', my: 1 }}>
                {monthlyTrackings.filter(m => m.progress_photos_completed).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Álbumes con las 3 poses completadas
              </Typography>
            </Box>
          </Grid>

          {/* Punto de Partida del Atleta */}
          {weeklyTrackings.length > 0 && (() => {
            const chronological = [...weeklyTrackings].sort(
              (a, b) => new Date(a.week_start_date).getTime() - new Date(b.week_start_date).getTime()
            );
            const baseline = chronological[0];
            const latest = weeklyTrackings[0];

            const weightDelta =
              latest.weight && baseline.weight ? Number((latest.weight - baseline.weight).toFixed(1)) : null;
            const waistDelta =
              latest.waist_measurement && baseline.waist_measurement
                ? Number((latest.waist_measurement - baseline.waist_measurement).toFixed(1))
                : null;

            return (
              <Grid size={{ xs: 12 }}>
                <Box
                  className="liquid-glass-card"
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                    <Box display="flex" alignItems="center" gap={1.2}>
                      <Iconify icon="solar:flag-bold" width={22} sx={{ color: '#22d3ee' }} />
                      <Typography variant="h6" fontWeight="800">
                        Punto de Partida del Atleta (Día 1 vs Actual)
                      </Typography>
                    </Box>
                    <Chip
                      label={`Registrado el ${new Date(baseline.week_start_date).toLocaleDateString('es-ES')}`}
                      size="small"
                      sx={{
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: '#22d3ee',
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Evolución de Peso
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1.5} mt={0.5}>
                          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Inicio: <strong>{baseline.weight ? `${baseline.weight} kg` : '—'}</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>➔</Typography>
                          <Typography variant="body1" fontWeight="800" sx={{ color: '#22d3ee' }}>
                            Actual: {latest.weight ? `${latest.weight} kg` : '—'}
                          </Typography>
                          {weightDelta !== null && (
                            <Chip
                              label={`${weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg`}
                              size="small"
                              color={weightDelta <= 0 ? 'success' : 'warning'}
                              sx={{ fontWeight: 800, height: 22, fontSize: '0.72rem', ml: 'auto' }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Evolución de Cintura
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1.5} mt={0.5}>
                          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Inicio: <strong>{baseline.waist_measurement ? `${baseline.waist_measurement} cm` : '—'}</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>➔</Typography>
                          <Typography variant="body1" fontWeight="800" sx={{ color: '#22d3ee' }}>
                            Actual: {latest.waist_measurement ? `${latest.waist_measurement} cm` : '—'}
                          </Typography>
                          {waistDelta !== null && (
                            <Chip
                              label={`${waistDelta > 0 ? `+${waistDelta}` : waistDelta} cm`}
                              size="small"
                              color={waistDelta <= 0 ? 'success' : 'warning'}
                              sx={{ fontWeight: 800, height: 22, fontSize: '0.72rem', ml: 'auto' }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            );
          })()}
        </Grid>
      </TabPanel>

      {/* Modals */}
      <WeeklyTrackingForm
        open={weeklyFormOpen}
        onClose={() => setWeeklyFormOpen(false)}
        userId={user.id}
        weekStartDate={selectedWeekDate}
        onSave={loadData}
      />

      <ProgressPhotosManager
        open={progressPhotosOpen}
        onClose={() => setProgressPhotosOpen(false)}
        userId={user.id}
        photoDate={selectedPhotoDate}
        onSave={loadData}
      />
    </Box>
  );
};

export default ClientTrackingDashboard;
