/**
 * Servicio para parsear e importar archivos CSV de entrenamientos exportados desde
 * apps populares como Strong, Hevy o FitNotes hacia fitness-app-tfm.
 */

export interface ImportedSetRow {
  date: string;
  workoutName: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  rpe?: number;
  notes?: string;
}

export function parseWorkoutCsv(csvText: string): ImportedSetRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const header = lines[0].toLowerCase().split(',').map((h) => h.replace(/"/g, '').trim());
  const rows: ImportedSetRow[] = [];

  // Detectar dialecto de la app
  const isHevy = header.includes('title') && header.includes('exercise_title');
  const isStrong = header.includes('workout name') && header.includes('exercise name');
  const isFitNotes = header.includes('exercise') && header.includes('weight');

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 3) continue;

    if (isHevy) {
      const dateIdx = header.indexOf('start_time');
      const nameIdx = header.indexOf('title');
      const exIdx = header.indexOf('exercise_title');
      const weightIdx = header.indexOf('weight_kg');
      const repsIdx = header.indexOf('reps');
      const rpeIdx = header.indexOf('rpe');

      rows.push({
        date: cols[dateIdx] || new Date().toISOString(),
        workoutName: cols[nameIdx] || 'Entrenamiento Hevy',
        exerciseName: cols[exIdx] || 'Ejercicio',
        weightKg: parseFloat(cols[weightIdx]) || 0,
        reps: parseInt(cols[repsIdx]) || 0,
        rpe: rpeIdx !== -1 ? parseFloat(cols[rpeIdx]) || undefined : undefined,
      });
    } else if (isStrong) {
      const dateIdx = header.indexOf('date');
      const nameIdx = header.indexOf('workout name');
      const exIdx = header.indexOf('exercise name');
      const weightIdx = header.indexOf('weight');
      const repsIdx = header.indexOf('reps');
      const rpeIdx = header.indexOf('rpe');

      rows.push({
        date: cols[dateIdx] || new Date().toISOString(),
        workoutName: cols[nameIdx] || 'Entrenamiento Strong',
        exerciseName: cols[exIdx] || 'Ejercicio',
        weightKg: parseFloat(cols[weightIdx]) || 0,
        reps: parseInt(cols[repsIdx]) || 0,
        rpe: rpeIdx !== -1 ? parseFloat(cols[rpeIdx]) || undefined : undefined,
      });
    } else if (isFitNotes) {
      const dateIdx = header.indexOf('date');
      const exIdx = header.indexOf('exercise');
      const weightIdx = header.indexOf('weight');
      const repsIdx = header.indexOf('reps');

      rows.push({
        date: cols[dateIdx] || new Date().toISOString(),
        workoutName: 'Entrenamiento FitNotes',
        exerciseName: cols[exIdx] || 'Ejercicio',
        weightKg: parseFloat(cols[weightIdx]) || 0,
        reps: parseInt(cols[repsIdx]) || 0,
      });
    }
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
