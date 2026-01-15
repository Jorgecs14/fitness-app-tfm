// Componente de detalle de usuario con información completa, dietas y entrenamientos asociados
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Stack,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import { User } from '../../types/User'
import { Diet } from '../../types/Diet'
import { Workout } from '../../types/Workout'
import { ClientMedicalInfo } from '../../types/ClientMedicalInfo'
import { ClientProgressPhoto } from '../../types/ClientProgressPhoto'
import { WeeklyTracking } from '../../types/WeeklyTracking'
import * as userService from '../../services/userService'
import * as dietService from '../../services/dietService'
import * as workoutService from '../../services/workoutService'
import { clientMedicalInfoService } from '../../services/clientMedicalInfoService'
import { clientProgressPhotoService } from '../../services/clientProgressPhotoService'
import { weeklyTrackingService } from '../../services/weeklyTrackingService'
import { Iconify } from '../../utils/iconify'

export const UserDetailManager = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [userDiets, setUserDiets] = useState<Diet[]>([])
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([])
  const [medicalInfo, setMedicalInfo] = useState<ClientMedicalInfo | null>(null)
  const [progressPhotos, setProgressPhotos] = useState<ClientProgressPhoto[]>([])
  const [weeklyTracking, setWeeklyTracking] = useState<WeeklyTracking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [id])

  const loadUserData = async () => {
    if (!id) return

    try {
      setLoading(true)

      const userData = await userService.getUser(parseInt(id))
      setUser(userData)

      // Cargar dietas
      const allDiets = await dietService.getDiets()
      const dietsWithUsers = await Promise.all(
        allDiets.map(async (diet) => {
          const users = await dietService.getDietUsers(diet.id)
          return {
            diet,
            hasUser: users.some((u: any) => u.id === parseInt(id))
          }
        })
      )
      setUserDiets(dietsWithUsers.filter((d) => d.hasUser).map((d) => d.diet))

      // Cargar entrenamientos
      const allWorkouts = await workoutService.getWorkouts()
      const userWorkoutsList = allWorkouts.filter(
        (w) => w.user_id === parseInt(id)
      )
      setUserWorkouts(userWorkoutsList)

      // Cargar datos CRM solo si es un cliente
      if (userData.role === 'client') {
        try {
          // Información médica
          const medicalData = await clientMedicalInfoService.getByUserId(parseInt(id))
          setMedicalInfo(medicalData)
        } catch (error) {
          console.log('No medical info found for user', error)
        }

        try {
          // Fotos de progreso
          const photosData = await clientProgressPhotoService.getByUserId(parseInt(id))
          setProgressPhotos(photosData)
        } catch (error) {
          console.log('No progress photos found for user', error)
        }

        try {
          // Seguimiento semanal
          const trackingData = await weeklyTrackingService.getByUserId(parseInt(id))
          setWeeklyTracking(trackingData)
        } catch (error) {
          console.log('No weekly tracking found for user', error)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Typography>Cargando...</Typography>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container>
        <Typography>Usuario no encontrado</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg'>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<Iconify icon='eva:arrow-back-fill' />}
          onClick={() => navigate('/dashboard/users')}
          sx={{ mb: 2 }}
        >
          Volver
        </Button>

        <Typography variant='h4' gutterBottom>
          Detalle del Usuario
        </Typography>
      </Box>

      {/* User Info Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant='h5' gutterBottom>
              {user.name}
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon='eva:email-outline' />
                <Typography>{user.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon='eva:shield-outline' />
                <Chip
                  label={user.role}
                  color={user.role === 'admin' ? 'error' : 'primary'}
                  size='small'
                />
              </Box>
            </Stack>
          </Box>
          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant='body2' color='text.secondary'>
              ID: {user.id}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Overview */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          mb: 3
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography color='text.secondary' variant='body2'>
                    Dietas Asignadas
                  </Typography>
                  <Typography variant='h3'>{userDiets.length}</Typography>
                </Box>
                <Iconify
                  icon='solar:dish-bold'
                  width={48}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography color='text.secondary' variant='body2'>
                    Rutinas Asignadas
                  </Typography>
                  <Typography variant='h3'>{userWorkouts.length}</Typography>
                </Box>
                <Iconify
                  icon='solar:running-round-bold'
                  width={48}
                  sx={{ color: 'success.main' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {user?.role === 'client' && (
          <>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box>
                      <Typography color='text.secondary' variant='body2'>
                        Fotos de Progreso
                      </Typography>
                      <Typography variant='h3'>{progressPhotos.length}</Typography>
                    </Box>
                    <Iconify
                      icon='solar:camera-bold'
                      width={48}
                      sx={{ color: 'warning.main' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box>
                      <Typography color='text.secondary' variant='body2'>
                        Seguimientos Semanales
                      </Typography>
                      <Typography variant='h3'>{weeklyTracking.length}</Typography>
                    </Box>
                    <Iconify
                      icon='solar:chart-2-bold'
                      width={48}
                      sx={{ color: 'info.main' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </>
        )}
      </Box>

      {/* Medical Information Section - Solo para clientes */}
      {user?.role === 'client' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6'>
              Información Médica
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="solar:medical-kit-bold" />}
              onClick={() => navigate(`/dashboard/users/${id}/medical-info`)}
            >
              Gestionar
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {medicalInfo ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 2
              }}
            >
              {medicalInfo.allergies && (
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
                      <Iconify icon="solar:danger-bold" sx={{ mr: 1, color: 'error.main' }} />
                      Alergias
                    </Typography>
                    <Typography variant='body2'>{medicalInfo.allergies}</Typography>
                  </CardContent>
                </Card>
              )}

              {medicalInfo.food_intolerances && (
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
                      <Iconify icon="solar:forbidden-bold" sx={{ mr: 1, color: 'warning.main' }} />
                      Intolerancias Alimentarias
                    </Typography>
                    <Typography variant='body2'>{medicalInfo.food_intolerances}</Typography>
                  </CardContent>
                </Card>
              )}

              {medicalInfo.injuries_conditions && (
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
                      <Iconify icon="solar:health-bold" sx={{ mr: 1, color: 'info.main' }} />
                      Lesiones/Condiciones
                    </Typography>
                    <Typography variant='body2'>{medicalInfo.injuries_conditions}</Typography>
                  </CardContent>
                </Card>
              )}

              {medicalInfo.disliked_foods && (
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
                      <Iconify icon="solar:dislike-bold" sx={{ mr: 1, color: 'text.secondary' }} />
                      Alimentos No Preferidos
                    </Typography>
                    <Typography variant='body2'>{medicalInfo.disliked_foods}</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          ) : (
            <Typography color='text.secondary'>
              No hay información médica registrada para este cliente
            </Typography>
          )}
        </Paper>
      )}

      {/* Progress Tracking Section - Solo para clientes */}
      {user?.role === 'client' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Progreso Reciente
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {weeklyTracking.length > 0 ? (
            <Box>
              {weeklyTracking.slice(0, 3).map((tracking) => (
                <Card variant='outlined' key={tracking.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant='subtitle1' fontWeight='bold'>
                        Semana del {new Date(tracking.week_start_date).toLocaleDateString('es-ES')}
                      </Typography>
                      <Chip 
                        label={`${tracking.training_days_completed || 0} días entrenados`}
                        color={(tracking.training_days_completed || 0) >= 5 ? 'success' : (tracking.training_days_completed || 0) >= 3 ? 'warning' : 'error'}
                        size="small"
                      />
                    </Box>
                    
                    <Box 
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
                        gap: 2,
                        mt: 2 
                      }}
                    >
                      <Box>
                        <Typography variant='body2' color='text.secondary'>Peso</Typography>
                        <Typography variant='body1' fontWeight='medium'>{tracking.weight || 'N/A'} kg</Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>Calidad del Sueño</Typography>
                        <Typography variant='body1' fontWeight='medium'>
                          {tracking.sleep_quality === 'good' ? 'Bueno' : 
                           tracking.sleep_quality === 'regular' ? 'Regular' : 
                           tracking.sleep_quality === 'bad' ? 'Malo' : 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>Días Entrenados</Typography>
                        <Typography variant='body1' fontWeight='medium'>{tracking.training_days_completed || 0}/7</Typography>
                      </Box>
                    </Box>

                    {tracking.diet_difficulties && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Dificultades dietéticas: {tracking.diet_difficulties}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}

              {weeklyTracking.length > 3 && (
                <Button variant="text" fullWidth sx={{ mt: 1 }}>
                  Ver todos los seguimientos ({weeklyTracking.length})
                </Button>
              )}
            </Box>
          ) : (
            <Typography color='text.secondary'>
              No hay seguimiento de progreso registrado para este cliente
            </Typography>
          )}
        </Paper>
      )}

      {/* Diets Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Dietas Asignadas
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {userDiets.length === 0 ? (
          <Typography color='text.secondary'>
            No hay dietas asignadas a este usuario
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2
            }}
          >
            {userDiets.map((diet) => (
              <Card variant='outlined' key={diet.id}>
                <CardContent>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {diet.name}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    {diet.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon='solar:fire-bold' />
                    <Typography variant='body2'>
                      {diet.calories} calorías
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Workouts Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom>
          Rutinas Asignadas
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {userWorkouts.length === 0 ? (
          <Typography color='text.secondary'>
            No hay rutinas asignadas a este usuario
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2
            }}
          >
            {userWorkouts.map((workout) => (
              <Card variant='outlined' key={workout.id}>
                <CardContent>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {workout.name}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    {workout.notes || 'Sin descripción'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={workout.category}
                      size='small'
                      color='primary'
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  )
}
