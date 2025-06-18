import { useState, useEffect } from 'react';
import { Workout } from '../types/Workout';
import { WorkoutForm } from '../components/workout.components/WorkoutForm';
import { WorkoutList } from '../components/workout.components/WorkoutList';
import * as workoutService from '../services/workoutService';
import '../App.css';

export const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

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

  const handleSubmit = async (workoutData: Omit<Workout, 'id'>) => {
    try {
      if (editingWorkout) {
        await workoutService.updateWorkout(editingWorkout.id, workoutData);
        setEditingWorkout(null);
      } else {
        await workoutService.createWorkout(workoutData);
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
      />
    </div>
  );
};