/**
 * Motor de Sobrecarga Progresiva
 * Adapta y calcula los nuevos pesos/repeticiones para el próximo entrenamiento
 * según el rendimiento previo del usuario.
 */

export type ProgressionPolicy = 'linear' | 'double_progression' | 'rpe' | 'greyskull';

export interface ProgressionInput {
  policy: ProgressionPolicy;
  currentWeight: number;
  currentReps: number;
  targetReps: number;
  minReps?: number;
  maxReps?: number;
  actualRpe?: number;
  targetRpe?: number;
  weightIncrement?: number; // Por defecto 2.5kg
}

export interface ProgressionResult {
  nextWeight: number;
  nextReps: number;
  message: string;
  advanced: boolean; // Indica si se superó la meta y se subió de peso
}

export function calculateNextProgression(input: ProgressionInput): ProgressionResult {
  const increment = input.weightIncrement || 2.5;
  const currentW = input.currentWeight || 0;

  switch (input.policy) {
    case 'linear': {
      // Progresión Lineal: Si cumplió todas las repeticiones objetivo, incrementa peso
      if (input.currentReps >= input.targetReps) {
        return {
          nextWeight: currentW + increment,
          nextReps: input.targetReps,
          message: `¡Meta alcanzada! Subes +${increment}kg para la próxima sesión.`,
          advanced: true,
        };
      }
      return {
        nextWeight: currentW,
        nextReps: input.targetReps,
        message: `Mantén el peso de ${currentW}kg hasta completar ${input.targetReps} reps.`,
        advanced: false,
      };
    }

    case 'double_progression': {
      // Doble Progresión: Rango de reps (ej. 8-12)
      const minR = input.minReps || 8;
      const maxR = input.maxReps || 12;

      if (input.currentReps >= maxR) {
        return {
          nextWeight: currentW + increment,
          nextReps: minR,
          message: `Alcanzado el máximo de ${maxR} reps. Subes +${increment}kg y reinicias en ${minR} reps.`,
          advanced: true,
        };
      }
      return {
        nextWeight: currentW,
        nextReps: Math.min(input.currentReps + 1, maxR),
        message: `Consolida peso. Intenta lograr ${Math.min(input.currentReps + 1, maxR)} reps con ${currentW}kg.`,
        advanced: false,
      };
    }

    case 'rpe': {
      // Auto-regulación RPE (Target RPE vs Actual RPE)
      const targetRpe = input.targetRpe || 8;
      const actualRpe = input.actualRpe || 8;
      const rpeDiff = targetRpe - actualRpe;

      if (rpeDiff >= 1) {
        // La serie se sintió muy fácil (RPE menor al objetivo)
        const bonus = rpeDiff * (increment / 2);
        return {
          nextWeight: currentW + bonus,
          nextReps: input.targetReps,
          message: `RPE ${actualRpe} por debajo del objetivo (${targetRpe}). Incrementas +${bonus}kg.`,
          advanced: true,
        };
      } else if (rpeDiff <= -1.5) {
        // La serie se sintió demasiado dura (RPE mayor al objetivo)
        const penalty = Math.abs(rpeDiff) * (increment / 2);
        return {
          nextWeight: Math.max(0, currentW - penalty),
          nextReps: input.targetReps,
          message: `RPE ${actualRpe} excedió el objetivo. Descargas -${penalty}kg para mayor control.`,
          advanced: false,
        };
      }

      return {
        nextWeight: currentW,
        nextReps: input.targetReps,
        message: `RPE perfecto (${actualRpe}). Mantén ${currentW}kg.`,
        advanced: false,
      };
    }

    default: {
      return {
        nextWeight: currentW,
        nextReps: input.targetReps,
        message: `Mantén la carga actual de ${currentW}kg.`,
        advanced: false,
      };
    }
  }
}
