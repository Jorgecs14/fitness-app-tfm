import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from '../utils/iconify';

// ----------------------------------------------------------------------

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    }));
  };

  const handleSignUp = useCallback(async () => {
    setError('');
    
    // Validaciones
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      // Simulación de registro
      setSuccess('Cuenta creada exitosamente. Redirigiendo...');
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (err) {
      setError('Error al crear la cuenta');
    }
  }, [formData, navigate]);

  const renderForm = (
    <Box component="form" sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          name="firstName"
          label="Nombre"
          value={formData.firstName}
          onChange={handleInputChange('firstName')}
        />
        <TextField
          fullWidth
          name="lastName"
          label="Apellido"
          value={formData.lastName}
          onChange={handleInputChange('lastName')}
        />
      </Box>

      <TextField
        fullWidth
        name="email"
        label="Correo electrónico"
        type="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        name="password"
        label="Contraseña"
        value={formData.password}
        onChange={handleInputChange('password')}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        name="confirmPassword"
        label="Confirmar contraseña"
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        type={showConfirmPassword ? 'text' : 'password'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  <Iconify icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.acceptTerms}
            onChange={handleInputChange('acceptTerms')}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            Acepto los{' '}
            <Link href="#" color="primary" sx={{ textDecoration: 'none' }}>
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link href="#" color="primary" sx={{ textDecoration: 'none' }}>
              política de privacidad
            </Link>
          </Typography>
        }
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="button"
        color="primary"
        variant="contained"
        onClick={handleSignUp}
        disabled={!!success}
        sx={{ mb: 2 }}
      >
        Crear Cuenta
      </Button>
      
      <Button
        fullWidth
        size="large"
        color="inherit"
        variant="outlined"
        onClick={() => navigate('/sign-in')}
      >
        Ya tengo una cuenta
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h4" component="h1">
          Crear Cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Únete a Fitness Management System
        </Typography>
      </Box>

      {renderForm}
    </>
  );
};
