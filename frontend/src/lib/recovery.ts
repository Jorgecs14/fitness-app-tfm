/**
 * Motor de recuperación muscular y cálculo de fatiga (Heatmap)
 * Mapea la carga de trabajo semanal hacia el estado de recuperación de cada grupo muscular.
 */

export interface MuscleLoad {
  muscle: string;
  volume: number;      // Tonelaje acumulado (kg * reps)
  setsCount: number;   // Series efectivas realizadas
  fatiguePercentage: number; // 0% (Totalmente descansado) a 100% (Fatiga alta / Sobrecargado)
}

export type MuscleStatus = 'recovered' | 'worked' | 'fatigued';

export interface MuscleStatusMap {
  [muscleKey: string]: {
    muscle: string;
    fatigue: number; // 0 - 100
    status: MuscleStatus;
    color: string; // Hex color para pintar el SVG
  };
}

// Mapa de músculos principales a claves estandarizadas
export const MUSCLE_GROUPS: { [key: string]: string } = {
  // Pecho
  pectorals: 'chest',
  chest: 'chest',
  // Espalda
  lats: 'back',
  'upper back': 'back',
  'lower back': 'back',
  traps: 'back',
  trapezius: 'back',
  rhomboids: 'back',
  // Hombros
  delts: 'shoulders',
  shoulders: 'shoulders',
  'anterior deltoid': 'shoulders',
  'lateral deltoid': 'shoulders',
  'posterior deltoid': 'shoulders',
  // Brazos
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms',
  // Core
  abs: 'abs',
  obliques: 'abs',
  'hip flexors': 'abs',
  // Piernas
  quads: 'quads',
  quadriceps: 'quads',
  hamstrings: 'hamstrings',
  glutes: 'glutes',
  calves: 'calves',
  adductors: 'quads',
};

/**
 * Retorna el color HSL / Hex correspondiente al nivel de fatiga muscular
 */
export function getMuscleColor(fatigue: number): string {
  if (fatigue <= 25) return '#2e7d32'; // Verde (Recuperado)
  if (fatigue <= 60) return '#ed6c02'; // Naranja/Amarillo (Trabajado)
  return '#d32f2f'; // Rojo (Fatiga alta)
}

/**
 * Calcula el estado de recuperación muscular a partir del historial de series de los últimos días
 */
export function calculateMuscleRecovery(
  loggedSets: Array<{
    target_muscle?: string;
    main_muscle_group?: string;
    weight?: number;
    reps?: number;
    created_at?: string;
  }>
): MuscleStatusMap {
  const loads: { [key: string]: { volume: number; sets: number } } = {};

  const now = new Date().getTime();
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  for (const set of loggedSets) {
    const rawMuscle = set.target_muscle || set.main_muscle_group || 'chest';
    const key = MUSCLE_GROUPS[rawMuscle.toLowerCase()] || rawMuscle.toLowerCase();

    if (!loads[key]) {
      loads[key] = { volume: 0, sets: 0 };
    }

    const setWeight = set.weight || 0;
    const setReps = set.reps || 0;
    const vol = setWeight * setReps;

    // Decaimiento por tiempo si hay fecha
    let timeFactor = 1;
    if (set.created_at) {
      const setTime = new Date(set.created_at).getTime();
      const ageMs = Math.max(0, now - setTime);
      timeFactor = Math.max(0.1, 1 - ageMs / THREE_DAYS_MS);
    }

    loads[key].volume += vol * timeFactor;
    loads[key].sets += 1;
  }

  const defaultMuscles = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'abs', 'quads', 'hamstrings', 'glutes', 'calves'];
  const result: MuscleStatusMap = {};

  for (const m of defaultMuscles) {
    const data = loads[m] || { volume: 0, sets: 0 };
    // Normalización: 10-12 series semanales ~ 70-100% de fatiga temporal
    const fatigueRaw = Math.min(100, Math.round((data.sets / 12) * 100));
    const status: MuscleStatus = fatigueRaw <= 25 ? 'recovered' : fatigueRaw <= 60 ? 'worked' : 'fatigued';

    result[m] = {
      muscle: m,
      fatigue: fatigueRaw,
      status,
      color: getMuscleColor(fatigueRaw),
    };
  }

  return result;
}
