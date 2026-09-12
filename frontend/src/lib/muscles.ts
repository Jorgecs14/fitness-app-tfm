/**
 * Motor de análisis muscular y cálculo de cargas anatómicas
 * Traduce nombres de ejercicios a los 18 grupos musculares anatómicos vectoriales
 */

export const MUSCLES = [
  'trapezius', 'deltoids', 'chest', 'upper-back', 'serratus',
  'biceps', 'triceps', 'forearm',
  'abs', 'obliques', 'lower-back',
  'gluteal', 'quadriceps', 'hamstring', 'adductors', 'hip-flexors',
  'calves', 'tibialis',
] as const;

export type MuscleSlug = (typeof MUSCLES)[number];

export const INERT = ['head', 'hair', 'neck', 'hands', 'feet', 'knees', 'ankles'];

export const MUSCLE_NAMES_ES: Record<string, string> = {
  trapezius: 'Trapecios',
  deltoids: 'Hombros / Deltoides',
  chest: 'Pectorales / Pecho',
  'upper-back': 'Espalda Alta / Dorsales',
  serratus: 'Serratos',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearm: 'Antebrazos',
  abs: 'Abdominales / Core',
  obliques: 'Oblicuos',
  'lower-back': 'Lumbares',
  gluteal: 'Glúteos',
  quadriceps: 'Cuádriceps',
  hamstring: 'Isquiotibiales / Femoral',
  adductors: 'Aductores',
  'hip-flexors': 'Flexores de Cadera',
  calves: 'Gemelos / Pantorrillas',
  tibialis: 'Tibiales / Espinillas',
};

// Aliases para mapear target_muscle, body_part y nombres de ejercicios a los slugs anatómicos
const ALIAS: Record<string, MuscleSlug | null> = {
  // Primarios
  abs: 'abs',
  abdominals: 'abs',
  core: 'abs',
  'lower abs': 'abs',
  chest: 'chest',
  pectorals: 'chest',
  pecho: 'chest',
  biceps: 'biceps',
  glutes: 'gluteal',
  gluteal: 'gluteal',
  glúteos: 'gluteal',
  delts: 'deltoids',
  deltoids: 'deltoids',
  shoulders: 'deltoids',
  hombros: 'deltoids',
  'rear deltoids': 'deltoids',
  'rotator cuff': 'deltoids',
  triceps: 'triceps',
  tríceps: 'triceps',
  'upper back': 'upper-back',
  'upper-back': 'upper-back',
  lats: 'upper-back',
  'latissimus dorsi': 'upper-back',
  back: 'upper-back',
  espalda: 'upper-back',
  rhomboids: 'upper-back',
  calves: 'calves',
  gemelos: 'calves',
  pantorrillas: 'calves',
  soleus: 'calves',
  quads: 'quadriceps',
  quadriceps: 'quadriceps',
  cuádriceps: 'quadriceps',
  cuadriceps: 'quadriceps',
  forearms: 'forearm',
  forearm: 'forearm',
  antebrazos: 'forearm',
  hamstrings: 'hamstring',
  hamstring: 'hamstring',
  isquios: 'hamstring',
  femorales: 'hamstring',
  femoral: 'hamstring',
  spine: 'lower-back',
  'lower back': 'lower-back',
  'lower-back': 'lower-back',
  lumbares: 'lower-back',
  traps: 'trapezius',
  trapezius: 'trapezius',
  trapecio: 'trapezius',
  trapecios: 'trapezius',
  adductors: 'adductors',
  aductores: 'adductors',
  'serratus anterior': 'serratus',
  serratus: 'serratus',
  abductors: 'gluteal',
  'levator scapulae': 'trapezius',
  obliques: 'obliques',
  oblicuos: 'obliques',
  shins: 'tibialis',
  tibialis: 'tibialis',
  'hip flexors': 'hip-flexors',
  'hip-flexors': 'hip-flexors',
  cardio: null,
  'cardiovascular system': null,
};

// Carga por grupo general si sólo se conoce body_part
const BY_BODYPART: Record<string, Partial<Record<MuscleSlug, number>>> = {
  chest: { chest: 1 },
  pecho: { chest: 1 },
  back: { 'upper-back': 0.75, 'lower-back': 0.25 },
  espalda: { 'upper-back': 0.75, 'lower-back': 0.25 },
  shoulders: { deltoids: 1 },
  hombros: { deltoids: 1 },
  'upper arms': { biceps: 0.5, triceps: 0.5 },
  brazos: { biceps: 0.5, triceps: 0.5 },
  'lower arms': { forearm: 1 },
  antebrazos: { forearm: 1 },
  waist: { abs: 0.7, obliques: 0.3 },
  abdomen: { abs: 0.7, obliques: 0.3 },
  'upper legs': { quadriceps: 0.4, hamstring: 0.35, gluteal: 0.25 },
  piernas: { quadriceps: 0.4, hamstring: 0.35, gluteal: 0.25 },
  'lower legs': { calves: 0.8, tibialis: 0.2 },
  neck: { trapezius: 1 },
  cuello: { trapezius: 1 },
};

