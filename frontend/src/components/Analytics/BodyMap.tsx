import React from 'react';
import { Box, Tooltip } from '@mui/material';
import BODY_PATHS from '../../lib/body-paths';
import { MUSCLES, INERT, MUSCLE_NAMES_ES, levelsOf } from '../../lib/muscles';

interface BodyMapProps {
  load?: Record<string, number>;
  body?: 'male' | 'female';
  viewMode?: 'dual' | 'front' | 'back';
  selectedMuscle?: string | null;
  onSelectMuscle?: (muscle: string) => void;
}

interface SingleViewProps {
  view: { vb: string; p: Record<string, string[]> };
  levels: Record<string, number>;
  load: Record<string, number>;
  selectedMuscle?: string | null;
  onSelectMuscle?: (muscle: string) => void;
  title: string;
}

const SingleView: React.FC<SingleViewProps> = ({
  view,
  levels,
  load,
  selectedMuscle,
  onSelectMuscle,
}) => {
  if (!view || !view.p) return null;

  return (
    <svg className="bm-svg-view" viewBox={view.vb} role="img">
      {/* Silueta inerte (cabeza, manos, pies, cuello) */}
      {INERT.map((slug) =>
        (view.p[slug] || []).map((d, i) => (
          <path key={`inert-${slug}-${i}`} className="bm-sil" d={d} />
        ))
      )}

      {/* Músculos anatómicos activos */}
      {MUSCLES.map((slug) => {
        const paths = view.p[slug] || [];
        if (paths.length === 0) return null;

        const level = levels[slug] || 0;
        const setsCount = load[slug] || 0;
        const isSelected = selectedMuscle === slug;
        const displayName = MUSCLE_NAMES_ES[slug] || slug;

        return paths.map((d, i) => (
          <Tooltip
            key={`m-${slug}-${i}`}
            title={
              <Box sx={{ p: 0.5, textAlign: 'center' }}>
                <Box sx={{ fontWeight: 'bold' }}>{displayName}</Box>
                <Box sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  {setsCount > 0 ? `${setsCount.toFixed(1)} series esta semana` : 'Sin estímulo'}
                </Box>
              </Box>
            }
            arrow
          >
            <path
              className={`bm-muscle l${level} ${isSelected ? 'selected' : ''}`}
              d={d}
              onClick={() => onSelectMuscle?.(slug)}
              tabIndex={0}
              role="button"
              aria-label={`${displayName}: ${setsCount} series`}
            />
          </Tooltip>
        ));
      })}
    </svg>
  );
};

export const BodyMap: React.FC<BodyMapProps> = ({
  load = {},
  body = 'male',
  viewMode = 'dual',
  selectedMuscle = null,
  onSelectMuscle,
}) => {
  const levels = levelsOf(load);
  const geometry = (BODY_PATHS as any)[body] || (BODY_PATHS as any).male;

  if (!geometry) {
    return <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando anatomía...</Box>;
  }

  return (
    <Box className="bodymap-wrapper">
      {(viewMode === 'dual' || viewMode === 'front') && (
        <SingleView
          view={geometry.front}
          levels={levels}
          load={load}
          selectedMuscle={selectedMuscle}
          onSelectMuscle={onSelectMuscle}
          title="Vista Frontal"
        />
      )}

      {(viewMode === 'dual' || viewMode === 'back') && (
        <SingleView
          view={geometry.back}
          levels={levels}
          load={load}
          selectedMuscle={selectedMuscle}
          onSelectMuscle={onSelectMuscle}
          title="Vista Posterior"
        />
      )}
    </Box>
  );
};

export default BodyMap;
