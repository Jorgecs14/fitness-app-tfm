import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
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
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Stack,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Tooltip
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { User } from '../../types/User';
import { UserCard } from './UserCard';
import { useNavigate } from 'react-router-dom';

interface UserListProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
  onCreateNew: () => void;
  onAssignTrainer?: (user: User) => void;
}

export const UserList = ({
  users,
  loading,
  onEdit,
  onDelete,
  onExport,
  onCreateNew,
}: UserListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (roleFilter === 'client') return user.role === 'client' || user.role === 'cliente';
      if (roleFilter === 'trainer') return user.role === 'trainer' || user.role === 'entrenador';
      if (roleFilter === 'admin') return user.role === 'admin';
      return true;
    });
  }, [users, searchQuery, roleFilter]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'client':
      case 'cliente':
        return 'primary';
      case 'trainer':
      case 'entrenador':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'client':
      case 'cliente':
        return 'Alumno';
      case 'trainer':
      case 'entrenador':
        return 'Entrenador';
      default:
        return role;
    }
  };

  const handleExportClick = (format: 'pdf' | 'excel' | 'csv') => {
    onExport(format);
    setExportMenuAnchor(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header & Main Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
            Directorio de Usuarios
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Gestiona la asignación de entrenadores, roles, fichas 360° y accesos del sistema.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:export-bold" />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={{
              borderRadius: '20px',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Exportar
          </Button>

          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:user-plus-bold" />}
            onClick={onCreateNew}
            sx={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
            }}
          >
            Nuevo Usuario
          </Button>
        </Stack>
      </Box>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        PaperProps={{
          className: 'liquid-glass-card',
          sx: {
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            minWidth: 160,
          },
        }}
      >
        <MenuItem onClick={() => handleExportClick('pdf')}>
          <Iconify icon="solar:file-text-bold" width={18} sx={{ mr: 1.5, color: '#f43f5e' }} />
          Exportar PDF
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('excel')}>
          <Iconify icon="solar:file-smile-bold" width={18} sx={{ mr: 1.5, color: '#10b981' }} />
          Exportar Excel
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('csv')}>
          <Iconify icon="solar:document-text-bold" width={18} sx={{ mr: 1.5, color: '#22d3ee' }} />
          Exportar CSV
        </MenuItem>
      </Menu>

      {/* Filters and Controls Card */}
      <Box
        className="liquid-glass-card"
        sx={{
          p: 2.5,
          borderRadius: 3.5,
          mb: 3,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          {/* Search Input */}
          <TextField
            size="small"
            placeholder="Buscar por nombre, email o rol..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: '100%', md: 320 },
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
            }}
          />

          {/* Role Filter Chips */}
          <Stack direction="row" spacing={1} overflow="auto" pb={{ xs: 1, md: 0 }}>
            <Chip
              label="Todos"
              clickable
              onClick={() => { setRoleFilter('all'); setPage(0); }}
              color={roleFilter === 'all' ? 'primary' : 'default'}
              variant={roleFilter === 'all' ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="Alumnos"
              clickable
              onClick={() => { setRoleFilter('client'); setPage(0); }}
              color={roleFilter === 'client' ? 'primary' : 'default'}
              variant={roleFilter === 'client' ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="Entrenadores"
              clickable
              onClick={() => { setRoleFilter('trainer'); setPage(0); }}
              color={roleFilter === 'trainer' ? 'success' : 'default'}
              variant={roleFilter === 'trainer' ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="Administradores"
              clickable
              onClick={() => { setRoleFilter('admin'); setPage(0); }}
              color={roleFilter === 'admin' ? 'error' : 'default'}
              variant={roleFilter === 'admin' ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            sx={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              p: '2px',
              '& .MuiToggleButton-root': {
                borderRadius: '18px',
                px: 1.5,
                py: 0.3,
                border: 'none',
                color: 'text.secondary',
                '&.Mui-selected': {
                  background: 'rgba(6, 182, 212, 0.25)',
                  color: '#22d3ee',
                  fontWeight: 700,
                },
              },
            }}
          >
            <ToggleButton value="grid">
              <Iconify icon="solar:widget-4-bold" width={16} sx={{ mr: 0.5 }} />
              Tarjetas
            </ToggleButton>
            <ToggleButton value="table">
              <Iconify icon="solar:list-bold" width={16} sx={{ mr: 0.5 }} />
              Tabla
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={1.5} borderTop="1px solid rgba(255, 255, 255, 0.06)">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios encontrados
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <Grid container spacing={2.5}>
          {loading ? (
            <Grid size={12}>
              <Box className="liquid-glass-card" sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                <Typography>Cargando directorio de usuarios...</Typography>
              </Box>
            </Grid>
          ) : filteredUsers.length === 0 ? (
            <Grid size={12}>
              <Box className="liquid-glass-card" sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                <Typography color="text.secondary">No se encontraron usuarios con esos criterios.</Typography>
              </Box>
            </Grid>
          ) : (
            paginatedUsers.map((user) => (
              <Grid key={user.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <UserCard user={user} onEdit={onEdit} onDelete={onDelete} />
              </Grid>
            ))
          )}
        </Grid>
      ) : (
        /* TABLE VIEW */
        <Box
          className="liquid-glass-card"
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Alta</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography>Cargando...</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No hay usuarios registrados</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { background: 'rgba(6, 182, 212, 0.04)' },
                      }}
                      onClick={() => navigate(`/dashboard/users/${user.id}`)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                              fontSize: '0.85rem',
                              fontWeight: 800,
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight="700">
                            {user.name} {user.surname}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Ficha 360°">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/dashboard/users/${user.id}`)}
                            sx={{ color: '#22d3ee' }}
                          >
                            <Iconify icon="solar:eye-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(user)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <Iconify icon="solar:pen-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(user.id)}
                            sx={{ color: '#f43f5e' }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <TablePagination
            page={page}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPageOptions={[8, 12, 24, 48]}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Box>
      )}
    </Box>
  );
};

export default UserList;
