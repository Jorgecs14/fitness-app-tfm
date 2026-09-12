import { useState } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TableContainer,
  Box,
  Chip,
  IconButton,
  TablePagination,
  Grid,
  Stack,
  Tooltip,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { DietWithFoods } from '../../types/DietWithFoods';
import { DietCard } from './DietCard';
import { calculateDietCalories, formatCalories } from '../../utils/dietUtils';

interface DietListProps {
  diets: DietWithFoods[];
  onEdit: (diet: DietWithFoods) => void;
  onDelete: (id: number) => void;
  onViewDetails: (diet: DietWithFoods) => void;
  onManageFoods: (diet: DietWithFoods) => void;
  onManageUsers: (diet: DietWithFoods) => void;
  loading?: boolean;
}

export const DietList = ({
  diets,
  onEdit,
  onDelete,
  onViewDetails,
  onManageFoods,
  onManageUsers,
  loading,
}: DietListProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Cargando planes nutricionales...</Typography>
      </Box>
    );
  }

  if (diets.length === 0) {
    return (
      <Box
        className="liquid-glass-card"
        sx={{
          textAlign: 'center',
          py: 8,
          px: 3,
          maxWidth: 500,
          mx: 'auto',
          my: 4,
        }}
      >
        <Iconify icon="solar:chef-hat-heart-bold" width={54} height={54} sx={{ color: '#94a3b8', mb: 2 }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1 }}>
          No hay dietas registradas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crea un nuevo plan nutricional o utiliza las plantillas automáticas para tus alumnos.
        </Typography>
      </Box>
    );
  }

  const paginatedDiets = diets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Selector de Modo de Visualización (Grid vs Tabla) */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2.5 }}>
        <Box
          sx={{
            display: 'inline-flex',
            bgcolor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '9999px',
            p: 0.5,
          }}
        >
          <Tooltip title="Vista en Cuadrícula">
            <IconButton
              size="small"
              onClick={() => setDisplayMode('grid')}
              sx={{
                bgcolor: displayMode === 'grid' ? '#0f172a' : 'transparent',
                color: displayMode === 'grid' ? '#ffffff' : '#64748b',
                '&:hover': {
                  bgcolor: displayMode === 'grid' ? '#0f172a' : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              <Iconify icon="solar:widget-2-bold" width={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Vista en Tabla">
            <IconButton
              size="small"
              onClick={() => setDisplayMode('table')}
              sx={{
                bgcolor: displayMode === 'table' ? '#0f172a' : 'transparent',
                color: displayMode === 'table' ? '#ffffff' : '#64748b',
                '&:hover': {
                  bgcolor: displayMode === 'table' ? '#0f172a' : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              <Iconify icon="solar:list-bold" width={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Renderizado Condicional: Cuadrícula Liquid Glass o Tabla */}
      {displayMode === 'grid' ? (
        <Grid container spacing={3}>
          {paginatedDiets.map((diet) => (
            <Grid key={diet.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <DietCard
                diet={diet}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
                onManageFoods={onManageFoods}
                onManageUsers={onManageUsers}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card className="liquid-glass-card" sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(241, 245, 249, 0.6)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Calorías</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Alimentos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDiets.map((diet) => (
                  <TableRow key={diet.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.6)' } }}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a' }}>
                        {diet.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                        {diet.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<Iconify icon="solar:fire-bold" width={14} sx={{ color: '#f59e0b !important' }} />}
                        label={formatCalories(calculateDietCalories(diet))}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          borderRadius: '9999px',
                          bgcolor: 'rgba(245, 158, 11, 0.1)',
                          color: '#d97706',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<Iconify icon="solar:apple-bold" width={14} />}
                        label={diet.diet_foods?.length ?? diet.foods?.length ?? 0}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: '9999px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" onClick={() => onViewDetails(diet)} sx={{ color: '#0284c7' }}>
                            <Iconify icon="solar:eye-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Gestionar alimentos">
                          <IconButton size="small" onClick={() => onManageFoods(diet)} sx={{ color: '#10b981' }}>
                            <Iconify icon="solar:plate-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Gestionar usuarios">
                          <IconButton size="small" onClick={() => onManageUsers(diet)} sx={{ color: '#8b5cf6' }}>
                            <Iconify icon="solar:users-group-rounded-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => onEdit(diet)} sx={{ color: '#475569' }}>
                            <Iconify icon="solar:pen-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => onDelete(diet.id)} sx={{ color: '#ef4444' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Paginación Liquid Glass */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <TablePagination
          component="div"
          count={diets.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[6, 9, 18, 36]}
          labelRowsPerPage="Por página:"
          sx={{
            bgcolor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        />
      </Box>
    </Box>
  );
};

