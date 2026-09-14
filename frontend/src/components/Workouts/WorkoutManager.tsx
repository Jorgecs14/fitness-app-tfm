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
      {/* Hero Banner Apple Liquid Glass */}
      <Box className="apple-card" sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3.5 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2.5,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.6rem', sm: '2.1rem' },
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                mb: 0.75,
              }}
            >
              Catálogo de Entrenamientos
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', maxWidth: 620, lineHeight: 1.5 }}>
              Diseña, personaliza y ejecuta rutinas de entrenamiento optimizadas con seguimiento de series y biblioteca de ejercicios.
            </Typography>

            {/* Micro-Badges de Métricas */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.75,
                  py: 0.5,
                  borderRadius: '9999px',
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Iconify icon="solar:folder-with-files-bold" width={16} sx={{ color: '#007AFF' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  {workouts.length} Rutinas Totales
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.75,
                  py: 0.5,
                  borderRadius: '9999px',
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Iconify icon="solar:dumbbell-bold" width={16} sx={{ color: '#34C759' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  {totalExercisesCount} Ejercicios Asignados
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:download-fill" />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              sx={{
                flex: { xs: 1, sm: 'initial' },
                borderRadius: '12px',
                px: 2,
                py: 1,
                fontWeight: 600,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#007AFF',
                  bgcolor: 'rgba(0, 122, 255, 0.12)',
                },
              }}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAdd}
              sx={{
                flex: { xs: 2, sm: 'initial' },
                borderRadius: '12px',
                px: 2.5,
                py: 1,
                fontWeight: 700,
                bgcolor: '#007AFF',
                color: '#ffffff',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
                '&:hover': {
                  bgcolor: '#0062cc',
                },
              }}
            >
              Nueva Rutina
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Barra de Filtros: Categorías y Buscador Apple */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Selector de Categorías */}
        <Box
          sx={{
            overflowX: 'auto',
            pb: { xs: 1, md: 0 },
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Box className="apple-tab-bar" sx={{ position: 'static', borderRadius: '14px', p: '4px', display: 'inline-flex', width: 'auto' }}>
            {categoriesList.map((cat) => (
              <Box
                key={cat.id}
                component="button"
                onClick={() => setSelectedCategory(cat.id)}
                sx={{
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  px: 2,
                  py: 0.75,
                  borderRadius: '10px',
                  bgcolor: selectedCategory === cat.id ? '#007AFF' : 'transparent',
                  color: selectedCategory === cat.id ? '#ffffff' : 'rgba(235, 235, 245, 0.6)',
                  fontWeight: selectedCategory === cat.id ? 700 : 500,
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Buscador de Rutinas Inset Dark */}
        <TextField
          placeholder="Buscar rutina por nombre o nota..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'rgba(235, 235, 245, 0.5)' }} />
              </InputAdornment>
            ),
            sx: {
              color: '#ffffff',
              bgcolor: '#1C1C1E',
              borderRadius: '12px',
              fontSize: '16px', // Previene auto-zoom en Safari iOS
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(0, 122, 255, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#007AFF' },
            },
          }}
          sx={{ minWidth: { xs: '100%', sm: 300 } }}
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

