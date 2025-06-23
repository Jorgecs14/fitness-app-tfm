import { useState, useEffect } from 'react';
import { Workout } from '../../types/Workout';
import { Exercise } from '../../types/Exercise';
import { getExercises } from '../../services/exerciseService';

interface SelectedExercise {
  exercise_id: number;
  sets: number;
  reps: number;
}

interface WorkoutFormProps {
  onSubmit: (workout: Omit<Workout, 'id'>, exercises?: SelectedExercise[]) => void; 
  workoutToEdit?: Workout | null; 
  onCancelEdit?: () => void; 
}

export const WorkoutForm = ({ onSubmit, workoutToEdit, onCancelEdit }: WorkoutFormProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentSets, setCurrentSets] = useState('');
  const [currentReps, setCurrentReps] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (workoutToEdit) {
      setTitle(workoutToEdit.title);
      setCategory(workoutToEdit.category);
      setNotes(workoutToEdit.notes);
    } else {
      setTitle('');
      setCategory('');
      setNotes('');
      setSelectedExercises([]);
    }
  }, [workoutToEdit]);

  const loadExercises = async () => {
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Error cargando ejercicios:', error);
    }
  };

  const handleAddExercise = () => {
    if (!currentExercise || !currentSets || !currentReps) {
      alert('Por favor completa todos los campos del ejercicio');
      return;
    }

    const exerciseId = parseInt(currentExercise);
    if (selectedExercises.some(e => e.exercise_id === exerciseId)) {
      alert('Este ejercicio ya fue agregado');
      return;
    }

    const newExercise = {
      exercise_id: exerciseId,
      sets: parseInt(currentSets),
      reps: parseInt(currentReps)
    };
    
    console.log('Agregando ejercicio:', newExercise);
    setSelectedExercises([...selectedExercises, newExercise]);

    setCurrentExercise('');
    setCurrentSets('');
    setCurrentReps('');
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises(selectedExercises.filter(e => e.exercise_id !== exerciseId));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !category.trim()) {
      alert('Favor de completar todos los campos requeridos');
      return;
    }

    console.log('Enviando workout con ejercicios:', selectedExercises);
    onSubmit({ title, category, notes }, workoutToEdit ? undefined : selectedExercises);
    
    if (!workoutToEdit) {
      setTitle('');
      setCategory('');
      setNotes('');
      setSelectedExercises([]);
    }
  };

  const getExerciseName = (exerciseId: number) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    return exercise ? exercise.name : '';
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Título del Entrenamiento"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Categoría"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
      </div>
      <div className="form-group">
        <textarea
          placeholder="Notas (opcional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {!workoutToEdit && (
        <>
          <div className="form-section">
            <h3>Agregar Ejercicios</h3>
            <div className="exercise-selector">
              <select
                value={currentExercise}
                onChange={e => setCurrentExercise(e.target.value)}
              >
                <option value="">Seleccionar ejercicio...</option>
                {exercises
                  .filter(e => !selectedExercises.some(se => se.exercise_id === e.id))
                  .map(exercise => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                placeholder="Series"
                value={currentSets}
                onChange={e => setCurrentSets(e.target.value)}
                min="1"
                style={{ width: '80px' }}
              />
              <input
                type="number"
                placeholder="Reps"
                value={currentReps}
                onChange={e => setCurrentReps(e.target.value)}
                min="1"
                style={{ width: '80px' }}
              />
              <button type="button" onClick={handleAddExercise}>
                Agregar
              </button>
            </div>

            {selectedExercises.length > 0 && (
              <div className="selected-exercises">
                <h4>Ejercicios seleccionados:</h4>
                {selectedExercises.map((exercise) => (
                  <div key={exercise.exercise_id} className="selected-exercise-item">
                    <span>
                      {getExerciseName(exercise.exercise_id)} - 
                      {exercise.sets} series x {exercise.reps} reps
                    </span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveExercise(exercise.exercise_id)}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="form-buttons">
        <button type="submit">
          {workoutToEdit ? 'Actualizar' : 'Crear'} Entrenamiento
        </button>
        {workoutToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};