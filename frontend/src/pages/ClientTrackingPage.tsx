import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert
} from '@mui/material';
import {
  Search,
  Person,
  FitnessCenter
} from '@mui/icons-material';
import { User } from '../types/User';
import { userService } from '../services/userService';
import ClientTrackingDashboard from '../components/Client/ClientTrackingDashboard';

const ClientTrackingPage: React.FC = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allUsers = await userService.getAll();
      // Filtrar solo los usuarios con rol 'client'
      const clientUsers = allUsers.filter(user => user.role === 'client');
      setClients(clientUsers);
      
    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
      setError('Error al cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getInitials = (name: string, surname: string): string => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  if (selectedClient) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setSelectedClient(null)}
            sx={{ mb: 2 }}
          >
            ← Volver a la Lista
          </Button>
        </Box>
        <ClientTrackingDashboard user={selectedClient} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          <FitnessCenter sx={{ mr: 2, verticalAlign: 'middle' }} />
          Seguimiento de Clientes
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gestiona el seguimiento semanal y mensual de tus clientes
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Barra de búsqueda */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Buscar clientes por nombre, apellido o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 600 }}
          />
        </Box>

        {/* Lista de clientes */}
        {loading ? (
          <Typography>Cargando clientes...</Typography>
        ) : filteredClients.length === 0 ? (
          <Alert severity="info">
            {searchTerm ? 'No se encontraron clientes con ese criterio de búsqueda.' : 'No hay clientes registrados.'}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredClients.map((client) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={client.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => setSelectedClient(client)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getInitials(client.name, client.surname)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" noWrap>
                          {client.name} {client.surname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {client.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={<Person />}
                        label="Cliente"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      {client.birth_date && (
                        <Chip
                          label={`${calculateAge(client.birth_date)} años`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Cliente desde: {new Date(client.created_at).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>

                    {/* Información adicional */}
                    {(client.weight || client.height) && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Grid container spacing={1}>
                          {client.weight && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Peso: {client.weight} kg
                              </Typography>
                            </Grid>
                          )}
                          {client.height && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Altura: {client.height} cm
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                      }}
                    >
                      Ver Seguimiento
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ClientTrackingPage;
