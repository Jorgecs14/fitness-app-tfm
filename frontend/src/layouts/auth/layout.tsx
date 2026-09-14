// Layout de autenticación con estética Apple OLED Dark Mode (Negro puro, logo Apple minimalista)
import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { Dumbbell } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#000000',
        py: { xs: 3, sm: 6 },
        px: 2,
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1, my: 'auto', p: { xs: 0, sm: 2 } }}>
        <Box
          className="apple-card"
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: 420,
            mx: 'auto',
            borderRadius: { xs: 4, sm: 5 },
            backgroundColor: '#1c1c1e',
            border: '0.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Apple Minimalist Brand */}
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
                width: 48,
                height: 48,
                borderRadius: '13px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <Dumbbell size={24} color="#000000" strokeWidth={2.2} />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
              }}
            >
              FITNESS <span style={{ color: '#007aff' }}>PRO</span>
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: 'rgba(235, 235, 245, 0.5)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                mt: 0.3,
                fontSize: '11px'
              }}
            >
              Apple HIG Experience
            </Typography>
          </Box>

          {/* Form Content */}
          <Box sx={{ width: '100%' }}>{children}</Box>
        </Box>
      </Container>
    </Box>
  )
}

export default AuthLayout
