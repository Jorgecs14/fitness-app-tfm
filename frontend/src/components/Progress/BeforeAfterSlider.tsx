import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Stack,
  Button
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { ClientProgressPhoto } from '../../types/ClientProgressPhoto';

interface BeforeAfterSliderProps {
  photos?: ClientProgressPhoto[];
  initialAngle?: 'front_arms_cross' | 'side_arms_front' | 'back_arms_cross';
  onUploadClick?: () => void;
}

// Demo fallback images with aesthetic fitness transformation demonstration
const DEMO_PHOTOS = {
  front_arms_cross: {
    before: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    beforeDate: 'Semana 1 (Inicio)',
    after: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    afterDate: 'Semana 16 (Actual)',
  },
  side_arms_front: {
    before: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    beforeDate: 'Semana 1 (Inicio)',
    after: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    afterDate: 'Semana 16 (Actual)',
  },
  back_arms_cross: {
    before: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    beforeDate: 'Semana 1 (Inicio)',
    after: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
    afterDate: 'Semana 16 (Actual)',
  },
};

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  photos = [],
  initialAngle = 'front_arms_cross',
  onUploadClick
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedAngle, setSelectedAngle] = useState<'front_arms_cross' | 'side_arms_front' | 'back_arms_cross'>(initialAngle);
  const [showSilhouette, setShowSilhouette] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [useDemoMode, setUseDemoMode] = useState<boolean>(photos.length < 2);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter photos by selected angle
  const anglePhotos = photos
    .filter(p => p.photo_type === selectedAngle)
    .sort((a, b) => new Date(a.photo_date).getTime() - new Date(b.photo_date).getTime());

  // Date selection states
  const [beforeId, setBeforeId] = useState<number | ''>('');
  const [afterId, setAfterId] = useState<number | ''>('');

  useEffect(() => {
    if (anglePhotos.length >= 2) {
      setBeforeId(anglePhotos[0].id);
      setAfterId(anglePhotos[anglePhotos.length - 1].id);
    } else if (anglePhotos.length === 1) {
      setBeforeId(anglePhotos[0].id);
      setAfterId(anglePhotos[0].id);
    }
  }, [selectedAngle, photos]);

  const selectedBeforePhoto = anglePhotos.find(p => p.id === beforeId);
  const selectedAfterPhoto = anglePhotos.find(p => p.id === afterId);

  // Resolved URLs and dates
  const hasRealPhotos = !useDemoMode && selectedBeforePhoto && selectedAfterPhoto;
  const beforeUrl = hasRealPhotos
    ? selectedBeforePhoto.photo_url
    : DEMO_PHOTOS[selectedAngle].before;
  const beforeLabel = hasRealPhotos
    ? new Date(selectedBeforePhoto.photo_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : DEMO_PHOTOS[selectedAngle].beforeDate;

  const afterUrl = hasRealPhotos
    ? selectedAfterPhoto.photo_url
    : DEMO_PHOTOS[selectedAngle].after;
  const afterLabel = hasRealPhotos
    ? new Date(selectedAfterPhoto.photo_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : DEMO_PHOTOS[selectedAngle].afterDate;

  // Handle Dragging
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const onMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <Box
      className="liquid-glass-card"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Top Header & Controls */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.4))',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.35)',
              }}
            >
              <Iconify icon="solar:gallery-wide-bold" width={20} sx={{ color: '#22d3ee' }} />
            </Box>
            <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em' }}>
              Comparador Antes & Después
            </Typography>
            <Chip
              label="Split-View Glass"
              size="small"
              sx={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Desliza la barra divisoria para comparar milimétricamente tu cambio físico y composición muscular.
          </Typography>
        </Box>

        {/* View Mode & Toggle Controls */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              p: '2px',
              '& .MuiToggleButton-root': {
                borderRadius: '20px',
                px: 1.5,
                py: 0.5,
                border: 'none',
                color: 'text.secondary',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))',
                  color: '#22d3ee',
                  fontWeight: 700,
                },
              },
            }}
          >
            <ToggleButton value="slider">
              <Iconify icon="solar:slider-vertical-bold" width={16} sx={{ mr: 0.5 }} />
              Deslizador
            </ToggleButton>
            <ToggleButton value="side-by-side">
              <Iconify icon="solar:mirror-left-bold" width={16} sx={{ mr: 0.5 }} />
              Lado a Lado
            </ToggleButton>
          </ToggleButtonGroup>

          {photos.length < 2 && (
            <FormControlLabel
              control={
                <Switch
                  checked={useDemoMode}
                  onChange={(e) => setUseDemoMode(e.target.checked)}
                  color="info"
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Modo Demo
                </Typography>
              }
              sx={{ m: 0 }}
            />
          )}

          {onUploadClick && (
            <Button
              variant="contained"
              size="small"
              onClick={onUploadClick}
              startIcon={<Iconify icon="solar:camera-add-bold" />}
              sx={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
                borderRadius: '20px',
                fontWeight: 700,
                textTransform: 'none',
                px: 2,
              }}
            >
              Subir Foto
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Angle Selector Tabs & Silhouette Helper Button */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <ToggleButtonGroup
          value={selectedAngle}
          exclusive
          onChange={(_, val) => val && setSelectedAngle(val)}
          size="small"
          sx={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            p: '3px',
            '& .MuiToggleButton-root': {
              borderRadius: '12px',
              px: 2,
              py: 0.8,
              border: 'none',
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              '&.Mui-selected': {
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              },
            },
          }}
        >
          <ToggleButton value="front_arms_cross">
            <Iconify icon="solar:user-bold" width={16} sx={{ mr: 0.8, color: '#38bdf8' }} />
            Frente
          </ToggleButton>
          <ToggleButton value="side_arms_front">
            <Iconify icon="solar:walking-bold" width={16} sx={{ mr: 0.8, color: '#10b981' }} />
            Perfil
          </ToggleButton>
          <ToggleButton value="back_arms_cross">
            <Iconify icon="solar:dumbbell-large-minimalistic-bold" width={16} sx={{ mr: 0.8, color: '#a855f7' }} />
            Espalda
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Silhouette overlay toggle */}
        <Button
          size="small"
          variant={showSilhouette ? 'contained' : 'outlined'}
          onClick={() => setShowSilhouette(!showSilhouette)}
          startIcon={<Iconify icon="solar:tuning-bold" />}
          sx={{
            borderRadius: '14px',
            textTransform: 'none',
            fontSize: '0.8rem',
            borderColor: showSilhouette ? 'transparent' : 'rgba(255, 255, 255, 0.15)',
            background: showSilhouette ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
            color: showSilhouette ? '#22d3ee' : 'text.secondary',
            '&:hover': {
              background: showSilhouette ? 'rgba(6, 182, 212, 0.35)' : 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          {showSilhouette ? 'Ocultar Guía Anatómica' : 'Mostrar Guía Anatómica'}
        </Button>
      </Stack>

      {/* Date Pickers (only if user has real photos for this angle) */}
      {!useDemoMode && anglePhotos.length > 1 && (
        <Stack direction="row" spacing={2} sx={{ mb: 2.5 }} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="before-photo-label" sx={{ color: 'text.secondary' }}>Foto Antes</InputLabel>
            <Select
              labelId="before-photo-label"
              value={beforeId}
              label="Foto Antes"
              onChange={(e) => setBeforeId(Number(e.target.value))}
              sx={{
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              {anglePhotos.map((p) => (
                <MenuItem key={`before-${p.id}`} value={p.id}>
                  {new Date(p.photo_date).toLocaleDateString('es-ES')} (ID #{p.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="after-photo-label" sx={{ color: 'text.secondary' }}>Foto Después</InputLabel>
            <Select
              labelId="after-photo-label"
              value={afterId}
              label="Foto Después"
              onChange={(e) => setAfterId(Number(e.target.value))}
              sx={{
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              {anglePhotos.map((p) => (
                <MenuItem key={`after-${p.id}`} value={p.id}>
                  {new Date(p.photo_date).toLocaleDateString('es-ES')} (ID #{p.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Main View Area */}
      {viewMode === 'slider' ? (
        <Box
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 420, sm: 540, md: 620 },
            borderRadius: 3,
            overflow: 'hidden',
            cursor: isDragging ? 'ew-resize' : 'default',
            userSelect: 'none',
            background: '#090d16',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* AFTER Image (Full Background) */}
          <Box
            component="img"
            src={afterUrl}
            alt="Después"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
          />

          {/* BEFORE Image (Clipped overlay) */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              pointerEvents: 'none',
            }}
          >
            <Box
              component="img"
              src={beforeUrl}
              alt="Antes"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>

          {/* Silhouette Overlay Guide */}
          {showSilhouette && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.45,
              }}
            >
              <svg
                viewBox="0 0 200 400"
                width="80%"
                height="80%"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              >
                {/* Anatomical reference wireframe */}
                <circle cx="100" cy="45" r="22" />
                <line x1="100" y1="67" x2="100" y2="210" />
                {/* Shoulders */}
                <line x1="50" y1="95" x2="150" y2="95" />
                {/* Arms */}
                <line x1="50" y1="95" x2="25" y2="180" />
                <line x1="150" y1="95" x2="175" y2="180" />
                {/* Chest & Waist Guidelines */}
                <ellipse cx="100" cy="115" rx="38" ry="12" />
                <ellipse cx="100" cy="150" rx="30" ry="10" />
                <ellipse cx="100" cy="190" rx="36" ry="12" />
                {/* Legs */}
                <line x1="80" y1="210" x2="70" y2="360" />
                <line x1="120" y1="210" x2="130" y2="360" />
                <line x1="40" y1="360" x2="160" y2="360" stroke="#06b6d4" strokeWidth="2" strokeDasharray="0" />
              </svg>
            </Box>
          )}

          {/* Vertical Glass Divider Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${sliderPosition}%`,
              width: '2px',
              background: 'linear-gradient(180deg, rgba(6,182,212,0.2) 0%, #22d3ee 50%, rgba(59,130,246,0.2) 100%)',
              boxShadow: '0 0 12px #22d3ee, 0 0 25px rgba(6,182,212,0.6)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {/* Specular Slider Handle */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(200, 240, 255, 0.85))',
                backdropFilter: 'blur(12px)',
                border: '2px solid #22d3ee',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'ew-resize',
                pointerEvents: 'auto',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.12)',
                  boxShadow: '0 0 28px rgba(6, 182, 212, 1)',
                },
              }}
            >
              <Iconify icon="solar:double-alt-arrow-right-bold-duotone" width={22} sx={{ color: '#0891b2' }} />
            </Box>
          </Box>

          {/* Floating Badges */}
          {/* Before Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              px: 1.8,
              py: 0.8,
              pointerEvents: 'none',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#94a3b8',
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em', color: '#cbd5e1' }}>
              ANTES: {beforeLabel}
            </Typography>
          </Box>

          {/* After Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(6, 182, 212, 0.25)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              borderRadius: '12px',
              px: 1.8,
              py: 0.8,
              pointerEvents: 'none',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22d3ee',
                boxShadow: '0 0 8px #22d3ee',
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em', color: '#22d3ee' }}>
              DESPUÉS: {afterLabel}
            </Typography>
          </Box>
        </Box>
      ) : (
        /* Side-By-Side View */
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box
            sx={{
              flex: 1,
              height: { xs: 350, sm: 480 },
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box component="img" src={beforeUrl} alt="Antes" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                px: 1.8,
                py: 0.8,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Typography variant="caption" fontWeight="800" color="#cbd5e1">
                ANTES • {beforeLabel}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              height: { xs: 350, sm: 480 },
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              background: '#090d16',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
            }}
          >
            <Box component="img" src={afterUrl} alt="Después" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(6, 182, 212, 0.3)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                px: 1.8,
                py: 0.8,
                border: '1px solid rgba(6, 182, 212, 0.5)',
              }}
            >
              <Typography variant="caption" fontWeight="800" color="#22d3ee">
                DESPUÉS • {afterLabel}
              </Typography>
            </Box>
          </Box>
        </Stack>
      )}

      {/* Bottom Summary / Instruction strip */}
      <Box
        sx={{
          mt: 2.5,
          p: 1.5,
          borderRadius: 2.5,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:info-circle-bold" width={18} sx={{ color: '#22d3ee' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {useDemoMode
              ? 'Mostrando transformación demo interactiva. Sube al menos 2 fotos en tus reportes semanales para activar tu propio visor.'
              : `Comparando registros de ${beforeLabel} frente a ${afterLabel}. Arrastra el círculo central para deslizar.`}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>
          Posición: {Math.round(sliderPosition)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default BeforeAfterSlider;
