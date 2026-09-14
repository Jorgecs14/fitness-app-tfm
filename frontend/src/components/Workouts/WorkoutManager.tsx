// Componente principal de gestión de entrenamientos con funcionalidades CRUD, gestión de ejercicios y filtros
import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  InputAdornment,
  TextField,
  Menu,
  MenuItem
} from '@mui/material'
import { Iconify } from '../../utils/iconify'
import { WorkoutWithExercises } from '../../types/WorkoutWithExercises'
import { WorkoutExerciseDetail } from '../../types/WorkoutExercise'
import { User } from '../../types/User'
import * as workoutService from '../../services/workoutService'
import * as userService from '../../services/userService'
import { useToast } from '../../utils/notifications'
import { useExport } from '../../utils/hooks/useExport'
import { WorkoutList } from './WorkoutList'
import { WorkoutForm } from './WorkoutForm'
import { WorkoutDetail } from './WorkoutDetail'
import { WorkoutExercisesManager } from './workout-exercises-manager'
import { WorkoutUserDialog } from './WorkoutUserDialog'

import { LiveWorkoutDialog } from './LiveWorkoutDialog'
import { QrShareModal } from './QrShareModal'

export const WorkoutManager = () => {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<
    WorkoutWithExercises[]
  >([])
  const [users, setUsers] = useState<User[]>([])
  const [editingWorkout, setEditingWorkout] =
    useState<WorkoutWithExercises | null>(null)
  const [viewingWorkout, setViewingWorkout] =
    useState<WorkoutWithExercises | null>(null)
  const [exerciseManagerWorkout, setExerciseManagerWorkout] =
    useState<WorkoutWithExercises | null>(null)
  const [userManagerWorkout, setUserManagerWorkout] =
    useState<WorkoutWithExercises | null>(null)
  const [liveWorkout, setLiveWorkout] = useState<WorkoutWithExercises | null>(null)
  const [liveWorkoutOpen, setLiveWorkoutOpen] = useState(false)
  const [qrWorkout, setQrWorkout] = useState<WorkoutWithExercises | null>(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [exerciseManagerOpen, setExerciseManagerOpen] = useState(false)
  const [userManagerOpen, setUserManagerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { showToast, ToastContainer } = useToast()
  const { exportToCSV, exportToPDF, exportToExcel } = useExport()

  useEffect(() => {
    loadWorkouts()
    loadUsers()
  }, [])

  useEffect(() => {
    filterWorkouts()
  }, [workouts, searchQuery, selectedCategory])

  const loadWorkouts = async () => {
    try {
      setLoading(true)
      const data = await workoutService.getWorkoutsWithExercises()
      setWorkouts(data)
    } catch (error) {
      showToast('Error al cargar entrenamientos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } catch (error) {
      showToast('Error al cargar usuarios', 'error')
    }
  }

  const filterWorkouts = () => {
    let list = [...workouts]

    if (selectedCategory !== 'all') {
      list = list.filter(w => {
        const cat = (w.category || '').toLowerCase()
        if (selectedCategory === 'hipertrofia') return cat.includes('hiper') || cat.includes('hyper')
        if (selectedCategory === 'fuerza') return cat.includes('fuerza') || cat.includes('strength')
        if (selectedCategory === 'resistencia') return cat.includes('resistencia') || cat.includes('endurance')
        if (selectedCategory === 'cardio') return cat.includes('cardio')
        if (selectedCategory === 'movilidad') return cat.includes('movil') || cat.includes('flex')
        return cat.includes(selectedCategory.toLowerCase())
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (workout) =>
          workout.name.toLowerCase().includes(q) ||
          workout.category.toLowerCase().includes(q) ||
          (workout.notes && workout.notes.toLowerCase().includes(q))
      )
    }

    setFilteredWorkouts(list)
  }

  const handleAdd = () => {
    setEditingWorkout(null)
    setError(null)
    setFormOpen(true)
  }

  const handleEdit = (workout: WorkoutWithExercises) => {
    setEditingWorkout(workout)
    setError(null)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar este entrenamiento?'
      )
    ) {
      try {
        await workoutService.deleteWorkout(id)
        showToast('Entrenamiento eliminado exitosamente', 'success')
        loadWorkouts()
      } catch (error) {
        showToast('Error al eliminar entrenamiento', 'error')
      }
    }
  }

  const handleViewDetails = (workout: WorkoutWithExercises) => {
    setViewingWorkout(workout)
    setDetailOpen(true)
  }

  const handleManageExercises = (workout: WorkoutWithExercises) => {
    setExerciseManagerWorkout(workout)
    setExerciseManagerOpen(true)
  }

  const handleManageUser = (workout: WorkoutWithExercises) => {
    setUserManagerWorkout(workout)
    setUserManagerOpen(true)
  }

  const handleStartLiveWorkout = (workout: WorkoutWithExercises) => {
    setLiveWorkout(workout)
    setLiveWorkoutOpen(true)
  }

  const handleShareQr = (workout: WorkoutWithExercises) => {
    setQrWorkout(workout)
    setQrOpen(true)
  }

  const handleSubmit = async (workoutData: any) => {
    try {
      setError(null)
      if (editingWorkout) {
        await workoutService.updateWorkout(editingWorkout.id, workoutData)
        showToast('Entrenamiento actualizado exitosamente', 'success')
      } else {
        await workoutService.createWorkout(workoutData)
        showToast('Entrenamiento creado exitosamente', 'success')
      }
      setFormOpen(false)
      loadWorkouts()
    } catch (error) {
      setError(
        'Error al guardar el entrenamiento. Por favor, intenta de nuevo.'
      )
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setError(null)
  }

  const handleDetailClose = () => {
    setDetailOpen(false)
    setViewingWorkout(null)
  }

  const handleExerciseManagerClose = () => {
    setExerciseManagerOpen(false)
    setExerciseManagerWorkout(null)
  }

  const handleUserManagerClose = () => {
    setUserManagerOpen(false)
    setUserManagerWorkout(null)
  }

  const handleSaveExercises = async (exercises: WorkoutExerciseDetail[]) => {
    if (!exerciseManagerWorkout) return

    try {
      await workoutService.removeAllExercisesFromWorkout(
        exerciseManagerWorkout.id
      )

      if (exercises.length > 0) {
        const selectedExercises = exercises.map((ex) => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps
        }))

        await workoutService.addExercisesToWorkout(
          exerciseManagerWorkout.id,
          selectedExercises
        )
      }

      showToast('Ejercicios actualizados exitosamente', 'success')
      setExerciseManagerOpen(false)
      loadWorkouts()
    } catch (error) {
      showToast('Error al guardar ejercicios', 'error')
    }
  }

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const headers = ['ID', 'Nombre', 'Categoría', 'Usuario', 'Ejercicios']
    const data = filteredWorkouts.map((workout) => [
      workout.id.toString(),
      workout.name,
      workout.category,
      'N/A',
      workout.exercises?.length.toString() || '0'
    ])

    const exportData = {
      headers,
      data,
      filename: 'entrenamientos',
      title: 'Entrenamientos'
    }

    switch (format) {
      case 'csv':
        exportToCSV(exportData)
        break
      case 'pdf':
        exportToPDF(exportData)
        break
      case 'excel':
        exportToExcel(exportData)
        break
    }
    setExportMenuAnchor(null)
  }

  // Cálculos rápidos de estadísticas para el banner
  const totalExercisesCount = workouts.reduce(
    (acc, w) => acc + (w.workout_exercises?.length || w.exercises?.length || 0),
    0
  )

  const categoriesList = [
    { id: 'all', label: 'Todas las Rutinas' },
    { id: 'hipertrofia', label: 'Hipertrofia' },
    { id: 'fuerza', label: 'Fuerza' },
    { id: 'resistencia', label: 'Resistencia' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'movilidad', label: 'Movilidad' },
  ]

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <ToastContainer />

      {error && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: '16px' }}>
          {error}
        </Alert>
      )}

      {/* Hero Glass Banner con Métricas y Botones de Acción */}
      <Box className="liquid-hero-banner" sx={{ p: { xs: 3, sm: 4 }, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant='h3'
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#f8fafc',
                mb: 1,
              }}
            >
              Catálogo de Entrenamientos
            </Typography>
            <Typography variant='body1' sx={{ color: '#94a3b8', maxWidth: 650, lineHeight: 1.6 }}>
              Diseña, personaliza y ejecuta rutinas de entrenamiento optimizadas con seguimiento biométrico y biblioteca de 1.320 ejercicios.
            </Typography>

            {/* Micro-Badges de Métricas */}
            <Stack direction="row" spacing={2} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  borderRadius: '9999px',
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <Iconify icon="solar:folder-with-files-bold" width={18} sx={{ color: '#22d3ee' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  {workouts.length} Rutinas Totales
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  borderRadius: '9999px',
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <Iconify icon="solar:dumbbell-bold" width={18} sx={{ color: '#10b981' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  {totalExercisesCount} Ejercicios Asignados
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction={{ xs: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant='outlined'
              startIcon={<Iconify icon='eva:download-fill' />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              sx={{
                borderRadius: '9999px',
                px: 2.5,
                py: 1,
                fontWeight: 600,
                borderColor: 'rgba(255, 255, 255, 0.18)',
                color: '#f8fafc',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: '#22d3ee',
                  bgcolor: 'rgba(6, 182, 212, 0.15)',
                  color: '#22d3ee',
                },
              }}
            >
              Exportar
            </Button>
            <Button
              variant='contained'
              startIcon={<Iconify icon='mingcute:add-line' />}
              onClick={handleAdd}
              sx={{
                borderRadius: '9999px',
                px: 3,
                py: 1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                color: '#ffffff',
                boxShadow: '0 6px 20px rgba(6, 182, 212, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.55)',
                },
              }}
            >
              Nueva Rutina
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Barra de Filtros: Cápsula de Categorías y Buscador Glass */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', lg: 'center' },
          gap: 2,
          mb: 3.5,
        }}
      >
        {/* Selector de Categorías en Cápsula Deslizante */}
        <Box
          sx={{
            overflowX: 'auto',
            pb: { xs: 1, lg: 0 },
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Box className="liquid-segment-bar">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`liquid-segment-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </Box>
        </Box>

        {/* Buscador de Rutinas Glass */}
        <TextField
          placeholder='Buscar por nombre o nota...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Iconify icon='eva:search-fill' sx={{ color: '#64748b' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '9999px',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(16px)',
              '& fieldset': { borderColor: 'rgba(226, 232, 240, 0.8)' },
              '&:hover fieldset': { borderColor: '#0284c7' },
              '&.Mui-focused fieldset': { borderColor: '#0284c7' },
            },
          }}
        />
      </Box>

      {/* Listado de Rutinas */}
      <WorkoutList
        workouts={filteredWorkouts}
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onManageExercises={handleManageExercises}
        onManageUser={handleManageUser}
        onStartLiveWorkout={handleStartLiveWorkout}
        onShareQr={handleShareQr}
        loading={loading}
      />

      <WorkoutForm
        open={formOpen}
        workoutToEdit={editingWorkout}
        users={users}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
      />

      {viewingWorkout && (
        <WorkoutDetail
          open={detailOpen}
          workoutId={viewingWorkout.id}
          onClose={handleDetailClose}
        />
      )}

      {exerciseManagerWorkout && (
        <WorkoutExercisesManager
          open={exerciseManagerOpen}
          workoutName={exerciseManagerWorkout.name}
          exercises={
            exerciseManagerWorkout.exercises ||
            (exerciseManagerWorkout.workout_exercises
              ? exerciseManagerWorkout.workout_exercises.map((we) => ({
                  link_id: we.id,
                  exercise_id: we.exercises.id,
                  sets: we.sets,
                  reps: we.reps,
                  name: we.exercises.name,
                  description: we.exercises.description,
                  execution_time: we.exercises.execution_time
                }))
              : [])
          }
          onClose={handleExerciseManagerClose}
          onSave={handleSaveExercises}
        />
      )}

      <WorkoutUserDialog
        open={userManagerOpen}
        workout={userManagerWorkout}
        onClose={handleUserManagerClose}
        onUpdate={loadWorkouts}
      />

      {liveWorkout && (
        <LiveWorkoutDialog
          open={liveWorkoutOpen}
          workout={liveWorkout}
          userId={liveWorkout.user_id || 1}
          onClose={() => setLiveWorkoutOpen(false)}
          onSessionSuccess={() => {
            showToast('¡Sesión guardada en el historial con éxito!', 'success')
          }}
        />
      )}

      <QrShareModal
        open={qrOpen}
        workout={qrWorkout}
        onClose={() => setQrOpen(false)}
      />

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('pdf')}>
          <Iconify icon='eva:file-text-fill' sx={{ mr: 2 }} />
          Exportar a PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          <Iconify icon='eva:file-fill' sx={{ mr: 2 }} />
          Exportar a Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <Iconify icon='eva:file-text-outline' sx={{ mr: 2 }} />
          Exportar a CSV
        </MenuItem>
      </Menu>
    </Box>
  )
}

