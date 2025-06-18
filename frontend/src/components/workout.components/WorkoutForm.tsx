import { useState, useEffect, FormEvent } from 'react';
import { Workout } from '../../types/Workout';

interface WorkoutFormProps {
  onSubmit: (workout: Omit<Workout, 'id'>) => void;
  workoutToEdit?: Workout | null;
  onCancelEdit?: () => void;
}

export const WorkoutForm = ({ onSubmit, workoutToEdit, onCancelEdit }: WorkoutFormProps) => {
  const [nombre, setNombre] = useState<string>('');
  const [ejercicios, setEjercicios] = useState<string>('');
  const [notas, setNotas] = useState<string>('');

  useEffect(() => {
    if (workoutToEdit) {
      setNombre(workoutToEdit.nombre);
      setEjercicios(workoutToEdit.ejercicios);
      setNotas(workoutToEdit.notas);
    } else {
      setNombre('');
      setEjercicios('');
      setNotas('');
    }
  }, [workoutToEdit]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!nombre.trim() || !ejercicios.trim() || !notas.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    onSubmit({ nombre, ejercicios, notas });
    
    if (!workoutToEdit) {
      setNombre('');
      setEjercicios('');
      setNotas('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Ejercicios"
          value={ejercicios}
          onChange={(e) => setEjercicios(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>
      <div className="form-buttons">
        <button type="submit">
          {workoutToEdit ? 'Actualizar' : 'Agregar'} Entrenamiento
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