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
  Chip
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { User } from '../../types/User';
import { WeeklyTracking } from '../../types/WeeklyTracking';
import { MonthlyTracking } from '../../types/MonthlyTracking';
import { ClientMedicalInfo } from '../../types/ClientMedicalInfo';
import { weeklyTrackingService } from '../../services/weeklyTrackingService';
import { monthlyTrackingService } from '../../services/monthlyTrackingService';
import { clientMedicalInfoService } from '../../services/clientMedicalInfoService';
import WeeklyTrackingForm from './WeeklyTrackingForm';
import ProgressPhotosManager from './ProgressPhotosManager';

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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ClientTrackingDashboardProps {
  user: User;
}

const ClientTrackingDashboard: React.FC<ClientTrackingDashboardProps> = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);
  const [weeklyTrackings, setWeeklyTrackings] = useState<WeeklyTracking[]>([]);
  const [monthlyTrackings, setMonthlyTrackings] = useState<MonthlyTracking[]>([]);
  const [medicalInfo, setMedicalInfo] = useState<ClientMedicalInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [weeklyFormOpen, setWeeklyFormOpen] = useState(false);
  const [progressPhotosOpen, setProgressPhotosOpen] = useState(false);
  const [selectedWeekDate, setSelectedWeekDate] = useState('');
  const [selectedPhotoDate, setSelectedPhotoDate] = useState('');

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [weeklyData, monthlyData, medicalData] = await Promise.all([
        weeklyTrackingService.getByUserId(user.id),
        monthlyTrackingService.getByUserId(user.id),
        clientMedicalInfoService.getByUserId(user.id)
      ]);

      setWeeklyTrackings(weeklyData);
      setMonthlyTrackings(monthlyData);
      setMedicalInfo(medicalData);

    } catch (error: any) {
      console.error('Error al cargar datos del cliente:', error);
      setError('Error al cargar los datos del cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getWeekStartDate = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
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
    return weeklyTrackings.some(w => w.week_start_date === weekDate);
  };

  const hasMonthlyPhotos = (monthDate: string): boolean => {
    return monthlyTrackings.some(m => m.month_date === monthDate && m.progress_photos_completed);
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Seguimiento de Cliente: {user.name} {user.surname}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            icon={<Iconify icon="solar:user-bold-duotone" width={20} />} 
            label="Información Médica" 
            id="client-tab-0"
            aria-controls="client-tabpanel-0"
          />
          <Tab 
            icon={<Iconify icon="solar:chart-2-bold-duotone" width={20} />} 
            label="Seguimiento Semanal" 
            id="client-tab-1"
            aria-controls="client-tabpanel-1"
          />
          <Tab 
            icon={<Iconify icon="solar:camera-bold-duotone" width={20} />} 
            label="Fotos de Progreso" 
            id="client-tab-2"
            aria-controls="client-tabpanel-2"
          />
          <Tab 
            icon={<Iconify icon="solar:document-bold-duotone" width={20} />} 
            label="Resumen" 
            id="client-tab-3"
            aria-controls="client-tabpanel-3"
          />
        </Tabs>
      </Box>

      {/* Información Médica */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información Médica Inicial
            </Typography>
            {medicalInfo ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Alergias:</Typography>
                  <Typography variant="body2">{medicalInfo.allergies || 'No especificadas'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Intolerancias Alimentarias:</Typography>
                  <Typography variant="body2">{medicalInfo.food_intolerances || 'No especificadas'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Lesiones o Molestias:</Typography>
                  <Typography variant="body2">{medicalInfo.injuries_conditions || 'No especificadas'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Alimentos que no le gustan:</Typography>
                  <Typography variant="body2">{medicalInfo.disliked_foods || 'No especificados'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Analítica:</Typography>
                  <Typography variant="body2">{medicalInfo.lab_results || 'No disponible'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Alimentación típica diaria:</Typography>
                  <Typography variant="body2">{medicalInfo.daily_nutrition_log || 'No especificada'}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                No se ha registrado información médica inicial para este cliente.
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Seguimiento Semanal */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => handleOpenWeeklyForm()}
            sx={{ mb: 2 }}
          >
            Nuevo Seguimiento Semanal
          </Button>
        </Box>

        <Grid container spacing={2}>
          {getLastNWeeks(8).map((weekDate) => (
            <Grid item xs={12} sm={6} md={3} key={weekDate}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Semana del {new Date(weekDate).toLocaleDateString('es-ES')}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {hasWeeklyData(weekDate) ? (
                      <Chip label="Completado" color="success" size="small" />
                    ) : (
                      <Chip label="Pendiente" color="warning" size="small" />
                    )}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleOpenWeeklyForm(weekDate)}
                  >
                    {hasWeeklyData(weekDate) ? 'Ver/Editar' : 'Completar'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Fotos de Progreso */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => handleOpenProgressPhotos()}
            sx={{ mb: 2 }}
          >
            Gestionar Fotos de Hoy
          </Button>
        </Box>

        <Grid container spacing={2}>
          {getLastNMonths(6).map((monthDate) => (
            <Grid item xs={12} sm={6} md={4} key={monthDate}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {new Date(monthDate).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {hasMonthlyPhotos(monthDate) ? (
                      <Chip label="Fotos Completadas" color="success" size="small" />
                    ) : (
                      <Chip label="Fotos Pendientes" color="warning" size="small" />
                    )}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleOpenProgressPhotos(monthDate)}
                  >
                    Ver Fotos
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Resumen */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Iconify icon="eva:activity-fill" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Seguimientos Semanales
                </Typography>
                <Typography variant="h3" color="primary">
                  {weeklyTrackings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seguimientos completados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CameraAlt sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Sesiones de Fotos
                </Typography>
                <Typography variant="h3" color="primary">
                  {monthlyTrackings.filter(m => m.progress_photos_completed).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sesiones de fotos completadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Último seguimiento semanal */}
          {weeklyTrackings.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Último Seguimiento Semanal
                  </Typography>
                  {(() => {
                    const lastTracking = weeklyTrackings[0];
                    return (
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2">Peso:</Typography>
                          <Typography variant="body1">{lastTracking.weight || 'N/A'} kg</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2">Días de entrenamiento:</Typography>
                          <Typography variant="body1">{lastTracking.training_days_completed || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2">Calidad del sueño:</Typography>
                          <Typography variant="body1">{lastTracking.sleep_quality || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="subtitle2">Autoevaluación:</Typography>
                          <Typography variant="body1">{lastTracking.self_rating || 'N/A'}/10</Typography>
                        </Grid>
                      </Grid>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          )}
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
