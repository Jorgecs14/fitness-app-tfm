import { useState, useEffect } from 'react';
import { Workout } from '../../types/Workout';
import { Exercise } from '../../types/Exercise';
import { User } from '../../types/User';
import { getExercises, createExercise } from '../../services/exerciseService';
import { SelectedExercise } from '../../types/WorkoutExercise'; 
import { WorkoutWithExercises } from '../../types/WorkoutWithExercises';

interface WorkoutFormProps {
  onSubmit: (
    workout: Omit<Workout, 'id'>,
    exercises?: SelectedExercise[]
  ) => void;
  workoutToEdit?: WorkoutWithExercises | null;
  onCancelEdit?: () => void;
  users: User[];
}

export const WorkoutForm = ({
  onSubmit,
  workoutToEdit,
  onCancelEdit,
  users
}: WorkoutFormProps) => {
  const [userId, setUserId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentSets, setCurrentSets] = useState('');
  const [currentReps, setCurrentReps] = useState('');

  const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseTime, setNewExerciseTime] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

useEffect(() => {
  console.log('🧪 workoutToEdit:', workoutToEdit);

  if (workoutToEdit) {
    setUserId(workoutToEdit.user_id);
    setName(workoutToEdit.name);
    setCategory(workoutToEdit.category);
    setNotes(workoutToEdit.notes);

    if (workoutToEdit.exercises && Array.isArray(workoutToEdit.exercises)) {
      const initialExercises = workoutToEdit.exercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps
      }));
      setSelectedExercises(initialExercises);
    }
  } else {
    setUserId('');
    setName('');
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
  if (selectedExercises.some((e) => e.exercise_id === exerciseId)) {
    alert('Este ejercicio ya fue agregado');
    return;
  }

  const newExercise = {
    exercise_id: exerciseId,
    sets: parseInt(currentSets),
    reps: parseInt(currentReps)
  };

  setSelectedExercises([...selectedExercises, newExercise]);
  setCurrentExercise('');
  setCurrentSets('');
  setCurrentReps('');
};

  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises(selectedExercises.filter((e) => e.exercise_id !== exerciseId));
  };

  const handleCreateExercise = async () => {
  const parsedTime = parseInt(newExerciseTime);
  
  if (!newExerciseName.trim() || isNaN(parsedTime)) {
    alert('El nombre y un tiempo de ejecución válido son obligatorios');
    return;
  }

  const newExercise = {
    name: newExerciseName.trim(),
    description: newExerciseDescription.trim(),
    execution_time: parsedTime
  };

  console.log('📤 Enviando ejercicio al backend:', newExercise);

  try {
    const created = await createExercise(newExercise);
    setExercises((prev) => [...prev, created]);
    setNewExerciseName('');
    setNewExerciseDescription('');
    setNewExerciseTime('');
    setShowNewExerciseForm(false);
    alert(`Ejercicio "${created.name}" creado correctamente`);
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    alert('Ocurrió un error al guardar el ejercicio');
  }
};

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId || !name.trim() || !category.trim()) {
      alert('Favor de completar todos los campos requeridos');
      return;
    }

onSubmit(
  { user_id: userId as number, name, category, notes },
  selectedExercises
);

    if (!workoutToEdit) {
      setUserId('');
      setName('');
      setCategory('');
      setNotes('');
      setSelectedExercises([]);
    }
  };

  const getExerciseName = (exerciseId: number) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    return exercise ? exercise.name : '';
  };

  return (
    <form onSubmit={handleSubmit} className="form">
  {/* Selección de usuario */}
  <div className="form-group">
    <select
      value={userId}
      onChange={(e) => setUserId(Number(e.target.value))}
      required
    >
      <option value="">Seleccionar usuario asignado</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name} {user.surname}
        </option>
      ))}
    </select>
  </div>

  {/* Título, categoría y notas */}
  <div className="form-group">
    <input
      type="text"
      placeholder="Título del entrenamiento"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </div>

  <div className="form-group">
    <input
      type="text"
      placeholder="Categoría"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    />
  </div>

  <div className="form-group">
    <textarea
      placeholder="Notas (opcional)"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  </div>

  {/* Sección de ejercicios */}
  <div className="form-section">
    <h3 className="form-section-title">
      {workoutToEdit ? 'Ejercicios asignados' : 'Agregar ejercicios al entrenamiento'}
    </h3>

    {selectedExercises.length > 0 ? (
      <div className="selected-exercises">
        {selectedExercises.map((exercise) => (
          <div key={exercise.exercise_id} className="selected-exercise-item">
            <span>
              {getExerciseName(exercise.exercise_id)} – {exercise.sets}×{exercise.reps}
            </span>
            {(
              <button
                type="button"
                onClick={() => handleRemoveExercise(exercise.exercise_id)}
              >
                Quitar
              </button>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted">No hay ejercicios asignados</p>
    )}

    {/* Selector de ejercicios */}
    <div className="exercise-selector">
      <select
        value={currentExercise}
        onChange={(e) => setCurrentExercise(e.target.value)}
      >
        <option value="">Seleccionar ejercicio</option>
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Series"
        value={currentSets}
        onChange={(e) => setCurrentSets(e.target.value)}
        min="1"
      />

      <input
        type="number"
        placeholder="Repeticiones"
        value={currentReps}
        onChange={(e) => setCurrentReps(e.target.value)}
        min="1"
      />

      <button type="button" onClick={handleAddExercise}>
        Agregar ejercicio
      </button>
    </div>

    {/* Botón y formulario para crear nuevo ejercicio */}
    {!showNewExerciseForm ? (
      <button
        type="button"
        onClick={() => setShowNewExerciseForm(true)}
        className="new-exercise-toggle"
      >
        + Nuevo ejercicio
      </button>
    ) : (
      <div className="new-exercise-form">
        <input
          type="text"
          placeholder="Nombre"
          value={newExerciseName}
          onChange={(e) => setNewExerciseName(e.target.value)}
        />
        <textarea
          placeholder="Descripción"
          value={newExerciseDescription}
          onChange={(e) => setNewExerciseDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Tiempo (segundos)"
          value={newExerciseTime}
          onChange={(e) => setNewExerciseTime(e.target.value)}
          min="1"
        />
        <button type="button" onClick={handleCreateExercise}>
          Guardar
        </button>
      </div>
    )}
  </div>

  {/* Botones finales */}
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