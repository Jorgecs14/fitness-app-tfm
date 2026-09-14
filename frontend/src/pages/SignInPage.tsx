// Página de inicio de sesión con estética nativa Apple iOS HIG (OLED Black, tipografía SF y 0 auto-zoom)
import { useState, useCallback } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import axiosInstance from '../lib/axios'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { Mail, Lock, Eye, EyeOff, Dumbbell, ShieldCheck } from 'lucide-react'

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
        setError('No se pudo iniciar sesión. Comprueba tus credenciales.')
      }
    } catch (err: any) {
      const errData = err.response?.data?.error || err.response?.data?.details || err.message
      const errorMsg = typeof errData === 'string' && errData.length < 100
        ? errData
        : 'Correo o contraseña incorrectos. Usa los botones demo para acceder al instante.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [email, password, navigate])

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('123456')
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3.5, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            fontSize: { xs: '1.75rem', sm: '2rem' },
            mb: 0.5
          }}
        >
          Iniciar Sesión
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)' }}>
          Accede a tu plan de entrenamiento y nutrición
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 59, 48, 0.12)',
            border: '0.5px solid rgba(255, 59, 48, 0.3)',
            color: '#ff453a',
            fontSize: '14px'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Form Container */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSignIn()
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 0.7,
              fontWeight: 600,
              fontSize: '13px',
              color: 'rgba(235, 235, 245, 0.7)'
            }}
          >
            Correo Electrónico
          </Typography>
          <TextField
            fullWidth
            name="email"
            placeholder="ejemplo@gym.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={18} color="rgba(235, 235, 245, 0.45)" />
                  </InputAdornment>
                )
              }
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: '13px',
                color: 'rgba(235, 235, 245, 0.7)'
              }}
            >
              Contraseña
            </Typography>
            <Link
              variant="caption"
              sx={{
                color: '#007aff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => alert('Para restablecer tu contraseña, contacta al administrador.')}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>
          <TextField
            fullWidth
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} color="rgba(235, 235, 245, 0.45)" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(235, 235, 245, 0.5)' }}
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Box>

        {/* Apple Solid CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="apple-btn-primary"
          style={{
            marginTop: '8px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#000000' }} /> : 'Iniciar Sesión'}
        </button>

        {/* Secondary Account Switch Button */}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="apple-btn-secondary"
          style={{ width: '100%', height: '48px' }}
        >
          Crear Cuenta Nueva
        </button>
      </Box>

      {/* Apple Inset Demo Quick Access */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          backgroundColor: '#1c1c1e',
          border: '0.5px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(235, 235, 245, 0.6)',
            display: 'block',
            fontWeight: 600,
            fontSize: '12px',
            mb: 1.2,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          Acceso Rápido de Prueba:
        </Typography>
        <Stack direction="row" spacing={1}>
          <button
            type="button"
            onClick={() => handleQuickFill('alumno@gym.com')}
            className="apple-btn-secondary"
            style={{
              flex: 1,
              height: '40px',
              fontSize: '13px',
              gap: '6px'
            }}
          >
            <Dumbbell size={15} color="#34c759" />
            Alumno Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('entrenador@gym.com')}
            className="apple-btn-secondary"
            style={{
              flex: 1,
              height: '40px',
              fontSize: '13px',
              gap: '6px'
            }}
          >
            <ShieldCheck size={15} color="#007aff" />
            Entrenador Demo
          </button>
        </Stack>
      </Box>
    </Box>
  )
}

export default SignInPage
