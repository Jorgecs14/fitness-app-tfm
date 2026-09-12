import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Chip,
  Grid,
  Divider,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Iconify } from '../utils/iconify';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'trainers' | 'clients'>('trainers');

  const features = [
    {
      icon: 'solar:dumbbell-large-bold-duotone',
      color: '#00a76f',
      title: 'Rutinas & Tracker en Vivo',
      badge: 'En Tiempo Real',
      description:
        'Crea entrenamientos personalizados y permite a tus alumnos registrarlos en tiempo real con temporizadores, rpe y ejecuciones paso a paso.',
    },
    {
      icon: 'solar:chef-hat-heart-bold-duotone',
      color: '#ffab00',
      title: 'Planes Nutricionales & PDF Pro',
      badge: 'Plantilla Visual',
      description:
        'Genera dietas semanales con cálculo automático de macros y exportación instantánea a PDFs de alta calidad con checklist interactivo diario.',
    },
    {
      icon: 'solar:fire-bold-duotone',
      color: '#ff5630',
      title: 'Mapa Muscular Interactivo',
      badge: 'Algoritmo Exclusivo',
      description:
        'Visualiza el mapa de fatiga y recuperación muscular de tus alumnos basado en el volumen de entrenamiento real acumulado.',
    },
    {
      icon: 'solar:chart-2-bold-duotone',
      color: '#078deE',
      title: 'Seguimiento & Analytics',
      badge: 'Control Total',
      description:
        'Monitorea el peso, perímetros corporales, masa magra y fotos de progreso de cada cliente con métricas automatizadas.',
    },
    {
      icon: 'solar:user-speak-bold-duotone',
      color: '#8e33ff',
      title: 'Conexión Entrenador - Alumno',
      badge: 'Directo',
      description:
        'Vincula alumnos en 1-clic para revisar su adherencia alimenticia, mensajes y estado físico al instante.',
    },
    {
      icon: 'solar:shop-bold-duotone',
      color: '#00b8d9',
      title: 'Tienda de Suplementación Integrada',
      badge: 'Monetización',
      description:
        'Ofrece productos, suplementos y servicios adicionales directamente dentro del portal del alumno.',
    },
  ];

  const stats = [
    { value: '+1,300', label: 'Ejercicios con Vídeo', icon: 'solar:play-circle-bold-duotone' },
    { value: '100%', label: 'PDFs Visuales Descargables', icon: 'solar:document-bold-duotone' },
    { value: '24/7', label: 'Monitoreo en Tiempo Real', icon: 'solar:pulse-bold-duotone' },
    { value: '4.9 ★', label: 'Valoración de Entrenadores', icon: 'solar:star-bold-duotone' },
  ];

  return (
    <Box sx={{ bgcolor: '#090d16', color: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Keyframe Animations */}
      <Box
        sx={{
          '@keyframes pulseGlow': {
            '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
            '50%': { opacity: 0.7, transform: 'scale(1.08)' },
          },
          '@keyframes floatSlow': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-12px)' },
          },
        }}
      />

      {/* Modern Blurred Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'rgba(9, 13, 22, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: { xs: 64, sm: 76 },
            maxWidth: '1280px',
            width: '100%',
            mx: 'auto',
            px: { xs: 2, sm: 4 },
          }}
        >
          {/* Logo Brand */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <Box
              component="img"
              src="/logo_LB.png"
              alt="LifeBoost Logo"
              sx={{ height: 36, width: 36, objectFit: 'contain' }}
            />
            <Typography
              variant="h6"
              fontWeight={900}
              sx={{
                background: 'linear-gradient(90deg, #ffffff 0%, #00a76f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              LifeBoost <span style={{ color: '#00a76f', WebkitTextFillColor: '#00a76f' }}>FITNESS</span>
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="text"
              onClick={() => navigate('/sign-in')}
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 2.5,
                py: 1,
                borderRadius: '12px',
                '&:hover': {
                  color: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                },
              }}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              startIcon={<Iconify icon="solar:user-plus-bold" />}
              sx={{
                background: 'linear-gradient(135deg, #00a76f 0%, #007867 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                px: 3,
                py: 1,
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(0, 167, 111, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00b87a 0%, #008875 100%)',
                  boxShadow: '0 12px 28px rgba(0, 167, 111, 0.5)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Registrarse
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 16, md: 20 },
          pb: { xs: 10, md: 14 },
          background: 'radial-gradient(circle at 50% 20%, rgba(0, 167, 111, 0.15) 0%, rgba(9, 13, 22, 1) 70%)',
        }}
      >
        {/* Ambient Glows */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(0, 167, 111, 0.25) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(60px)',
            animation: 'pulseGlow 8s infinite ease-in-out',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            right: '10%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(7, 141, 238, 0.2) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(70px)',
            animation: 'pulseGlow 10s infinite ease-in-out 2s',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            {/* Top Chip Announcement */}
            <Chip
              icon={<Iconify icon="solar:stars-bold" style={{ color: '#00a76f' }} />}
              label="VERSIÓN 2.0 • LA PLATAFORMA INTEGRAL PARA FITNESS"
              sx={{
                bgcolor: 'rgba(0, 167, 111, 0.12)',
                color: '#00a76f',
                border: '1px solid rgba(0, 167, 111, 0.3)',
                fontWeight: 700,
                fontSize: '0.85rem',
                py: 2.2,
                px: 1,
                borderRadius: '30px',
                backdropFilter: 'blur(8px)',
              }}
            />

            {/* Main Headline */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.4rem', sm: '3.6rem', md: '4.8rem' },
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-1.5px',
                maxWidth: '960px',
              }}
            >
              Revoluciona tu asesoramiento fitness con{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #00a76f 0%, #00db87 50%, #078deE 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                tecnología en tiempo real
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 400,
                fontSize: { xs: '1.05rem', sm: '1.25rem', md: '1.4rem' },
                lineHeight: 1.6,
                maxWidth: '780px',
              }}
            >
              Crea rutinas inteligentes, diseña dietas con plantillas PDF interactivas, supervisa la masa muscular con mapas de calor y ofrece a tus clientes una experiencia única.
            </Typography>

            {/* Call to Action Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                startIcon={<Iconify icon="solar:rocket-bold-duotone" />}
                sx={{
                  background: 'linear-gradient(135deg, #00a76f 0%, #007867 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.8,
                  borderRadius: '16px',
                  boxShadow: '0 12px 30px rgba(0, 167, 111, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00b87a 0%, #008875 100%)',
                    boxShadow: '0 16px 36px rgba(0, 167, 111, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Comenzar Gratis
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/sign-in')}
                startIcon={<Iconify icon="solar:shield-user-bold-duotone" />}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.8,
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Acceso a Alumnos y Entrenadores
              </Button>
            </Stack>

            {/* Quick Proof Badges */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              alignItems="center"
              justifyContent="center"
              sx={{ pt: 3, opacity: 0.8 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" style={{ color: '#00a76f' }} />
                <Typography variant="body2">Sin tarjeta requerida para probar</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" style={{ color: '#00a76f' }} />
                <Typography variant="body2">Multi-dispositivo Móvil y Web</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" style={{ color: '#00a76f' }} />
                <Typography variant="body2">Sincronización instantánea</Typography>
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Metrics & Highlights Banner */}
      <Box
        sx={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(15, 22, 36, 0.6)',
          py: 5,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, idx) => (
              <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 1.5,
                      borderRadius: '16px',
                      bgcolor: 'rgba(0, 167, 111, 0.1)',
                      mb: 1,
                    }}
                  >
                    <Iconify icon={stat.icon} style={{ fontSize: 28, color: '#00a76f' }} />
                  </Box>
                  <Typography variant="h3" fontWeight={900} sx={{ color: '#ffffff' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Grid Section */}
      <Box sx={{ py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="overline" color="#00a76f" fontWeight={800} letterSpacing="2px">
              HERRAMIENTAS PROFESIONALES
            </Typography>
            <Typography variant="h2" fontWeight={900} sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
              Todo lo que necesitas en una sola plataforma
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255, 255, 255, 0.65)', maxWidth: '640px', mx: 'auto', fontSize: '1.1rem' }}
            >
              Diseñada específicamente para maximizar los resultados de tus atletas y simplificar la gestión diaria de tu negocio.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {features.map((feat, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'rgba(18, 25, 40, 0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      borderColor: feat.color,
                      boxShadow: `0 20px 40px ${feat.color}22`,
                      '& .feature-glow': {
                        opacity: 0.15,
                      },
                    },
                  }}
                >
                  <Box
                    className="feature-glow"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '120px',
                      background: `radial-gradient(circle, ${feat.color} 0%, rgba(0,0,0,0) 70%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                    }}
                  />

                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={2.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            bgcolor: `${feat.color}15`,
                            border: `1px solid ${feat.color}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify icon={feat.icon} style={{ fontSize: 32, color: feat.color }} />
                        </Box>
                        <Chip
                          label={feat.badge}
                          size="small"
                          sx={{
                            bgcolor: `${feat.color}15`,
                            color: feat.color,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Stack>

                      <Typography variant="h6" fontWeight={800} sx={{ color: '#ffffff' }}>
                        {feat.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.7 }}
                      >
                        {feat.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Role Switch Showcase (Entrenadores vs Clientes) */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'rgba(15, 22, 36, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="overline" color="#078deE" fontWeight={800} letterSpacing="2px">
              EXPERIENCIA ADAPTADA
            </Typography>
            <Typography variant="h3" fontWeight={900}>
              Diseñado para ambas partes de la experiencia
            </Typography>

            <Stack direction="row" spacing={1} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 0.8, borderRadius: '16px' }}>
              <Button
                onClick={() => setActiveTab('trainers')}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  color: activeTab === 'trainers' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  bgcolor: activeTab === 'trainers' ? '#00a76f' : 'transparent',
                  '&:hover': {
                    bgcolor: activeTab === 'trainers' ? '#00a76f' : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                👨‍🏫 Para Entrenadores
              </Button>
              <Button
                onClick={() => setActiveTab('clients')}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  color: activeTab === 'clients' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  bgcolor: activeTab === 'clients' ? '#078deE' : 'transparent',
                  '&:hover': {
                    bgcolor: activeTab === 'clients' ? '#078deE' : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                🏋️ Para Alumnos
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={4} alignItems="center">
            {activeTab === 'trainers' ? (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={3}>
                    <Typography variant="h4" fontWeight={800}>
                      Potencia tu marca personal y escala tu número de clientes
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
                      Olvida las hojas de cálculo confusas y WhatsApp desorganizado. Centraliza las rutinas, dietas y progresos en un panel ágil y profesional.
                    </Typography>
                    <Stack spacing={1.5}>
                      {[
                        'Asignación directa de rutinas y dietas por cliente',
                        'Generación de documentos PDF de nivel profesional',
                        'Monitoreo instantáneo de cumplimientos diario',
                        'Gestión de cobros y productos en tienda',
                      ].map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Iconify icon="solar:check-circle-bold-duotone" style={{ color: '#00a76f', fontSize: 22 }} />
                          <Typography fontWeight={600}>{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Box sx={{ pt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/register')}
                        sx={{
                          bgcolor: '#00a76f',
                          fontWeight: 700,
                          px: 4,
                          py: 1.5,
                          borderRadius: '12px',
                          '&:hover': { bgcolor: '#008875' },
                        }}
                      >
                        Crear Cuenta Entrenador
                      </Button>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '24px',
                      bgcolor: 'rgba(18, 25, 40, 0.8)',
                      border: '1px solid rgba(0, 167, 111, 0.3)',
                      boxShadow: '0 20px 50px rgba(0, 167, 111, 0.15)',
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#00a76f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          E
                        </Box>
                        <Box>
                          <Typography fontWeight="bold">Panel del Entrenador</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Vista previa del Dashboard</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        ⚡ Alumnos Activos: 24 | Cumplimiento Medio: 94%
                      </Typography>
                      <Box sx={{ bgcolor: 'rgba(0, 167, 111, 0.1)', p: 2, borderRadius: '12px', border: '1px border rgba(0, 167, 111, 0.2)' }}>
                        <Typography variant="subtitle2" color="#00a76f" fontWeight="bold">✓ Dieta de Definición Asignada a Carlos M.</Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.6)">PDF Generado y Checklist diario activo</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </>
            ) : (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={3}>
                    <Typography variant="h4" fontWeight="bold">
                      La app definitiva para alcanzar tu mejor versión
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
                      Accede a tus entrenamientos del día, marca tus comidas con el checklist interactivo, revisa tus registros en vivo y comunícate con tu entrenador.
                    </Typography>
                    <Stack spacing={1.5}>
                      {[
                        'Tracker de series y descansos en tiempo real',
                        'Checklist diario de comidas y macros',
                        'Mapa de recuperación muscular personalizado',
                        'Envío de reportes periódicos y fotos de progreso',
                      ].map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Iconify icon="solar:check-circle-bold-duotone" style={{ color: '#078deE', fontSize: 22 }} />
                          <Typography fontWeight={600}>{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Box sx={{ pt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/register')}
                        sx={{
                          bgcolor: '#078deE',
                          fontWeight: 700,
                          px: 4,
                          py: 1.5,
                          borderRadius: '12px',
                          '&:hover': { bgcolor: '#0066c0' },
                        }}
                      >
                        Crear Cuenta Alumno
                      </Button>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '24px',
                      bgcolor: 'rgba(18, 25, 40, 0.8)',
                      border: '1px solid rgba(7, 141, 238, 0.3)',
                      boxShadow: '0 20px 50px rgba(7, 141, 238, 0.15)',
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#078deE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          A
                        </Box>
                        <Box>
                          <Typography fontWeight="bold">Portal del Alumno</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Mi Plan de Hoy</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                      <Box sx={{ bgcolor: 'rgba(7, 141, 238, 0.1)', p: 2, borderRadius: '12px' }}>
                        <Typography variant="subtitle2" color="#078deE" fontWeight="bold">🏋️ Rutina: Pierna & Hombro</Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.6)">4 Ejercicios • 16 Series totales</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Banner */}
      <Box sx={{ py: { xs: 10, md: 14 } }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6, md: 8 },
              borderRadius: '32px',
              background: 'linear-gradient(135deg, rgba(0, 167, 111, 0.9) 0%, rgba(0, 120, 103, 0.9) 100%)',
              boxShadow: '0 24px 60px rgba(0, 167, 111, 0.35)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Typography variant="h3" fontWeight={900} sx={{ color: '#ffffff', fontSize: { xs: '1.8rem', md: '2.8rem' } }}>
                ¿Listo para transformar la forma en que entrenas?
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px', fontSize: '1.1rem' }}>
                Únete hoy a LifeBoost Fitness y experimenta la plataforma de asesoramiento más completa.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#007867',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  px: 5,
                  py: 2,
                  borderRadius: '16px',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 14px 30px rgba(0,0,0,0.3)',
                  },
                }}
              >
                REGÍSTRATE GRATIS AHORA
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Modern Footer */}
      <Box sx={{ bgcolor: '#060911', borderTop: '1px solid rgba(255, 255, 255, 0.08)', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box component="img" src="/logo_LB.png" alt="LifeBoost Logo" sx={{ height: 32 }} />
                <Typography variant="h6" fontWeight={900}>LifeBoost FIT</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: '380px', mb: 2 }}>
                Plataforma integral de gestión para entrenadores personales y atletas. Diseñado para potenciar rendimientos y resultados reales.
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                Una extensión de LifeBoost1.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" fontWeight={800} color="#00a76f" sx={{ mb: 2 }}>
                CONTACTO & SOPORTE
              </Typography>
              <Stack spacing={1} sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                <Typography>📧 info@lifeboost-platform.com</Typography>
                <Typography>📱 +34 727 733 332</Typography>
                <Typography>📍 Granada, España</Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              © {new Date().getFullYear()} LifeBoost Platform. Todos los derechos reservados.
            </Typography>
            <Button
              color="inherit"
              size="small"
              onClick={() => window.open('https://lifeboost1.com/', '_blank')}
              sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}
            >
              Visitar Web Oficial LifeBoost1
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;

