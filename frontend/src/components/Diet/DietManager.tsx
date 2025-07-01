import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  InputAdornment,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { Diet } from '../../types/Diet';
import * as dietService from '../../services/dietService';
import { useToast } from '../../utils/notifications';
import { useExport } from '../../utils/hooks/useExport';
import { DietList } from './DietList';
import { DietForm } from './DietForm';

export const DietManager = () => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [filteredDiets, setFilteredDiets] = useState<Diet[]>([]);
  const [editingDiet, setEditingDiet] = useState<Diet | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { showToast, ToastContainer } = useToast();
  const { exportToCSV, exportToPDF, exportToExcel } = useExport();

  useEffect(() => {
    loadDiets();
  }, []);

  useEffect(() => {
    filterDiets();
  }, [diets, searchQuery]);

  const loadDiets = async () => {
    try {
      setLoading(true);
      const data = await dietService.getDiets();
      setDiets(data);
    } catch (error) {
      console.error('Error loading diets:', error);
      showToast('Error al cargar dietas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterDiets = () => {
    if (!searchQuery.trim()) {
      setFilteredDiets(diets);
    } else {
      const filtered = diets.filter(diet =>
        diet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diet.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDiets(filtered);
    }
  };

  const handleAdd = () => {
    setEditingDiet(null);
    setError(null);
    setOpen(true);
  };

  const handleEdit = (diet: Diet) => {
    setEditingDiet(diet);
    setError(null);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta dieta?')) {
      try {
        await dietService.deleteDiet(id);
        showToast('Dieta eliminada exitosamente', 'success');
        loadDiets();
      } catch (error) {
        console.error('Error deleting diet:', error);
        showToast('Error al eliminar dieta', 'error');
      }
    }
  };

  const handleSubmit = async (dietData: Omit<Diet, 'id'>) => {
    try {
      setError(null);
      if (editingDiet) {
        await dietService.updateDiet(editingDiet.id, dietData);
        showToast('Dieta actualizada exitosamente', 'success');
      } else {
        await dietService.createDiet(dietData);
        showToast('Dieta creada exitosamente', 'success');
      }
      setOpen(false);
      loadDiets();
    } catch (error) {
      console.error('Error saving diet:', error);
      setError('Error al guardar la dieta. Por favor, intenta de nuevo.');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const headers = ['ID', 'Nombre', 'Descripción', 'Calorías'];
    const data = filteredDiets.map(diet => [
      diet.id.toString(),
      diet.name,
      diet.description,
      diet.calories.toString()
    ]);

    const exportData = {
      headers,
      data,
      filename: 'dietas',
      title: 'Dietas'
    };

    switch (format) {
      case 'csv':
        exportToCSV(exportData);
        break;
      case 'pdf':
        exportToPDF(exportData);
        break;
      case 'excel':
        exportToExcel(exportData);
        break;
    }
    setExportMenuAnchor(null);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <ToastContainer />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Gestión de Dietas
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:download-fill" />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAdd}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Nueva Dieta
          </Button>
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar dietas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Diet List */}
      <DietList
        diets={filteredDiets}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Diet Form Dialog */}
      <DietForm
        open={open}
        diet={editingDiet}
        onClose={handleClose}
        onSubmit={handleSubmit}
        error={error}
      />

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('pdf')}>
          <Iconify icon="eva:file-text-fill" sx={{ mr: 2 }} />
          Exportar a PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          <Iconify icon="eva:file-fill" sx={{ mr: 2 }} />
          Exportar a Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <Iconify icon="eva:file-text-outline" sx={{ mr: 2 }} />
          Exportar a CSV
        </MenuItem>
      </Menu>
    </Box>
  );
};
