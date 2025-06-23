import { useState, useEffect } from 'react';
import { Workout } from '../types/Workout';
import { WorkoutForm } from '../components/Workouts/WorkoutForm';
import { WorkoutList } from '../components/Workouts/WorkoutList';
import { WorkoutDetail } from '../components/Workouts/WorkoutDetail';
import * as workoutService from '../services/workoutService';
import { addExerciseToWorkout } from '../services/workoutExerciseService';
import '../App.css';

export const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [detailWorkout, setDetailWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const data = await workoutService.getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error('Error cargando entrenamientos:', error);
    }
  };

  const handleSubmit = async (workoutData: Omit<Workout, 'id'>, exercises?: any[]) => {
    try {
      if (editingWorkout) {
        await workoutService.updateWorkout(editingWorkout.id, workoutData);
        setEditingWorkout(null);
      } else {
        console.log('Creando workout con ejercicios:', exercises);
        const newWorkout = await workoutService.createWorkout(workoutData);
        console.log('Workout creado:', newWorkout);
        
        // Si hay ejercicios seleccionados, agregarlos al workout
        if (exercises && exercises.length > 0 && newWorkout.id) {
          console.log('Agregando ejercicios al workout', newWorkout.id);
          for (const exercise of exercises) {
            try {
              await addExerciseToWorkout({
                workout_id: newWorkout.id,
                exercise_id: exercise.exercise_id,
                sets: exercise.sets,
                reps: exercise.reps
              });
              console.log('Ejercicio agregado:', exercise);
            } catch (error) {
              console.error('Error agregando ejercicio:', error);
            }
          }
        }
      }
      loadWorkouts();
    } catch (error) {
      console.error('Error guardando entrenamiento:', error);
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este entrenamiento?')) {
      try {
        await workoutService.deleteWorkout(id);
        loadWorkouts();
      } catch (error) {
        console.error('Error eliminando entrenamiento:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingWorkout(null);
  };

  const handleViewDetails = (workout: Workout) => {
    setDetailWorkout(workout);
  };

  return (
    <div className="app">
      <h1>Gestión de Entrenamientos - Entrenador Fitness</h1>
      
      <WorkoutForm
        onSubmit={handleSubmit}
        workoutToEdit={editingWorkout}
        onCancelEdit={handleCancelEdit}
      />
      
      <WorkoutList
        workouts={workouts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

      {detailWorkout && (
        <WorkoutDetail
          workout={detailWorkout}
          onClose={() => setDetailWorkout(null)}
        />
      )}
    </div>
  );
};