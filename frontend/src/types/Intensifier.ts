// Definición de tipos de intensificadores de series portados y adaptados de openGym
export type IntensifierType = 'none' | 'dropset' | 'restpause';

export interface DropSetConfig {
  count: number; // Número de bajadas (ej. 2 bajadas de peso)
  pct: number;   // Porcentaje de reducción de peso por bajada (ej. 20%)
}

export interface RestPauseConfig {
  totalReps: number; // Repeticiones totales buscadas en la serie rest-pause (ej. 12)
  restSec: number;   // Segundos de micro-descanso entre ráfagas (ej. 15s)
}

export interface IntensifierPlan {
  type: IntensifierType;
  dropConfig?: DropSetConfig;
  restPauseConfig?: RestPauseConfig;
}

export interface DropSetItem {
  weight: number;
  reps: number;
}

export interface RestPauseClusterItem {
  reps: number;
  restSec: number;
}
