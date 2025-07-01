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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { Diet } from '../../types/Diet';
import { DietCard } from './DietCard';

interface DietListProps {
  diets: Diet[];
  onEdit: (diet: Diet) => void;
  onDelete: (id: number) => void;
  onManageUsers?: (diet: Diet) => void;
  userCounts?: Record<number, number>;
  loading?: boolean;
}

export const DietList = ({ diets, onEdit, onDelete, onManageUsers, userCounts = {}, loading }: DietListProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Cargando dietas...</Typography>
      </Box>
    );
  }

  if (diets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No hay dietas registradas
        </Typography>
      </Box>
    );
  }

  const paginatedDiets = diets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Mobile view - Card Grid
  if (isMobile) {
    return (
      <Box>
        <Grid container spacing={3}>
          {paginatedDiets.map((diet) => (
            <Grid key={diet.id} size={{ xs: 12, sm: 6 }}>
              <DietCard
                diet={diet}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageUsers={onManageUsers}
                userCount={userCounts[diet.id] || 0}
              />
            </Grid>
          ))}
        </Grid>
        <TablePagination
          component="div"
          count={diets.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ mt: 2 }}
        />
      </Box>
    );
  }

  // Desktop view - Table
  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="center">Calorías</TableCell>
              <TableCell align="center">Usuarios</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDiets.map((diet) => (
              <TableRow key={diet.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {diet.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {diet.description}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={<Iconify icon="solar:fire-bold" width={16} />}
                    label={`${diet.calories} kcal`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  {onManageUsers && (
                    <Chip
                      icon={<Iconify icon="solar:users-group-rounded-bold" width={16} />}
                      label={userCounts[diet.id] || 0}
                      onClick={() => onManageUsers(diet)}
                      sx={{ cursor: 'pointer' }}
                      color="default"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(diet)}
                  >
                    <Iconify icon="solar:pen-bold" width={16} />
                  </IconButton>
                  <IconButton
                    size="small" 
                    color="error"
                    onClick={() => onDelete(diet.id)}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={diets.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};