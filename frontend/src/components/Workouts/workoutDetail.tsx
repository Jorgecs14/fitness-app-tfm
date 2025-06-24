import React, { useState, useEffect } from 'react';
import { Workout } from '../../types/Workout';
import { Exercise } from '../../types/Exercise';
import { WorkoutExerciseDetail } from '../../types/WorkoutExercise';
import { getWorkoutExercises, addExerciseToWorkout, removeExerciseFromWorkout } from '../../services/workoutExerciseService';
import { getExercises } from '../../services/exerciseService';

interface WorkoutDetailProps {
  workout: Workout;
  onClose: () => void;
}

export const WorkoutDetail: React.FC<WorkoutDetailProps> =
({ workout, onClose }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseDetail[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(()=> {
    loadData();
  }, [workout.id]);

  const loadData = async () => {
    try {
      const [exercisesData, workoutExercisesData] = await
Promise.all([
  getExercises(),
  getWorkoutExercises(workout.id)
]);
setExercises(exercisesData);
setWorkoutExercises(workoutExercisesData);
    }catch (error) {
      console.error('Error loading data:', error);
    }
};

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;

    setLoading(true);
    try {
      await addExerciseToWorkout({
        workout_id: workout.id,
        exercise_id: parseInt(selectedExercise),
        sets: sets ? parseInt(sets) : undefined,
        reps: reps ? parseInt(reps) : undefined
      });
      await loadData();
      setSelectedExercise('');
      setSets('');
      setReps('');
    } catch (error) {
      console.error('Error adding exercise:', error);
    }finally{
      setLoading(false);
    }
};
const handleRemoveExercise = async (linkId: number) => {
    if (!confirm('¿Estás seguro de eliminar este ejercicio del entrenamiento?')) return;

    try {
      await removeExerciseFromWorkout(linkId);
      await loadData();
    } catch (error) {
      console.error('Error removing exercise:', error);
    }
  };

  const availableExercises = exercises.filter(
    ex => !workoutExercises.some(we => we.id === ex.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{workout.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">Categoría: {workout.category}</p>
          {workout.notes && <p className="mt-2">{workout.notes}</p>}
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Ejercicios del Entrenamiento</h3>
          {workoutExercises.length === 0 ? (
            <p className="text-gray-500">No hay ejercicios asignados a este entrenamiento.</p>
          ) : (
            <div className="space-y-3">
              {workoutExercises.map((exercise) => (
                <div key={exercise.link_id} className="flex items-center justify-between bg-gray-50 p-4 rounded">
                  <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-gray-600">{exercise.description}</p>
                    <div className="mt-1 text-sm">
                      {exercise.sets && <span className="mr-4">Series: {exercise.sets}</span>}
                      {exercise.reps && <span>Repeticiones: {exercise.reps}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveExercise(exercise.link_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">Agregar Ejercicio</h3>
          <form onSubmit={handleAddExercise} className="flex gap-4">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              required
            >
              <option value="">Seleccionar ejercicio...</option>
              {availableExercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Series"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              className="w-20 px-3 py-2 border rounded"
              min="1"
            />
            <input
              type="number"
              placeholder="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-20 px-3 py-2 border rounded"
              min="1"
            />
            <button
              type="submit"
              disabled={loading || !selectedExercise}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Agregar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
  


