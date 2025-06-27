import { useState, useEffect } from 'react';
import { Workout } from '../types/Workout';
import { User } from '../types/User';
import { WorkoutForm } from '../components/Workouts/WorkoutForm';
import { WorkoutList } from '../components/Workouts/WorkoutList';
import { WorkoutDetail } from '../components/Workouts/WorkoutDetail';
import * as workoutService from '../services/workoutService';
import * as userService from '../services/userService'; 
import { SelectedExercise } from '../types/WorkoutExercise';
import '../App.css';
import { WorkoutWithExercises } from '../types/WorkoutWithExercises';

export const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutWithExercises | null>(null);
  const [viewingWorkoutId, setViewingWorkoutId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
    loadWorkouts();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const loadWorkouts = async () => {
    try {
      const data = await workoutService.getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error('Error cargando entrenamientos:', error);
    }
  };

const handleSubmit = async (
  workoutData: Omit<Workout, 'id'>,
  exercises?: SelectedExercise[]
) => {
  try {
    if (editingWorkout) {
      // 🔄 Actualiza los datos principales del entrenamiento
      await workoutService.updateWorkout(editingWorkout.id, workoutData);

      // 🧹 Siempre eliminar ejercicios anteriores
      await workoutService.removeAllExercisesFromWorkout(editingWorkout.id);

      // ➕ Insertar nuevos ejercicios si hay alguno seleccionado
      if (exercises && exercises.length > 0) {
        await workoutService.addExercisesToWorkout(editingWorkout.id, exercises);
      }

      setEditingWorkout(null);
    } else {
      // 🆕 Crear nuevo entrenamiento
      const createdWorkout = await workoutService.createWorkout(workoutData);

      // ➕ Asignar ejercicios si se seleccionaron
      if (exercises && exercises.length > 0) {
        await workoutService.addExercisesToWorkout(createdWorkout.id, exercises);
      }
    }

    // 🔄 Recargar lista de entrenamientos
    loadWorkouts();
  } catch (error) {
    console.error('Error guardando entrenamiento:', error);
  }
};

const handleEdit = async (workout: Workout) => {
  try {
    const fullWorkout = await workoutService.getWorkoutWithExercises(workout.id);
    setEditingWorkout(fullWorkout);
  } catch (error) {
    console.error('Error al cargar entrenamiento completo:', error);
    alert('No se pudieron cargar los ejercicios del entrenamiento');
  }
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
    setViewingWorkoutId(workout.id);
  };

  const handleCloseDetails = () => {
    setViewingWorkoutId(null);
  };

  return (
    <div className="app">
      <h1>Gestión de Entrenamientos - Entrenador Fitness</h1>

      <WorkoutForm
        users={users}
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

      {viewingWorkoutId && (
        <WorkoutDetail workoutId={viewingWorkoutId} onClose={handleCloseDetails} />
      )}
    </div>
  );
};