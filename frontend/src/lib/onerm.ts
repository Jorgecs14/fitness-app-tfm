/**
 * Módulo de estimación de 1RM (Una Repetición Máxima) y récords personales
 * Basado y adaptado del motor de cálculo de openGym
 */

export const REP_CAP = 12; // A partir de 12 repeticiones el cálculo pierde precisión como fuerza pura

/**
 * Estima el 1RM usando la fórmula de Epley: 1RM = w * (1 + r / 30)
 */
export function estimate1RMEpley(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const cappedReps = Math.min(reps, REP_CAP);
  return weight * (1 + cappedReps / 30);
}

/**
 * Estima el 1RM usando la fórmula de Brzycki: 1RM = w * (36 / (37 - r))
 */
export function estimate1RMBrzycki(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const cappedReps = Math.min(reps, 36);
  return weight * (36 / (37 - cappedReps));
}

/**
 * Estima el 1RM predeterminado (Epley redondeado a medio kilo/libra)
 */
export function estimate1RM(weight: number, reps: number): number {
  const raw = estimate1RMEpley(weight, reps);
  return Math.round(raw * 2) / 2;
}

/**
 * Calcula el tonelaje o volumen de trabajo de una serie (Peso x Repeticiones)
 */
export function calculateSetVolume(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * reps;
}
