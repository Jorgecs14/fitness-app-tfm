// Componente principal de gestión de dietas con funcionalidades CRUD, gestión de alimentos y filtros
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
import { DietWithFoods } from '../../types/DietWithFoods'
import { User } from '../../types/User'
import * as dietService from '../../services/dietService'
import * as userService from '../../services/userService'
import { useToast } from '../../utils/notifications'
import { useExport } from '../../utils/hooks/useExport'
import { DietList } from './DietList'
import { DietForm } from './DietForm'
import { DietDetail } from './DietDetail'
import { DietFoodsManager } from './DietFoodsManager'
import { DietUsersDialog } from './DietUsersDialog'
import { calculateDietCalories, formatCalories } from '../../utils/dietUtils'

export const DietManager = () => {
  const [diets, setDiets] = useState<DietWithFoods[]>([])
  const [filteredDiets, setFilteredDiets] = useState<DietWithFoods[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [editingDiet, setEditingDiet] = useState<DietWithFoods | null>(null)
  const [viewingDiet, setViewingDiet] = useState<DietWithFoods | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [openFoodsManager, setOpenFoodsManager] = useState(false)
  const [selectedDiet, setSelectedDiet] = useState<DietWithFoods | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [usersDialogOpen, setUsersDialogOpen] = useState(false)
  const [selectedDietForUsers, setSelectedDietForUsers] =
    useState<DietWithFoods | null>(null)

  const { showToast, ToastContainer } = useToast()
  const { exportToCSV, exportToPDF, exportToExcel } = useExport()

  useEffect(() => {
    loadDiets()
    loadUsers()
  }, [])

  useEffect(() => {
    filterDiets()
  }, [diets, searchQuery])

  const loadDiets = async () => {
    try {
      setLoading(true)
      const data = await dietService.getDietsWithFoods()
      setDiets(data)
    } catch (error: any) {
      showToast(`Error al cargar dietas: ${error.message}`, 'error')
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

  const filterDiets = () => {
    if (!searchQuery.trim()) {
      setFilteredDiets(diets)
    } else {
      const filtered = diets.filter(
        (diet) =>
          diet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          diet.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDiets(filtered)
    }
  }

  const handleAdd = () => {
    setEditingDiet(null)
    setError(null)
    setFormOpen(true)
  }

  const handleEdit = (diet: DietWithFoods) => {
    setEditingDiet(diet)
    setError(null)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta dieta?')) {
      try {
        await dietService.deleteDiet(id)
        showToast('Dieta eliminada exitosamente', 'success')
        loadDiets()
      } catch (error) {
        showToast('Error al eliminar dieta', 'error')
      }
    }
  }

  const handleViewDetails = (diet: DietWithFoods) => {
    setViewingDiet(diet)
    setDetailOpen(true)
  }

  const handleManageFoods = (diet: DietWithFoods) => {
    setSelectedDiet(diet)
    setOpenFoodsManager(true)
  }
  const handleCloseFoodsManager = () => {
    setOpenFoodsManager(false)
    setSelectedDiet(null)
  }

  const handleManageUsers = (diet: DietWithFoods) => {
    setSelectedDietForUsers(diet)
    setUsersDialogOpen(true)
  }

  const handleCloseUsersDialog = () => {
    setUsersDialogOpen(false)
    setSelectedDietForUsers(null)
  }

  const handleSubmit = async (dietData: any) => {
    try {
      setError(null)
      if (editingDiet) {
        await dietService.updateDiet(editingDiet.id, dietData)
        showToast('Dieta actualizada exitosamente', 'success')
      } else {
        await dietService.createDiet(dietData)
        showToast('Dieta creada exitosamente', 'success')
      }
      setFormOpen(false)
      loadDiets()
    } catch (error) {
      setError('Error al guardar la dieta. Por favor, intenta de nuevo.')
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setError(null)
  }

  const handleDetailClose = () => {
    setDetailOpen(false)
    setViewingDiet(null)
  }

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const headers = [
      'ID',
      'Nombre',
      'Descripción',
      'Calorías Calculadas',
      'Alimentos'
    ]
    const data = filteredDiets.map((diet) => [
      diet.id.toString(),
      diet.name,
      diet.description || 'Sin descripción',
      formatCalories(calculateDietCalories(diet)),
      diet.diet_foods?.length?.toString() ||
        diet.foods?.length?.toString() ||
        '0'
    ])

    const exportData = {
      headers,
      data,
      filename: 'dietas',
      title: 'Dietas'
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

  const totalFoodsCount = diets.reduce(
    (acc, d) => acc + (d.diet_foods?.length ?? d.foods?.length ?? 0),
    0
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <ToastContainer />

      {error && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: '16px' }}>
          {error}
        </Alert>
      )}

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
              Gestión de Planes Nutricionales
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(235, 235, 245, 0.6)', maxWidth: 620, lineHeight: 1.5 }}>
              Pauta dietas personalizadas, gestiona macronutrientes, alimentos por comidas y asigna planes a tus alumnos.
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
                <Iconify icon="solar:chef-hat-bold-duotone" width={16} sx={{ color: '#007AFF' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  {diets.length} Planes Activos
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
                <Iconify icon="solar:plate-bold" width={16} sx={{ color: '#34C759' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  {totalFoodsCount} Alimentos Asignados
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
                bgcolor: '#34C759',
                color: '#000000',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(52, 199, 89, 0.3)',
                '&:hover': {
                  bgcolor: '#2eb34f',
                },
              }}
            >
              Nueva Dieta
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Buscador de Dietas Inset Dark */}
      <Box sx={{ mb: 3, maxWidth: 420 }}>
        <TextField
          fullWidth
          placeholder="Buscar plan nutricional..."
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
              '&:hover fieldset': { borderColor: 'rgba(52, 199, 89, 0.4)' },
              '&.Mui-focused fieldset': { borderColor: '#34C759' },
            },
          }}
        />
      </Box>

      {/* Diet List */}
      <DietList
        diets={filteredDiets}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onManageFoods={handleManageFoods}
        onManageUsers={handleManageUsers}
        loading={loading}
      />

      {/* Diet Form Dialog */}
      <DietForm
        open={formOpen}
        dietToEdit={editingDiet}
        users={users}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
      />

      {/* Diet Detail Dialog */}
      {viewingDiet && (
        <DietDetail
          open={detailOpen}
          diet={viewingDiet}
          onClose={handleDetailClose}
        />
      )}

      {/* Foods Manager Dialog */}
      {selectedDiet && (
        <DietFoodsManager
          open={openFoodsManager}
          diet={selectedDiet}
          onClose={handleCloseFoodsManager}
          onSave={async () => {
            setOpenFoodsManager(false)
            loadDiets()
          }}
        />
      )}

      {/* Users Dialog */}
      {selectedDietForUsers && (
        <DietUsersDialog
          open={usersDialogOpen}
          diet={selectedDietForUsers}
          onClose={handleCloseUsersDialog}
          onUpdate={loadDiets}
        />
      )}

      {/* Export Menu */}
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
