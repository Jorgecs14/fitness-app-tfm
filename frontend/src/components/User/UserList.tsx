import React, { useState, useMemo } from 'react';
import {
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
import {
  UserPlus,
  FileDown,
  Search,
  LayoutGrid,
  List as ListIcon,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
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
    <Box sx={{ width: '100%', pb: 8 }}>
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
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 0.5, color: '#FFFFFF' }}>
            Directorio de Usuarios
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Gestión de roles, expedientes 360° y accesos de atletas y entrenadores.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<FileDown size={16} />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={{
              borderRadius: '10px',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.82rem',
              px: 2,
            }}
          >
            Exportar
          </Button>

          <Button
            variant="contained"
            startIcon={<UserPlus size={16} />}
            onClick={onCreateNew}
            className="apple-button-primary"
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.82rem',
              px: 2.2,
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
          className: 'apple-card',
          sx: {
            borderRadius: '12px',
            minWidth: 160,
            p: 0.5,
          },
        }}
      >
        <MenuItem onClick={() => handleExportClick('pdf')}>
          <FileText size={16} color="#FF3B30" style={{ marginRight: 8 }} />
          <Typography variant="body2" fontWeight={600}>Exportar PDF</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('excel')}>
          <FileSpreadsheet size={16} color="#34C759" style={{ marginRight: 8 }} />
          <Typography variant="body2" fontWeight={600}>Exportar Excel</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('csv')}>
          <FileText size={16} color="#007AFF" style={{ marginRight: 8 }} />
          <Typography variant="body2" fontWeight={600}>Exportar CSV</Typography>
        </MenuItem>
      </Menu>

      {/* Filters and Controls Card */}
      <Box
        className="apple-card"
        sx={{
          p: 2,
          mb: 3,
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
                  <Search size={16} color="rgba(255, 255, 255, 0.4)" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: '100%', md: 320 },
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '10px',
              '& fieldset': { border: 'none' },
            }}
          />

          {/* Role Filter Chips */}
          <Stack direction="row" spacing={0.8} overflow="auto" pb={{ xs: 1, md: 0 }}>
            <Chip
              label="Todos"
              clickable
              onClick={() => { setRoleFilter('all'); setPage(0); }}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: roleFilter === 'all' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                color: roleFilter === 'all' ? '#000000' : 'rgba(255, 255, 255, 0.6)',
              }}
            />
            <Chip
              label="Alumnos"
              clickable
              onClick={() => { setRoleFilter('client'); setPage(0); }}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: roleFilter === 'client' ? '#007AFF' : 'rgba(255, 255, 255, 0.06)',
                color: roleFilter === 'client' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              }}
            />
            <Chip
              label="Entrenadores"
              clickable
              onClick={() => { setRoleFilter('trainer'); setPage(0); }}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: roleFilter === 'trainer' ? '#34C759' : 'rgba(255, 255, 255, 0.06)',
                color: roleFilter === 'trainer' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              }}
            />
            <Chip
              label="Administradores"
              clickable
              onClick={() => { setRoleFilter('admin'); setPage(0); }}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: roleFilter === 'admin' ? '#FF3B30' : 'rgba(255, 255, 255, 0.06)',
                color: roleFilter === 'admin' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              }}
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
              border: '0.5px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              p: '2px',
              '& .MuiToggleButton-root': {
                borderRadius: '8px',
                px: 1.2,
                py: 0.4,
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                '&.Mui-selected': {
                  background: '#FFFFFF',
                  color: '#000000',
                  fontWeight: 700,
                },
              },
            }}
          >
            <ToggleButton value="grid">
              <LayoutGrid size={14} style={{ marginRight: 4 }} />
              Tarjetas
            </ToggleButton>
            <ToggleButton value="table">
              <ListIcon size={14} style={{ marginRight: 4 }} />
              Tabla
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5} pt={1} borderTop="0.5px solid rgba(255, 255, 255, 0.06)">
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      {viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {loading ? (
            <Grid size={12}>
              <Box className="apple-card" sx={{ p: 5, textAlign: 'center' }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Cargando usuarios...</Typography>
              </Box>
            </Grid>
          ) : filteredUsers.length === 0 ? (
            <Grid size={12}>
              <Box className="apple-card" sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="rgba(255, 255, 255, 0.5)">No se encontraron usuarios con esos criterios.</Typography>
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
        <Box
          className="apple-card"
          sx={{
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Alta</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.06)' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, borderBottom: 'none' }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Cargando...</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, borderBottom: 'none' }}>
                      <Typography color="rgba(255, 255, 255, 0.5)">No hay usuarios registrados</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { background: 'rgba(255, 255, 255, 0.03)' },
                        '& td': { borderBottom: '0.5px solid rgba(255, 255, 255, 0.04)' }
                      }}
                      onClick={() => navigate(`/dashboard/users/${user.id}`)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.2}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              background: '#2C2C2E',
                              color: '#FFFFFF',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#FFFFFF' }}>
                            {user.name} {user.surname}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(user.role)}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            height: 22,
                            bgcolor: user.role === 'admin' ? 'rgba(255, 59, 48, 0.15)' : user.role === 'trainer' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(0, 122, 255, 0.15)',
                            color: user.role === 'admin' ? '#FF3B30' : user.role === 'trainer' ? '#34C759' : '#007AFF',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                          {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Ficha">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/dashboard/users/${user.id}`)}
                            sx={{ color: '#007AFF' }}
                          >
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(user)}
                            sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                          >
                            <Edit2 size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(user.id)}
                            sx={{ color: '#FF3B30' }}
                          >
                            <Trash2 size={16} />
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
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              '& .MuiSvgIcon-root': { color: '#FFFFFF' }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default UserList;
