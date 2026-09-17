// Página de perfil de usuario con edición de datos, cambio de contraseña, facturación y diseño premium
import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Stack,
  Divider,
  Alert,
  Tab,
  Tabs,
  LinearProgress,
  Chip
} from '@mui/material'
import { User } from '../types/User'
import * as userService from '../services/userService'
import * as dietService from '../services/dietService'
import * as workoutService from '../services/workoutService'
import { useToast } from '../utils/notifications'
import { Chart } from '../utils/chart'
import { ClientSubscriptionTab } from '../components/Client/ClientSubscriptionTab'
import {
  User as UserIcon,
  CreditCard,
  BarChart3,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  Calendar,
  Mail,
  ShieldCheck,
  KeyRound
} from 'lucide-react'

interface UserStats {
  totalUsers: number
  totalDiets: number
  totalWorkouts: number
  usersByRole: { admin: number; user: number }
}

export const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalDiets: 0,
    totalWorkouts: 0,
    usersByRole: { admin: 0, user: 0 }
  })

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    surname: '',
    email: '',
    birth_date: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const isTrainerOrAdmin =
    currentUser?.role === 'trainer' ||
    currentUser?.role === 'entrenador' ||
    currentUser?.role === 'admin'

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const user = await userService.getCurrentUser()
      setCurrentUser(user)
      setProfileForm({
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',
        birth_date: user.birth_date ? user.birth_date.split('T')[0] : ''
      })

      if (user.role === 'admin' || user.role === 'trainer' || user.role === 'entrenador') {
        loadStats()
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
      const errorMessage = err.message || 'Error al cargar el perfil'
      setError(errorMessage)
      if (
        errorMessage.includes('autenticado') ||
        errorMessage.includes('inicia sesión')
      ) {
        setTimeout(() => {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/sign-in'
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const [users, diets, workouts] = await Promise.all([
        userService.getUsers(),
        dietService.getDiets(),
        workoutService.getWorkouts()
      ])

      const usersByRole = users.reduce(
        (acc, user) => {
          acc[user.role as keyof typeof acc] =
            (acc[user.role as keyof typeof acc] || 0) + 1
          return acc
        },
        { admin: 0, user: 0 }
      )

      setStats({
        totalUsers: users.length,
        totalDiets: diets.length,
        totalWorkouts: workouts.length,
        usersByRole
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      setSaving(true)
      await userService.updateUser(currentUser.id, {
        ...profileForm,
        password: currentUser.password,
        role: currentUser.role
      })

      showToast('Perfil actualizado correctamente', 'success')
      loadUserProfile()
    } catch (err) {
      console.error('Error updating profile:', err)
      showToast('Error al actualizar el perfil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error')
      return
    }

    try {
      setSavingPassword(true)
      await userService.updateUser(currentUser.id, {
        ...profileForm,
        password: passwordForm.newPassword,
        role: currentUser.role
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      showToast('Contraseña actualizada correctamente', 'success')
    } catch (err) {
      console.error('Error updating password:', err)
      showToast('Error al actualizar la contraseña', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    window.location.href = '/sign-in'
  }

  const getInitials = (name?: string, surname?: string) => {
    const n = (name || '').charAt(0)
    const s = (surname || '').charAt(0)
    return `${n}${s}`.toUpperCase() || 'U'
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age > 0 ? age : null
  }

  // Datos para gráficos de admin/entrenador
  const chartData = {
    categories: ['Usuarios', 'Dietas', 'Entrenamientos'],
    series: [
      {
        name: 'Total',
        data: [stats.totalUsers, stats.totalDiets, stats.totalWorkouts]
      }
    ]
  }

  const roleChartData = {
    series: [stats.usersByRole.admin, stats.usersByRole.user],
    labels: ['Administradores', 'Usuarios']
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <LinearProgress sx={{ width: '100%', maxWidth: 300, borderRadius: 2 }} />
        <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
          Cargando tu perfil...
        </Typography>
      </Box>
    )
  }

  if (error || !currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error' sx={{ borderRadius: '12px' }}>
          {error || 'No se pudo cargar la información del usuario'}
        </Alert>
      </Box>
    )
  }

  const age = calculateAge(currentUser.birth_date)

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <ToastContainer />

      {/* Header Banner del Perfil */}
      <Card
        sx={{
          mb: 3,
          borderRadius: '20px',
          bgcolor: 'var(--bg-card, #18181b)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            height: { xs: 80, sm: 100 },
            background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.35) 0%, rgba(88, 86, 214, 0.2) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        />

        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, pt: 0, position: 'relative' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 3 }}
            alignItems={{ xs: 'center', sm: 'flex-end' }}
            sx={{ mt: { xs: -5, sm: -6 }, mb: 2 }}
          >
            <Avatar
              sx={{
                width: { xs: 88, sm: 100 },
                height: { xs: 88, sm: 100 },
                bgcolor: '#007AFF',
                color: '#ffffff',
                fontSize: { xs: '1.75rem', sm: '2.1rem' },
                fontWeight: 800,
                border: '4px solid #18181b',
                boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
              }}
            >
              {getInitials(currentUser.name, currentUser.surname)}
            </Avatar>

            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography
                variant='h5'
                fontWeight='800'
                sx={{ color: '#ffffff', letterSpacing: '-0.02em', mb: 0.3 }}
              >
                {currentUser.name} {currentUser.surname}
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 0.8, mb: 1.2 }}
              >
                <Mail size={14} />
                {currentUser.email}
              </Typography>

              <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                flexWrap='wrap'
                gap={0.5}
              >
                <Chip
                  label={
                    currentUser.role === 'admin'
                      ? 'Administrador'
                      : isTrainerOrAdmin
                      ? 'Entrenador'
                      : 'Cliente Activo'
                  }
                  size='small'
                  sx={{
                    fontWeight: 700,
                    bgcolor: isTrainerOrAdmin ? 'rgba(0, 122, 255, 0.15)' : 'rgba(52, 199, 89, 0.15)',
                    color: isTrainerOrAdmin ? '#007AFF' : '#34C759',
                    border: `1px solid ${isTrainerOrAdmin ? 'rgba(0, 122, 255, 0.3)' : 'rgba(52, 199, 89, 0.3)'}`
                  }}
                />

                {age && (
                  <Chip
                    icon={<Calendar size={13} style={{ marginLeft: 4 }} />}
                    label={`${age} años`}
                    size='small'
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                )}
              </Stack>
            </Box>

            <Box sx={{ mt: { xs: 2, sm: 0 } }}>
              <Button
                variant='outlined'
                color='error'
                size='small'
                startIcon={<LogOut size={16} />}
                onClick={handleLogout}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444'
                  }
                }}
              >
                Cerrar Sesión
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Box
        sx={{
          mb: 3,
          borderRadius: '16px',
          bgcolor: 'var(--bg-card, #18181b)',
          p: 0.8,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              display: 'none'
            },
            '& .MuiTab-root': {
              minHeight: 40,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              px: 2.5,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#ffffff',
                bgcolor: '#007AFF',
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
              }
            }
          }}
        >
          <Tab
            label='Datos Personales'
            icon={<UserIcon size={17} />}
            iconPosition='start'
          />
          {!isTrainerOrAdmin ? (
            <Tab
              label='Suscripción y Pagos'
              icon={<CreditCard size={17} />}
              iconPosition='start'
            />
          ) : (
            <Tab
              label='Estadísticas'
              icon={<BarChart3 size={17} />}
              iconPosition='start'
            />
          )}
          <Tab
            label='Seguridad'
            icon={<Lock size={17} />}
            iconPosition='start'
          />
        </Tabs>
      </Box>

      {/* Tab 0: Datos Personales */}
      {activeTab === 0 && (
        <Card
          sx={{
            borderRadius: '20px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            p: { xs: 2.5, sm: 3.5 }
          }}
        >
          <Box display='flex' alignItems='center' gap={1.2} mb={3}>
            <UserIcon size={22} color='#007AFF' />
            <Typography variant='h6' fontWeight='800' sx={{ color: '#ffffff' }}>
              Información de la Cuenta
            </Typography>
          </Box>

          <form onSubmit={handleProfileSubmit}>
            <Stack spacing={3}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5
                }}
              >
                <TextField
                  fullWidth
                  label='Nombre'
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  InputProps={{
                    sx: {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label='Apellido'
                  required
                  value={profileForm.surname}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, surname: e.target.value }))
                  }
                  InputProps={{
                    sx: {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  required
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  InputProps={{
                    sx: {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label='Fecha de Nacimiento'
                  type='date'
                  value={profileForm.birth_date}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, birth_date: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }
                  }}
                />
              </Box>

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 1 }} />

              <Box display='flex' justifyContent='flex-end'>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={saving}
                  startIcon={saving ? null : <Save size={18} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: '#007AFF',
                    px: 3.5,
                    py: 1.2
                  }}
                >
                  {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Card>
      )}

      {/* Tab 1: Suscripción y Pagos (Para Clientes) O Estadísticas (Para Entrenadores/Admins) */}
      {activeTab === 1 && !isTrainerOrAdmin && (
        <ClientSubscriptionTab currentUser={currentUser} />
      )}

      {activeTab === 1 && isTrainerOrAdmin && (
        <Stack spacing={3}>
          {/* Métricas KPI */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
              gap: 2.5
            }}
          >
            <Card
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor: 'var(--bg-card, #18181b)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center'
              }}
            >
              <Typography variant='h3' fontWeight='900' sx={{ color: '#007AFF' }}>
                {stats.totalUsers}
              </Typography>
              <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
                Total de Usuarios
              </Typography>
            </Card>

            <Card
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor: 'var(--bg-card, #18181b)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center'
              }}
            >
              <Typography variant='h3' fontWeight='900' sx={{ color: '#34C759' }}>
                {stats.totalDiets}
              </Typography>
              <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
                Planes Nutricionales
              </Typography>
            </Card>

            <Card
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor: 'var(--bg-card, #18181b)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center'
              }}
            >
              <Typography variant='h3' fontWeight='900' sx={{ color: '#FF9500' }}>
                {stats.totalWorkouts}
              </Typography>
              <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}>
                Rutinas de Entrenamiento
              </Typography>
            </Card>
          </Box>

          {/* Gráficos */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 2.5
            }}
          >
            <Card
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor: 'var(--bg-card, #18181b)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <Typography variant='subtitle1' fontWeight='800' sx={{ color: '#ffffff', mb: 2 }}>
                Distribución Global del Sistema
              </Typography>
              <Chart
                type='bar'
                series={chartData.series}
                options={{
                  chart: { height: 260, toolbar: { show: false } },
                  xaxis: { categories: chartData.categories },
                  colors: ['#007AFF'],
                  theme: { mode: 'dark' },
                  plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 6 } }
                }}
                height={260}
              />
            </Card>

            <Card
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor: 'var(--bg-card, #18181b)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <Typography variant='subtitle1' fontWeight='800' sx={{ color: '#ffffff', mb: 2 }}>
                Usuarios por Rol
              </Typography>
              <Chart
                type='donut'
                series={roleChartData.series}
                options={{
                  labels: roleChartData.labels,
                  colors: ['#007AFF', '#34C759'],
                  theme: { mode: 'dark' },
                  legend: { position: 'bottom' }
                }}
                height={260}
              />
            </Card>
          </Box>
        </Stack>
      )}

      {/* Tab 2: Seguridad y Contraseña */}
      {activeTab === 2 && (
        <Card
          sx={{
            borderRadius: '20px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            p: { xs: 2.5, sm: 3.5 }
          }}
        >
          <Box display='flex' alignItems='center' gap={1.2} mb={2}>
            <KeyRound size={22} color='#007AFF' />
            <Typography variant='h6' fontWeight='800' sx={{ color: '#ffffff' }}>
              Actualizar Contraseña
            </Typography>
          </Box>
          <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3 }}>
            Elige una contraseña robusta de al menos 6 caracteres para proteger tu cuenta.
          </Typography>

          <form onSubmit={handlePasswordSubmit}>
            <Stack spacing={2.5} sx={{ maxWidth: 500 }}>
              <TextField
                fullWidth
                type='password'
                label='Contraseña Actual'
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))
                }
                InputProps={{
                  sx: {
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    color: '#ffffff'
                  }
                }}
              />

              <TextField
                fullWidth
                type='password'
                label='Nueva Contraseña'
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value
                  }))
                }
                helperText='Mínimo 6 caracteres'
                InputProps={{
                  sx: {
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    color: '#ffffff'
                  }
                }}
              />

              <TextField
                fullWidth
                type='password'
                label='Confirmar Nueva Contraseña'
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))
                }
                InputProps={{
                  sx: {
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    color: '#ffffff'
                  }
                }}
              />

              <Box pt={1}>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={savingPassword}
                  startIcon={savingPassword ? null : <ShieldCheck size={18} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: '#007AFF',
                    px: 3.5,
                    py: 1.2
                  }}
                >
                  {savingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Card>
      )}
    </Box>
  )
}

export default ProfilePage
