// Layout de autenticación con estética Liquid Glass iOS 26 y malla de luz ambiental fluida
import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { Iconify } from '../../utils/iconify'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#090d16',
        py: { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      {/* 3 Mallas de Luz Ambiental Fluida (Orbes Neón Desenfocados) */}
      <Box
        className="ambient-orb-1"
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: { xs: 300, sm: 500 },
          height: { xs: 300, sm: 500 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        className="ambient-orb-2"
        sx={{
          position: 'absolute',
          bottom: '-12%',
          right: '8%',
          width: { xs: 320, sm: 550 },
          height: { xs: 320, sm: 550 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.12) 50%, transparent 70%)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        className="ambient-orb-3"
        sx={{
          position: 'absolute',
          top: '40%',
          right: '-5%',
          width: { xs: 260, sm: 420 },
          height: { xs: 260, sm: 420 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Trama sutil de cuadrícula tecnológica */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Contenedor Central Glassmorphic */}
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, my: 'auto' }}>
        <Box
          className="liquid-glass-card"
          sx={{
            p: { xs: 3, sm: 4.5 },
            width: '100%',
            maxWidth: 460,
            mx: 'auto',
            borderRadius: 5,
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.82) 100%)',
            backdropFilter: 'blur(32px) saturate(210%)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 35px rgba(6, 182, 212, 0.18)',
            position: 'relative',
          }}
        >
          {/* Brand Logo & Header */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.6)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                mb: 1.5,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.06) rotate(-3deg)',
                },
              }}
            >
              <Iconify icon="solar:dumbbell-large-bold" width={34} sx={{ color: '#fff' }} />
            </Box>

            <Typography
              variant="h5"
              fontWeight={900}
              sx={{
                color: '#fff',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
              }}
            >
              FITNESS <span style={{ color: '#22d3ee' }}>PRO</span>
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                mt: 0.2,
              }}
            >
              Arquitectura Liquid Glass iOS 26
            </Typography>
          </Box>

          {/* Children (Sign In or Sign Up Form) */}
          <Box sx={{ width: '100%' }}>{children}</Box>
        </Box>
      </Container>
    </Box>
  )
}

export default AuthLayout