export function canonicalMuscle(name?: string | null): MuscleSlug | null {
  if (!name) return null;
  const clean = name.toLowerCase().trim();
  if (ALIAS[clean] !== undefined) return ALIAS[clean];
  for (const key of Object.keys(ALIAS)) {
    if (clean.includes(key)) {
      return ALIAS[key];
    }
  }
  return null;
}

/**
 * Determina qué músculos entrena un ejercicio y en qué proporción (0 a 1)
 */
export function musclesOf(exercise: any): Partial<Record<MuscleSlug, number>> {
  if (!exercise) return {};
  const out: Partial<Record<MuscleSlug, number>> = {};

  const target = exercise.target_muscle || exercise.target || exercise.tg;
  const bodyPart = exercise.body_part || exercise.bp;
  const name = exercise.name || exercise.n || '';

  // 1. Músculo objetivo principal
  const primarySlug = canonicalMuscle(target);
  if (primarySlug) {
    out[primarySlug] = 1;
  }

  // 2. Músculo secundario o inferido por nombre si aplica
  const lowerName = name.toLowerCase();
  if (lowerName.includes('bench press') || lowerName.includes('push up') || lowerName.includes('press banca')) {
    out['chest'] = 1;
    out['triceps'] = Math.max(out['triceps'] || 0, 0.4);
    out['deltoids'] = Math.max(out['deltoids'] || 0, 0.4);
  } else if (lowerName.includes('squat') || lowerName.includes('sentadilla')) {
    out['quadriceps'] = 1;
    out['gluteal'] = Math.max(out['gluteal'] || 0, 0.6);
  } else if (lowerName.includes('deadlift') || lowerName.includes('peso muerto')) {
    out['hamstring'] = 1;
    out['gluteal'] = Math.max(out['gluteal'] || 0, 0.8);
    out['lower-back'] = Math.max(out['lower-back'] || 0, 0.7);
  } else if (lowerName.includes('pull up') || lowerName.includes('dominada') || lowerName.includes('lat pulldown') || lowerName.includes('row')) {
    out['upper-back'] = 1;
    out['biceps'] = Math.max(out['biceps'] || 0, 0.4);
  } else if (lowerName.includes('curl')) {
    out['biceps'] = 1;
  }

  // Si no se detectó nada por target o nombre, usar body_part
  if (Object.keys(out).length === 0 && bodyPart) {
    const cleanBp = bodyPart.toLowerCase().trim();
    if (BY_BODYPART[cleanBp]) {
      Object.assign(out, BY_BODYPART[cleanBp]);
    }
  }

  return out;
}

/**
 * Calcula la carga de entrenamiento por músculo (en series efectivas acumuladas)
 */
export function loadOf(items: Array<{ sets: number; exercise: any }>): Record<string, number> {
  const load: Record<string, number> = {};
  items.forEach(({ sets, exercise }) => {
    if (!sets) return;
    const m = musclesOf(exercise);
    for (const slug in m) {
      const weight = m[slug as MuscleSlug] || 1;
      load[slug] = (load[slug] || 0) + weight * sets;
    }
  });
  return load;
}

/**
 * Convierte las cargas acumuladas a niveles de calor del 0 al 4:
 * 0: Sin estímulo
 * 1: 1 a 3 series (activación ligera)
 * 2: 4 a 8 series (estímulo moderado)
 * 3: 9 a 14 series (estímulo óptimo de hipertrofia)
 * 4: 15+ series (alta intensidad / fatiga)
 */
export function levelsOf(load: Record<string, number>): Record<string, number> {
  const levels: Record<string, number> = {};
  MUSCLES.forEach((slug) => {
    const val = load[slug] || 0;
    if (val === 0) {
      levels[slug] = 0;
    } else if (val < 4) {
      levels[slug] = 1;
    } else if (val < 9) {
      levels[slug] = 2;
    } else if (val < 15) {
      levels[slug] = 3;
    } else {
      levels[slug] = 4;
    }
  });
  return levels;
}

// Colores de calor estilo iOS 26 Liquid Glass
export const HEAT_LEVEL_COLORS = {
  0: 'rgba(148, 163, 184, 0.22)',  // Silueta neutra frosted glass
  1: '#38bdf8',                    // Cyan eléctrico translúcido
  2: '#10b981',                    // Esmeralda vibrante
  3: '#f59e0b',                    // Oro líquido / ámbar cálido
  4: '#f43f5e',                    // Coral neón / magenta de máxima intensidad
};
