// Página de registro de usuarios con estética Liquid Glass iOS 26 y selector de rol segmentado
import { useState, useCallback } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import axiosInstance from '../lib/axios'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

import { Iconify } from '../utils/iconify'

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
    <Box>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.02em', mb: 0.5 }}>
          Crear Cuenta
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Únete a la plataforma Liquid Glass Fitness
        </Typography>
      </Box>

      {/* Selector de Rol con Interruptor Segmentado Liquid Glass */}
      <Box
        sx={{
          p: 0.6,
          mb: 3,
          borderRadius: 3.5,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.8,
        }}
      >
        <Box
          onClick={() => handleRoleSelect('client')}
          sx={{
            py: 1.2,
            px: 1.5,
            borderRadius: 3,
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            background:
              formData.role === 'client'
                ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                : 'transparent',
            color: formData.role === 'client' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            boxShadow:
              formData.role === 'client' ? '0 4px 15px rgba(6, 182, 212, 0.4)' : 'none',
          }}
        >
          <Iconify icon="solar:dumbbell-bold" width={18} />
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.88rem' }}>
            Soy Alumno
          </Typography>
        </Box>

        <Box
          onClick={() => handleRoleSelect('trainer')}
          sx={{
            py: 1.2,
            px: 1.5,
            borderRadius: 3,
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            background:
              formData.role === 'trainer'
                ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                : 'transparent',
            color: formData.role === 'trainer' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            boxShadow:
              formData.role === 'trainer' ? '0 4px 15px rgba(6, 182, 212, 0.4)' : 'none',
          }}
        >
          <Iconify icon="solar:user-speak-bold" width={18} />
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.88rem' }}>
            Soy Entrenador
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: 3,
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fecdd3',
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
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#a7f3d0',
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
          '& .MuiTextField-root': {
            mb: 2,
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
                border: '1px solid rgba(255, 255, 255, 0.25)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.09)',
                border: '1px solid #22d3ee',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.65)',
              '&.Mui-focused': { color: '#22d3ee' },
            },
          },
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            name="firstName"
            label="Nombre"
            placeholder="Juan"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:user-bold" width={20} sx={{ color: '#22d3ee' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            fullWidth
            name="lastName"
            label="Apellidos"
            placeholder="Pérez García"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
          />
        </Stack>

        <TextField
          fullWidth
          name="email"
          label="Correo electrónico"
          placeholder="tu@email.com"
          value={formData.email}
          onChange={handleInputChange('email')}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:letter-bold" width={20} sx={{ color: '#22d3ee' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          fullWidth
          name="password"
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={handleInputChange('password')}
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
              ),
            },
          }}
        />

        <TextField
          fullWidth
          name="confirmPassword"
          label="Confirmar Contraseña"
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:lock-check-bold" width={20} sx={{ color: '#22d3ee' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    <Iconify icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={20} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.acceptTerms}
              onChange={handleInputChange('acceptTerms')}
              sx={{
                color: 'rgba(255, 255, 255, 0.4)',
                '&.Mui-checked': { color: '#22d3ee' },
              }}
            />
          }
          label={
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Acepto los términos de servicio y la política de privacidad de Fitness App
            </Typography>
          }
          sx={{ mb: 2, alignItems: 'flex-start' }}
        />

        <Button
          fullWidth
          size="large"
          type="submit"
          disabled={loading}
          sx={{
            py: 1.5,
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
              background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Registrarse Ahora'}
        </Button>

        <Box sx={{ mt: 2.5, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            ¿Ya tienes una cuenta registrada?{' '}
            <RouterLink
              to="/sign-in"
              style={{ color: '#22d3ee', fontWeight: 800, textDecoration: 'none' }}
            >
              Inicia sesión aquí
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default SignUpPage
