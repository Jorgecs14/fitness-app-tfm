// Página de inicio de sesión con estética Liquid Glass iOS 26 y autenticación JWT/Supabase
import { useState, useCallback } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import axiosInstance from '../lib/axios'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

import { Iconify } from '../utils/iconify'

export const SignInPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = useCallback(async () => {
    if (!email || !password) {
      setError('Por favor, introduce tu correo electrónico y contraseña.')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await axiosInstance.post('/users/login', {
        email,
        password
      })

      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        const role = response.data.user?.role
        if (role === 'client' || role === 'alumno' || role === 'cliente') {
          navigate('/dashboard/client-home')
        } else {
          navigate('/dashboard/home')
        }
      } else {
        setError('Error al obtener token de autenticación del servidor.')
      }
    } catch (err: any) {
      const errData = err.response?.data?.error || err.response?.data?.details || err.message
      const errorMsg = typeof errData === 'string' ? errData : errData?.message || 'Error al iniciar sesión. Comprueba tus credenciales.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [email, password, navigate])

  const handleGoogleSignIn = () => {
    alert('El inicio de sesión con Google estará disponible próximamente con OAuth nativo.')
  }

  // Quick fill helper for convenience
  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('123456')
  }

  return (
    <Box>
      <Box sx={{ mb: 3.5, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.02em', mb: 0.5 }}>
          Iniciar Sesión
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Accede a tu panel y gestiona tu rendimiento
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: 3,
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fecdd3'
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSignIn()
        }}
        sx={{
          '& .MuiTextField-root': {
            mb: 2.2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#fff',
              transition: 'all 0.25s ease',
              '& fieldset': { border: 'none' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.25)'
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.09)',
                border: '1px solid #22d3ee',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
              }
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.65)',
              '&.Mui-focused': { color: '#22d3ee' }
            }
          }
        }}
      >
        <TextField
          fullWidth
          name="email"
          label="Correo electrónico"
          placeholder="ejemplo@gym.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:letter-bold" width={20} sx={{ color: '#22d3ee' }} />
                </InputAdornment>
              )
            }
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Link
            variant="caption"
            sx={{
              color: '#22d3ee',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => alert('Recuperación de contraseña: Por favor contacta al administrador de tu gimnasio.')}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </Box>

        <TextField
          fullWidth
          name="password"
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:lock-keyhole-bold" width={20} sx={{ color: '#22d3ee' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={20} />
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />

        <Button
          fullWidth
          size="large"
          type="submit"
          disabled={loading}
          sx={{
            py: 1.5,
            mt: 1,
            mb: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 10px 25px rgba(6, 182, 212, 0.4)',
            transition: 'all 0.25s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 15px 35px rgba(6, 182, 212, 0.6)',
              background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)'
            }
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Iniciar Sesión'}
        </Button>

        <Button
          fullWidth
          size="large"
          component={RouterLink}
          to="/register"
          sx={{
            py: 1.4,
            borderRadius: 3,
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontWeight: 700,
            textTransform: 'none',
            transition: 'all 0.25s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          Crear Cuenta Nueva
        </Button>
      </Box>

      {/* Acceso Rápido Demo */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.45)', display: 'block', mb: 1 }}>
          Acceso rápido demo (clic para autocompletar):
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Chip
            size="small"
            label="Entrenador Demo"
            onClick={() => handleQuickFill('entrenador@gym.com')}
            sx={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#22d3ee',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { background: 'rgba(6, 182, 212, 0.3)' }
            }}
          />
          <Chip
            size="small"
            label="Alumno Demo"
            onClick={() => handleQuickFill('alumno@gym.com')}
            sx={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { background: 'rgba(16, 185, 129, 0.3)' }
            }}
          />
        </Stack>
      </Box>

      <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
          O CONTINÚA CON
        </Typography>
      </Divider>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        onClick={handleGoogleSignIn}
        startIcon={<Iconify width={20} icon="logos:google-icon" />}
        sx={{
          borderRadius: 3,
          color: 'rgba(255, 255, 255, 0.85)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          textTransform: 'none',
          fontWeight: 700,
          py: 1.2,
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.25)'
          }
        }}
      >
        Continuar con Google
      </Button>
    </Box>
  )
}

export default SignInPage
