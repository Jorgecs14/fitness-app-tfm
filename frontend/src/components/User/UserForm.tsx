// Modal de creación y edición de usuarios con estética Apple Inset Grouped
import React, { useState, useEffect, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  Box,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  User as UserIcon,
  X,
  Mail,
  Lock,
  Calendar,
  Shield,
  Weight,
  Ruler,
  Check,
  Dumbbell,
  Settings,
} from 'lucide-react';
import { User } from '../../types/User';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<User, 'id' | 'created_at'>) => void;
  userToEdit?: User | null;
}

const ROLES = [
  { id: 'client', label: 'Alumno / Cliente', icon: UserIcon, color: '#007AFF' },
  { id: 'trainer', label: 'Entrenador Personal', icon: Dumbbell, color: '#34C759' },
  { id: 'admin', label: 'Administrador', icon: Settings, color: '#AF52DE' },
];

export const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  onSubmit,
  userToEdit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    birth_date: '',
    role: 'client',
    weight: '',
    height: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        surname: userToEdit.surname || '',
        email: userToEdit.email || '',
        password: '',
        birth_date: userToEdit.birth_date || '',
        role: userToEdit.role || 'client',
        weight: userToEdit.weight?.toString() || '',
        height: userToEdit.height?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        surname: '',
        email: '',
        password: '',
        birth_date: '',
        role: 'client',
        weight: '',
        height: '',
      });
    }
    setErrors([]);
  }, [userToEdit, open]);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) newErrors.push('El nombre es obligatorio');
    if (!formData.surname.trim()) newErrors.push('El apellido es obligatorio');
    if (!formData.email.trim()) newErrors.push('El email es obligatorio');
    if (!formData.email.includes('@')) newErrors.push('El email debe ser válido');
    if (!userToEdit && !formData.password) newErrors.push('La contraseña es obligatoria');
    if (!formData.birth_date) newErrors.push('La fecha de nacimiento es obligatoria');
    if (!formData.role) newErrors.push('El rol es obligatorio');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      email: formData.email.trim(),
      password: formData.password,
      birth_date: formData.birth_date,
      role: formData.role,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
    };

    onSubmit(submitData);
    onClose();
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: '#000000',
          backgroundImage: 'none',
          color: '#ffffff',
          borderRadius: { xs: 0, sm: '24px' },
          border: { xs: 'none', sm: '1px solid rgba(255, 255, 255, 0.12)' },
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          maxHeight: { xs: '100%', sm: '92vh' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header Apple Liquid Glass */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          pt: isMobile ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: 'rgba(0, 122, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#007AFF',
              border: '0.5px solid rgba(0, 122, 255, 0.3)',
            }}
          >
            <UserIcon size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '0.75rem' }}>
              Gestión de cuentas y perfiles
            </Typography>
          </Box>
        </Stack>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'rgba(235, 235, 245, 0.8)',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Contenido con Scroll */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#000000', overflowY: 'auto' }}>
        <form id="user-form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {errors.length > 0 && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: '14px',
                  bgcolor: 'rgba(255, 59, 48, 0.15)',
                  color: '#FF453A',
                  border: '0.5px solid rgba(255, 59, 48, 0.3)',
                }}
              >
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Selector de Rol en Tarjetas Apple */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 600, mb: 1.5, display: 'block' }}>
                Tipo de Cuenta / Rol *
              </Typography>

              <Grid container spacing={1.5}>
                {ROLES.map((role) => {
                  const isSelected = formData.role === role.id;
                  const IconComp = role.icon;
                  return (
                    <Grid size={{ xs: 12, sm: 4 }} key={role.id}>
                      <Box
                        onClick={() => setFormData((prev) => ({ ...prev, role: role.id }))}
                        sx={{
                          p: 1.5,
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          cursor: 'pointer',
                          bgcolor: isSelected ? `${role.color}20` : '#2C2C2E',
                          border: isSelected ? `1.5px solid ${role.color}` : '0.5px solid rgba(255, 255, 255, 0.08)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Box sx={{ color: isSelected ? role.color : 'rgba(235, 235, 245, 0.6)' }}>
                          <IconComp size={20} />
                        </Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#ffffff' : 'rgba(235, 235, 245, 0.8)',
                            fontSize: '0.85rem',
                          }}
                        >
                          {role.label}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {/* Datos Personales Inset Grouped */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2 }}>
                Datos de Contacto y Acceso
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block' }}>
                    Nombre *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej: Carlos"
                    value={formData.name}
                    onChange={handleChange('name')}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block' }}>
                    Apellido *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ej: García"
                    value={formData.surname}
                    onChange={handleChange('surname')}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block' }}>
                    Email *
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="ejemplo@email.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>

                {!userToEdit && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block' }}>
                      Contraseña Temporal *
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange('password')}
                      InputProps={{
                        sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                      }}
                    />
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block' }}>
                    Fecha de Nacimiento *
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange('birth_date')}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Parámetros Corporales Inset Grouped */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: '#1C1C1E',
                border: '0.5px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', mb: 2 }}>
                Métricas Iniciales (Opcional)
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block' }}>
                    Peso (kg)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    placeholder="75.0"
                    value={formData.weight}
                    onChange={handleChange('weight')}
                    inputProps={{ step: 0.1, min: 0 }}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.6)', mb: 0.5, display: 'block' }}>
                    Altura (cm)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    placeholder="175"
                    value={formData.height}
                    onChange={handleChange('height')}
                    inputProps={{ step: 0.1, min: 0 }}
                    InputProps={{
                      sx: { color: '#ffffff', bgcolor: '#2C2C2E', borderRadius: '12px', fontSize: '16px' },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </form>
      </DialogContent>

      {/* Footer Botones Apple */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
          bgcolor: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          pb: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 12px)' : 2,
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            flex: 1,
            height: 44,
            borderRadius: '12px',
            color: '#ffffff',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="user-form"
          variant="contained"
          sx={{
            flex: 2,
            height: 44,
            borderRadius: '12px',
            bgcolor: '#007AFF',
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
            '&:hover': { bgcolor: '#0062cc' },
          }}
        >
          {userToEdit ? 'Guardar Cambios' : 'Crear Usuario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;