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
import {
  Search,
  Dumbbell,
  PlayCircle,
  ChefHat,
  PieChart,
  Users,
  LineChart,
  Camera,
  ShoppingBag,
  User,
  X,
  ArrowRight
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  category: 'Alumnos' | 'Entrenamientos' | 'Nutrición' | 'Analítica' | 'Gestión';
  description: string;
  path: string;
  icon: any;
  badgeColor: string;
}

const SEARCH_DIRECTORY: SearchItem[] = [
  {
    id: 'workouts-list',
    title: 'Gestor de Rutinas & Entrenamientos',
    category: 'Entrenamientos',
    description: 'Ver, crear y asignar rutinas semanales para hipertrofia y fuerza',
    path: '/dashboard/workouts',
    icon: Dumbbell,
    badgeColor: '#007aff',
  },
  {
    id: 'client-workouts',
    title: 'Iniciar Sesión de Entrenamiento',
    category: 'Entrenamientos',
    description: 'Ejecutar series, registrar pesos, repeticiones y descansos',
    path: '/dashboard/workouts',
    icon: PlayCircle,
    badgeColor: '#34c759',
  },
  {
    id: 'diets-manager',
    title: 'Plan Nutricional & Gestor de Dietas',
    category: 'Nutrición',
    description: 'Configuración de macros, calorías y alimentos por comidas',
    path: '/dashboard/diets',
    icon: ChefHat,
    badgeColor: '#ff9500',
  },
  {
    id: 'client-my-diet',
    title: 'Mi Dieta Diaria (Checklist & Macros)',
    category: 'Nutrición',
    description: 'Anillos de macronutrientes, comidas del día y registro de alimentos',
    path: '/dashboard/client-diet',
    icon: PieChart,
    badgeColor: '#af52de',
  },
  {
    id: 'users-list',
    title: 'Directorio de Alumnos & CRM',
    category: 'Alumnos',
    description: 'Lista completa de usuarios registrados y seguimiento',
    path: '/dashboard/users',
    icon: Users,
    badgeColor: '#007aff',
  },
  {
    id: 'progress-analytics',
    title: 'Analítica de Fuerza & Historial 1RM',
    category: 'Analítica',
    description: 'Curvas de progresión, estimaciones de 1RM y consistencia',
    path: '/dashboard/progress',
    icon: LineChart,
    badgeColor: '#30b0c7',
  },
  {
    id: 'progress-photos',
    title: 'Comparador Fotográfico Antes/Después',
    category: 'Analítica',
    description: 'Slider interactivo de transformación corporal por ángulos',
    path: '/dashboard/submit-progress',
    icon: Camera,
    badgeColor: '#ff3b30',
  },
  {
    id: 'products-page',
    title: 'Catálogo de Suplementación',
    category: 'Gestión',
    description: 'Tienda, stock y recomendaciones de suplementación deportiva',
    path: '/dashboard/products',
    icon: ShoppingBag,
    badgeColor: '#34c759',
  },
  {
    id: 'profile-page',
    title: 'Mi Perfil & Ajustes de Cuenta',
    category: 'Gestión',
    description: 'Datos personales, credenciales y configuración',
    path: '/dashboard/profile',
    icon: User,
    badgeColor: '#8e8e93',
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

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

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

  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    onClose();
  };

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
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: '#1c1c1e',
          border: '0.5px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          color: '#ffffff',
          mt: { xs: 2, md: 6 },
          m: { xs: 2, md: 'auto' }
        },
      }}
    >
      <DialogContent sx={{ p: 2 }} onKeyDown={handleKeyDown}>
        {/* Search Input Bar (16px to prevent zoom) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            px: 1.8,
            py: 1,
            mb: 2,
            backgroundColor: 'rgba(120, 120, 128, 0.18)',
            borderRadius: 3,
            border: '0.5px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Search size={18} color="rgba(235, 235, 245, 0.5)" />
          <InputBase
            autoFocus
            fullWidth
            placeholder="Buscar alumnos, rutinas, dietas..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            sx={{
              color: '#ffffff',
              fontSize: '16px !important', // iOS requirement
              fontWeight: 500,
              '& input::placeholder': {
                color: 'rgba(235, 235, 245, 0.4)',
                opacity: 1,
              },
            }}
          />
          {query ? (
            <IconButton size="small" onClick={() => setQuery('')} sx={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              <X size={16} />
            </IconButton>
          ) : (
            <Chip
              label="ESC"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(235, 235, 245, 0.6)',
              }}
            />
          )}
        </Box>

        {/* Results List */}
        <Box
          sx={{
            maxHeight: 360,
            overflowY: 'auto',
            pr: 0.5,
          }}
        >
          {filteredItems.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center', color: 'rgba(235, 235, 245, 0.5)' }}>
              <Typography variant="body2" fontWeight={600}>
                No se encontraron resultados para "{query}"
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0.6}>
              {filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const IconComponent = item.icon;

                return (
                  <Box
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.2,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease',
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'transparent',
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(120, 120, 128, 0.2)',
                        color: item.badgeColor,
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={18} />
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ color: '#ffffff', fontSize: '14px' }}>
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            color: 'rgba(235, 235, 245, 0.6)',
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ color: 'rgba(235, 235, 245, 0.5)', display: 'block', mt: 0.2, fontSize: '12px' }}
                      >
                        {item.description}
                      </Typography>
                    </Box>

                    {isSelected && (
                      <ArrowRight size={16} color="#007aff" style={{ flexShrink: 0 }} />
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Footer shortcuts helper */}
        <Box display="flex" justifyContent="space-between" alignItems="center" px={1}>
          <Typography variant="caption" sx={{ color: 'rgba(235, 235, 245, 0.4)', fontSize: '12px' }}>
            Pulsa Enter para abrir
          </Typography>
          <Typography variant="caption" sx={{ color: '#007aff', fontWeight: 600, fontSize: '12px' }}>
            FITNESS PRO
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalQuickSearchModal;
