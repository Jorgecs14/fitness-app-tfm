import { useState, useEffect } from 'react';
import { Exercise } from '../types/Exercise';
import { ExerciseForm } from '../components/Exercises/ExerciseForm';
import { ExerciseList } from '../components/Exercises/ExerciseList';
import * as exerciseService from '../services/exerciseService';
import '../App.css';

export const ExercisesPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await exerciseService.getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Error cargando ejercicios:', error);
    }
  };

  const handleSubmit = async (exerciseData: Omit<Exercise, 'id'>) => {
    try {
      if (editingExercise) {
        await exerciseService.updateExercise(editingExercise.id, exerciseData);
        setEditingExercise(null);
      } else {
        await exerciseService.createExercise(exerciseData);
      }
      loadExercises();
    } catch (error) {
      console.error('Error guardando ejercicio:', error);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este ejercicio?')) {
      try {
        await exerciseService.deleteExercise(id);
        loadExercises();
      } catch (error) {
        console.error('Error eliminando ejercicio:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
  };

  return (
    <div className="app">
      <h1>Gestión de Ejercicios</h1>
      
      <ExerciseForm
        onSubmit={handleSubmit}
        exerciseToEdit={editingExercise}
        onCancelEdit={handleCancelEdit}
      />
      
      <ExerciseList
        exercises={exercises}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};