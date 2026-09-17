import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
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

  // Filter photos by selected angle and sort chronologically (earliest to latest)
  const anglePhotos = photos
    .filter(p => p.photo_type === selectedAngle)
    .sort((a, b) => new Date(a.photo_date).getTime() - new Date(b.photo_date).getTime() || a.id - b.id);

  const containerRef = useRef<HTMLDivElement>(null);

  // Date selection states: beforeId is ALWAYS the 1st photo (baseline), afterId defaults to latest photo
  const [beforeId, setBeforeId] = useState<number | ''>('');
  const [afterId, setAfterId] = useState<number | ''>('');

  useEffect(() => {
    if (anglePhotos.length >= 2) {
      setBeforeId(anglePhotos[0].id);
      setAfterId(anglePhotos[anglePhotos.length - 1].id);
    } else if (anglePhotos.length === 1) {
      setBeforeId(anglePhotos[0].id);
      setAfterId(anglePhotos[0].id);
    } else {
      setBeforeId('');
      setAfterId('');
    }
  }, [selectedAngle, photos.length]);

  const selectedBeforePhoto = anglePhotos.find(p => p.id === beforeId) || anglePhotos[0];
  const selectedAfterPhoto = anglePhotos.find(p => p.id === afterId) || anglePhotos[anglePhotos.length - 1];

  const beforeUrl = selectedBeforePhoto?.photo_url || '';
  const beforeLabel = selectedBeforePhoto
    ? `${new Date(selectedBeforePhoto.photo_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} (Inicio)`
    : '';

  const afterUrl = selectedAfterPhoto?.photo_url || '';
  const afterLabel = selectedAfterPhoto
    ? `${new Date(selectedAfterPhoto.photo_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} (Actual)`
    : '';

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
        borderRadius: { xs: 3, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Top Header & Mode Controls */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5} flexWrap="wrap">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.4))',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.35)',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:gallery-wide-bold" width={18} sx={{ color: '#22d3ee' }} />
            </Box>
            <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
                fontSize: '0.68rem',
                height: 22,
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', maxWidth: 640 }}>
            Tu 1ª foto se almacena como referencia inicial (Antes) y se contrasta milimétricamente contra tu último progreso (Después).
          </Typography>
        </Box>

        {/* View Mode & Upload button */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          {anglePhotos.length >= 2 && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => val && setViewMode(val)}
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                p: '2px',
                '& .MuiToggleButton-root': {
                  borderRadius: '16px',
                  px: { xs: 1.2, sm: 1.6 },
                  py: 0.4,
                  border: 'none',
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))',
                    color: '#22d3ee',
                    fontWeight: 700,
                  },
                },
              }}
            >
              <ToggleButton value="slider">
                <Iconify icon="solar:slider-vertical-bold" width={14} sx={{ mr: 0.5 }} />
                Deslizador
              </ToggleButton>
              <ToggleButton value="side-by-side">
                <Iconify icon="solar:mirror-left-bold" width={14} sx={{ mr: 0.5 }} />
                Lado a Lado
              </ToggleButton>
            </ToggleButtonGroup>
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
                borderRadius: '18px',
                fontWeight: 700,
                textTransform: 'none',
                px: 1.8,
                fontSize: '0.78rem',
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
        sx={{ mb: 2 }}
      >
        <ToggleButtonGroup
          value={selectedAngle}
          exclusive
          onChange={(_, val) => val && setSelectedAngle(val)}
          size="small"
          sx={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            p: '3px',
            display: 'flex',
            width: { xs: '100%', sm: 'auto' },
            '& .MuiToggleButton-root': {
              flex: { xs: 1, sm: 'initial' },
              borderRadius: '10px',
              px: { xs: 1.5, sm: 2 },
              py: 0.7,
              border: 'none',
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              justifyContent: 'center',
              '&.Mui-selected': {
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              },
            },
          }}
        >
          <ToggleButton value="front_arms_cross">
            <Iconify icon="solar:user-bold" width={15} sx={{ mr: 0.6, color: '#38bdf8' }} />
            Frente
          </ToggleButton>
          <ToggleButton value="side_arms_front">
            <Iconify icon="solar:walking-bold" width={15} sx={{ mr: 0.6, color: '#10b981' }} />
            Perfil
          </ToggleButton>
          <ToggleButton value="back_arms_cross">
            <Iconify icon="solar:dumbbell-large-minimalistic-bold" width={15} sx={{ mr: 0.6, color: '#a855f7' }} />
            Espalda
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Silhouette overlay toggle */}
        {anglePhotos.length > 0 && (
          <Button
            size="small"
            variant={showSilhouette ? 'contained' : 'outlined'}
            onClick={() => setShowSilhouette(!showSilhouette)}
            startIcon={<Iconify icon="solar:tuning-bold" />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '0.75rem',
              py: 0.6,
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
        )}
      </Stack>

      {/* Date Pickers (if user has 3+ real photos for this angle) */}
      {anglePhotos.length > 2 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Comparando Línea Base (Antes) con Reporte:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <Select
              value={afterId}
              onChange={(e) => setAfterId(Number(e.target.value))}
              sx={{
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                fontSize: '0.8rem',
                height: 36,
              }}
            >
              {anglePhotos.slice(1).map((p) => (
                <MenuItem key={`after-${p.id}`} value={p.id} sx={{ fontSize: '0.8rem' }}>
                  {new Date(p.photo_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Main View Area */}
      {anglePhotos.length === 0 ? (
        /* Estado vacío cuando no hay fotos de este ángulo */
        <Box
          sx={{
            height: { xs: 260, sm: 340 },
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '16px',
              background: 'rgba(6, 182, 212, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22d3ee',
            }}
          >
            <Iconify icon="solar:camera-minimalistic-bold" width={28} />
          </Box>
          <Typography variant="subtitle1" fontWeight="700">
            Sin fotos de {selectedAngle === 'front_arms_cross' ? 'Frente' : selectedAngle === 'side_arms_front' ? 'Perfil' : 'Espalda'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 440, fontSize: '0.82rem' }}>
            La 1ª foto que subas quedará guardada permanentemente como tu punto de partida (Antes). Cada foto posterior actualizará tu estado actual (Después).
          </Typography>
        </Box>
      ) : anglePhotos.length === 1 ? (
        /* Estado con 1 sola foto (Línea de base guardada) */
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 340, sm: 460 },
            borderRadius: 3,
            overflow: 'hidden',
            background: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box component="img" src={beforeUrl} alt="Línea Base" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '10px',
              px: 1.5,
              py: 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
            }}
          >
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#f1f5f9', fontSize: '0.78rem' }}>
              ANTES • {beforeLabel}
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              p: 1.5,
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#22d3ee', fontWeight: 700, fontSize: '0.78rem' }}>
              ✓ 1ª foto registrada como línea de base inicial. Sube tu próximo reporte semanal para activar el comparador antes/después.
            </Typography>
          </Box>
        </Box>
      ) : viewMode === 'slider' ? (
        /* Slider con 2 o más fotos reales */
        <Box
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 360, sm: 480, md: 560 },
            borderRadius: 3,
            overflow: 'hidden',
            cursor: isDragging ? 'ew-resize' : 'default',
            userSelect: 'none',
            touchAction: 'none',
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
                <circle cx="100" cy="45" r="22" />
                <line x1="100" y1="67" x2="100" y2="210" />
                <line x1="50" y1="95" x2="150" y2="95" />
                <line x1="50" y1="95" x2="25" y2="180" />
                <line x1="150" y1="95" x2="175" y2="180" />
                <ellipse cx="100" cy="115" rx="38" ry="12" />
                <ellipse cx="100" cy="150" rx="30" ry="10" />
                <ellipse cx="100" cy="190" rx="36" ry="12" />
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
                width: { xs: 38, sm: 44 },
                height: { xs: 38, sm: 44 },
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
              <Iconify icon="solar:double-alt-arrow-right-bold-duotone" width={20} sx={{ color: '#0891b2' }} />
            </Box>
          </Box>

          {/* Clean Non-Overlapping Responsive Top Badges */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 10, sm: 14 },
              left: { xs: 10, sm: 14 },
              right: { xs: 10, sm: 14 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 8,
              gap: 1,
            }}
          >
            {/* Before Badge */}
            <Box
              sx={{
                background: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '10px',
                px: { xs: 1.2, sm: 1.8 },
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                maxWidth: '48%',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#94a3b8',
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="caption"
                noWrap
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  color: '#f1f5f9',
                  fontSize: { xs: '0.68rem', sm: '0.78rem' },
                }}
              >
                ANTES • {beforeLabel}
              </Typography>
            </Box>

            {/* After Badge */}
            <Box
              sx={{
                background: 'rgba(6, 182, 212, 0.32)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(6, 182, 212, 0.65)',
                borderRadius: '10px',
                px: { xs: 1.2, sm: 1.8 },
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                maxWidth: '48%',
                boxShadow: '0 4px 18px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#22d3ee',
                  boxShadow: '0 0 8px #22d3ee',
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="caption"
                noWrap
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  color: '#22d3ee',
                  fontSize: { xs: '0.68rem', sm: '0.78rem' },
                }}
              >
                DESPUÉS • {afterLabel}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Side-By-Side View */
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box
            sx={{
              flex: 1,
              height: { xs: 280, sm: 400, md: 480 },
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
                top: 12,
                left: 12,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(12px)',
                borderRadius: '10px',
                px: 1.5,
                py: 0.5,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Typography variant="caption" fontWeight="800" color="#cbd5e1" sx={{ fontSize: '0.72rem' }}>
                ANTES • {beforeLabel}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              height: { xs: 280, sm: 400, md: 480 },
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              background: '#090d16',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
            }}
          >
            <Box component="img" src={afterUrl} alt="Después" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(6, 182, 212, 0.35)',
                backdropFilter: 'blur(12px)',
                borderRadius: '10px',
                px: 1.5,
                py: 0.5,
                border: '1px solid rgba(6, 182, 212, 0.5)',
              }}
            >
              <Typography variant="caption" fontWeight="800" color="#22d3ee" sx={{ fontSize: '0.72rem' }}>
                DESPUÉS • {afterLabel}
              </Typography>
            </Box>
          </Box>
        </Stack>
      )}

      {/* Bottom Summary / Instruction strip */}
      {anglePhotos.length >= 2 && (
        <Box
          sx={{
            mt: 2,
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
            <Iconify icon="solar:info-circle-bold" width={16} sx={{ color: '#22d3ee', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
              Comparando línea base ({beforeLabel}) con tu registro ({afterLabel}). Desliza el cursor central.
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.74rem' }}>
            Visor: {Math.round(sliderPosition)}%
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BeforeAfterSlider;
