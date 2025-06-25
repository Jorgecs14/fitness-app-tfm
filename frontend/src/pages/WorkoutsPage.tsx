import { useState, useEffect } from 'react';
import { Workout } from '../types/Workout';
import { WorkoutForm } from '../components/Workouts/WorkoutForm';
import { WorkoutList } from '../components/Workouts/WorkoutList';
import * as workoutService from '../services/workoutService';
import '../App.css';
import { WorkoutDetail } from '../components/Workouts/workoutDetail';

export const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);
  const userId = 1;

  useEffect(() => {
    loadWorkouts();
  }, []);

  
  const loadWorkouts = async () => {
    try {
      const data = await workoutService.getWorkouts();
      setWorkouts(data.filter(w=> w.user_id === userId));
    } catch (error) {
      console.error('Error cargando entrenamientos:', error);
    }
  };

  const handleSubmit = async (workoutData: Omit<Workout, 'id'>) => {
    try {
      const workoutWithUserId = { ...workoutData, user_id: userId};
      if (editingWorkout) {
        await workoutService.updateWorkout(editingWorkout.id, workoutWithUserId);
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

  const handleViewDetails = (workout: Workout) => {
    setViewingWorkout(workout);
  };

  const handleCloseDetails = () => {
    setViewingWorkout(null);
  };

  return (
    <div className="app">
      <h1>Gestión de Entrenamientos - Entrenador Fitness</h1>
      
      <WorkoutForm
        onSubmit={handleSubmit}
        workoutToEdit={editingWorkout}
        onCancelEdit={handleCancelEdit}
        userId={1} 
      />
      
      <WorkoutList
        workouts={workouts}
        onEdit={handleEdit}
        onDelete={handleDelete} onViewDetails={handleViewDetails} 
      />
      {viewingWorkout && (
      <WorkoutDetail workout={viewingWorkout} onClose={handleCloseDetails} />
    )}    
    </div>
  );
};