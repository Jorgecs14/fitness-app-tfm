import { AppBar, Toolbar } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Stack } from '@mui/material';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <AppBar position="absolute" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 80 }}>
          {/* Logo LB a la izquierda */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box
              sx={{
                background: '#222',
                borderRadius: '50%',
                p: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                width: 48,
              }}
            >
              <img
                src="/src/assets/logo_LB.png"
                alt="Logo LB"
                style={{ height: 32, width: 32, objectFit: 'contain', cursor: 'pointer' }}
                onClick={() => window.open('https://lifeboost1.com/', '_blank')}
              />
            </Box>
          </Box>
          {/* Logo principal centrado SIN logo LB encima */}
          <Box
            sx={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 120,
            }}
          >
            {/* Logo principal */}
            <img
              src="/src/assets/logo.png"
              alt="Logo principal"
              style={{ height: 56, cursor: 'pointer', zIndex: 1, marginTop: 32 }}
              onClick={() => navigate('/')}
            />
          </Box>
          {/* Botón a la derecha */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => navigate('/sign-in')}
              sx={{ color: '#222', fontWeight: 700, fontSize: 18, mr: 1 }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg,rgb(255, 255, 255) 0%,rgb(205, 205, 205) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 20, // más espacio para el header
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: '#222',
                fontWeight: 700,
                textShadow: '0 2px 8px rgba(255,255,255,0.3)',
                letterSpacing: '0.5px',
              }}
            >
              La plataforma completa para gestionar tu negocio de entrenamiento personal
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 6,
                fontSize: '1.25rem',
                maxWidth: '600px',
                mx: 'auto',
                color: '#333',
                fontWeight: 500,
                textShadow: '0 2px 8px rgba(255,255,255,0.2)',
                letterSpacing: '0.2px',
              }}
            >
              Administra clientes, crea planes de entrenamiento personalizados, 
              gestiona dietas y lleva el control completo de tu negocio fitness.
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/sign-in')}
                sx={{
                  background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
                  color: '#222',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  fontSize: '1.25rem',
                  letterSpacing: '1px',
                  px: 6,
                  py: 2.5,
                  borderRadius: '32px',
                  boxShadow: '0 4px 16px 0 rgba(255, 188, 51, 0.25)',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #ffcc33 0%, #ffb347 100%)',
                    transform: 'scale(1.04)',
                    boxShadow: '0 6px 24px 0 rgba(255, 188, 51, 0.35)',
                  },
                }}
              >
                Iniciar Sesión
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: '#222',
                  color: '#222',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  fontSize: '1.25rem',
                  letterSpacing: '1px',
                  px: 6,
                  py: 2.5,
                  borderRadius: '32px',
                  background: 'transparent',
                  boxShadow: '0 4px 16px 0 rgba(0,0,0,0.08)',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.06)',
                    borderColor: '#222',
                    transform: 'scale(1.04)',
                    boxShadow: '0 6px 24px 0 rgba(0,0,0,0.18)',
                  },
                }}
              >
                Crear Cuenta
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
};