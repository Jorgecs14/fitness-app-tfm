// Página de registro de usuarios con estética Apple iOS HIG (Segmented Control, 16px inputs y botón Apple Hero)
import { useState, useCallback } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import axiosInstance from '../lib/axios'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { User, Mail, Lock, Eye, EyeOff, Dumbbell, ShieldCheck } from 'lucide-react'

export const SignUpPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    acceptTerms: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (field: string) => (event: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value
    }))
  }

  const handleRoleSelect = (role: 'client' | 'trainer') => {
    setFormData((prev) => ({ ...prev, role }))
  }

  const handleSignUp = useCallback(async () => {
    setError('')

    // Validaciones
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError('Todos los campos son obligatorios.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones para continuar.')
      return
    }

    try {
      setLoading(true)
      const response = await axiosInstance.post('/users/register', {
        email: formData.email.trim(),
        password: formData.password,
        name: formData.firstName.trim(),
        surname: formData.lastName.trim(),
        role: formData.role
      })

      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setSuccess('¡Cuenta creada exitosamente! Accediendo a tu panel...')
        setTimeout(() => {
          if (formData.role === 'client' || formData.role === 'alumno') {
            navigate('/dashboard/client-home')
          } else {
            navigate('/dashboard/home')
          }
        }, 1200)
      } else {
        setError('Error al registrar usuario en el servidor.')
      }
    } catch (err: any) {
      const errData = err.response?.data?.error || err.response?.data?.details || err.message
      const errorMsg = typeof errData === 'string' ? errData : errData?.message || 'Error al crear la cuenta.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [formData, navigate])

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
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
          Crear Cuenta
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)' }}>
          Únete a la plataforma Fitness App Pro
        </Typography>
      </Box>

      {/* Apple Native Segmented Control */}
      <Box className="apple-segmented-control" sx={{ mb: 2.5 }}>
        <button
          type="button"
          onClick={() => handleRoleSelect('client')}
          className={`apple-segmented-btn ${formData.role === 'client' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Dumbbell size={15} />
          Soy Alumno
        </button>
        <button
          type="button"
          onClick={() => handleRoleSelect('trainer')}
          className={`apple-segmented-btn ${formData.role === 'trainer' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <ShieldCheck size={15} />
          Soy Entrenador
        </button>
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

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2.5,
            borderRadius: 3,
            backgroundColor: 'rgba(52, 199, 89, 0.12)',
            border: '0.5px solid rgba(52, 199, 89, 0.3)',
            color: '#32d74b',
            fontSize: '14px'
          }}
        >
          {success}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSignUp()
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.8
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'rgba(235, 235, 245, 0.7)' }}>
              Nombre
            </Typography>
            <TextField
              fullWidth
              name="firstName"
              placeholder="Juan"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color="rgba(235, 235, 245, 0.45)" />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'rgba(235, 235, 245, 0.7)' }}>
              Apellidos
            </Typography>
            <TextField
              fullWidth
              name="lastName"
              placeholder="Pérez"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
            />
          </Box>
        </Stack>

        <Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'rgba(235, 235, 245, 0.7)' }}>
            Correo electrónico
          </Typography>
          <TextField
            fullWidth
            name="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleInputChange('email')}
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
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'rgba(235, 235, 245, 0.7)' }}>
            Contraseña
          </Typography>
          <TextField
            fullWidth
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleInputChange('password')}
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

        <Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'rgba(235, 235, 245, 0.7)' }}>
            Confirmar Contraseña
          </Typography>
          <TextField
            fullWidth
            name="confirmPassword"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: 'rgba(235, 235, 245, 0.5)' }}
                    >
                      {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.acceptTerms}
              onChange={handleInputChange('acceptTerms')}
              sx={{
                color: 'rgba(255, 255, 255, 0.3)',
                '&.Mui-checked': { color: '#007aff' }
              }}
            />
          }
          label={
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.7)', fontSize: '12px' }}>
              Acepto los términos de servicio y privacidad
            </Typography>
          }
          sx={{ my: 0.5 }}
        />

        <button
          type="submit"
          disabled={loading}
          className="apple-btn-primary"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#000000' }} /> : 'Registrarse Ahora'}
        </button>

        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '14px' }}>
            ¿Ya tienes una cuenta?{' '}
            <RouterLink
              to="/sign-in"
              style={{ color: '#007aff', fontWeight: 600, textDecoration: 'none' }}
            >
              Inicia sesión
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default SignUpPage
