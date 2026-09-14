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

      {/* Hero Glass Banner Nutricional */}
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
              Gestión de Planes Nutricionales
            </Typography>
            <Typography variant='body1' sx={{ color: '#94a3b8', maxWidth: 650, lineHeight: 1.6 }}>
              Pauta dietas personalizadas, gestiona macronutrientes, alimentos por comidas y genera reportes editoriales en PDF.
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
                <Iconify icon="solar:chef-hat-bold-duotone" width={18} sx={{ color: '#22d3ee' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  {diets.length} Planes Activos
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
                <Iconify icon="solar:plate-bold" width={18} sx={{ color: '#10b981' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  {totalFoodsCount} Alimentos Asignados
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
              Nueva Dieta
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Buscador de Dietas Glass */}
      <Box sx={{ mb: 3.5, maxWidth: 420 }}>
        <TextField
          fullWidth
          placeholder='Buscar plan nutricional...'
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
