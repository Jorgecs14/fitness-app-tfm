import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  Box,
  InputBase,
  Typography,
  Stack,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import { Iconify } from '../../utils/iconify';

interface SearchItem {
  id: string;
  title: string;
  category: 'Alumnos' | 'Entrenamientos' | 'Nutrición' | 'Analítica' | 'Gestión';
  description: string;
  path: string;
  icon: string;
  badgeColor: string;
}

const SEARCH_DIRECTORY: SearchItem[] = [
  // Entrenamientos
  {
    id: 'workouts-list',
    title: 'Gestor de Rutinas & Entrenamientos',
    category: 'Entrenamientos',
    description: 'Ver, crear y asignar rutinas semanales para hipertrofia y fuerza',
    path: '/dashboard/workouts',
    icon: 'solar:dumbbell-bold-duotone',
    badgeColor: '#3b82f6',
  },
  {
    id: 'client-workouts',
    title: 'Iniciar Sesión de Entrenamiento',
    category: 'Entrenamientos',
    description: 'Ejecutar series, registrar pesos, repeticiones y descansos',
    path: '/dashboard/workouts',
    icon: 'solar:play-circle-bold-duotone',
    badgeColor: '#10b981',
  },
  // Nutrición
  {
    id: 'diets-manager',
    title: 'Plan Nutricional & Gestor de Dietas',
    category: 'Nutrición',
    description: 'Configuración de macros, calorías y alimentos por comidas',
    path: '/dashboard/diets',
    icon: 'solar:chef-hat-bold-duotone',
    badgeColor: '#f59e0b',
  },
  {
    id: 'client-my-diet',
    title: 'Mi Dieta Diaria (Checklist & Macros)',
    category: 'Nutrición',
    description: 'Anillos de macronutrientes, comidas del día y registro de alimentos',
    path: '/dashboard/client-diet',
    icon: 'solar:pie-chart-2-bold-duotone',
    badgeColor: '#ec4899',
  },
  // Alumnos & CRM
  {
    id: 'crm-directory',
    title: 'CRM Clientes & Seguimiento 360°',
    category: 'Alumnos',
    description: 'Estado de alumnos, alertas de inactividad y fichas completas',
    path: '/dashboard/crm',
    icon: 'solar:user-speak-bold-duotone',
    badgeColor: '#06b6d4',
  },
  {
    id: 'users-list',
    title: 'Directorio de Alumnos',
    category: 'Alumnos',
    description: 'Lista completa de usuarios registrados y administración',
    path: '/dashboard/users',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    badgeColor: '#8b5cf6',
  },
  // Analítica
  {
    id: 'progress-analytics',
    title: 'Analítica de Fuerza & Historial 1RM',
    category: 'Analítica',
    description: 'Curvas de progresión, estimaciones de 1RM y consistencia',
    path: '/dashboard/progress',
    icon: 'solar:chart-square-bold-duotone',
    badgeColor: '#22d3ee',
  },
  {
    id: 'progress-photos',
    title: 'Comparador Fotográfico Antes/Después',
    category: 'Analítica',
    description: 'Slider interactivo de transformación corporal por ángulos',
    path: '/dashboard/submit-progress',
    icon: 'solar:camera-bold-duotone',
    badgeColor: '#f43f5e',
  },
  // Gestión
  {
    id: 'products-page',
    title: 'Catálogo de Suplementación & Productos',
    category: 'Gestión',
    description: 'Tienda, stock y recomendaciones de suplementación deportiva',
    path: '/dashboard/products',
    icon: 'solar:bag-4-bold-duotone',
    badgeColor: '#14b8a6',
  },
  {
    id: 'profile-page',
    title: 'Mi Perfil & Ajustes de Cuenta',
    category: 'Gestión',
    description: 'Datos personales, credenciales y configuración',
    path: '/dashboard/profile',
    icon: 'solar:user-circle-bold-duotone',
    badgeColor: '#64748b',
  },
];

interface GlobalQuickSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export const GlobalQuickSearchModal: React.FC<GlobalQuickSearchModalProps> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset query on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!query.trim()) return SEARCH_DIRECTORY;
    const q = query.toLowerCase().trim();
    return SEARCH_DIRECTORY.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Handle navigation
  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    onClose();
  };

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 4.5,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 35px rgba(6, 182, 212, 0.2)',
          color: '#fff',
          mt: { xs: 4, md: 8 },
        },
      }}
    >
      <DialogContent sx={{ p: 2.5 }} onKeyDown={handleKeyDown}>
        {/* Search Input Bar */}
        <Box
          className="liquid-command-input"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.2,
            mb: 2,
          }}
        >
          <Iconify icon="solar:magnifer-bold" width={22} sx={{ color: '#22d3ee' }} />
          <InputBase
            autoFocus
            fullWidth
            placeholder="Escribe para buscar alumnos, rutinas, dietas o analítica..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            sx={{
              color: '#fff',
              fontSize: '0.98rem',
              fontWeight: 500,
              '& input::placeholder': {
                color: 'rgba(255, 255, 255, 0.45)',
                opacity: 1,
              },
            }}
          />
          {query ? (
            <IconButton size="small" onClick={() => setQuery('')} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              <Iconify icon="solar:close-circle-bold" width={18} />
            </IconButton>
          ) : (
            <Chip
              label="ESC"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            />
          )}
        </Box>

        {/* Results List */}
        <Box
          sx={{
            maxHeight: 380,
            overflowY: 'auto',
            pr: 0.5,
            '&::-webkit-scrollbar': { width: 5 },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 3,
            },
          }}
        >
          {filteredItems.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
              <Iconify icon="solar:minimalistic-magnifer-zoom-out-bold-duotone" width={44} sx={{ mb: 1.5, color: '#94a3b8' }} />
              <Typography variant="body2" fontWeight={600}>
                No se encontraron resultados para "{query}"
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.35)' }}>
                Prueba buscando "rutina", "dieta", "progreso" o "crm"
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0.8}>
              {filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;

                return (
                  <Box
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isSelected
                        ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.22) 0%, rgba(59, 130, 246, 0.15) 100%)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected
                        ? '1px solid rgba(6, 182, 212, 0.45)'
                        : '1px solid rgba(255, 255, 255, 0.04)',
                      transform: isSelected ? 'translateX(4px)' : 'none',
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${item.badgeColor}22`,
                        border: `1px solid ${item.badgeColor}55`,
                        color: item.badgeColor,
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon={item.icon} width={22} />
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color: '#fff' }}>
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: item.badgeColor,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mt: 0.2 }}
                      >
                        {item.description}
                      </Typography>
                    </Box>

                    {isSelected && (
                      <Iconify
                        icon="solar:arrow-right-bold"
                        width={18}
                        sx={{ color: '#22d3ee', flexShrink: 0 }}
                      />
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Footer shortcuts helper */}
        <Box display="flex" justifyContent="space-between" alignItems="center" px={1}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Chip label="↑↓" size="small" sx={{ height: 20, fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)', color: '#fff' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Navegar</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Chip label="↵ Enter" size="small" sx={{ height: 20, fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)', color: '#fff' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Seleccionar</Typography>
            </Stack>
          </Stack>

          <Typography variant="caption" sx={{ color: '#22d3ee', fontWeight: 700 }}>
            FITNESS APP PRO
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalQuickSearchModal;
