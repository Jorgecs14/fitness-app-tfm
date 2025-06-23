import { useState, useEffect } from 'react';
import { Exercise } from '../../types/Exercise';

interface ExerciseFormProps {
  onSubmit: (exercise: Omit<Exercise, 'id'>) => void; 
  exerciseToEdit?: Exercise | null; 
  onCancelEdit?: () => void; 
}

export const ExerciseForm = ({ onSubmit, exerciseToEdit, onCancelEdit }: ExerciseFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [executionTime, setExecutionTime] = useState('');

  useEffect(() => {
    if (exerciseToEdit) {
      setName(exerciseToEdit.name);
      setDescription(exerciseToEdit.description);
      setExecutionTime(exerciseToEdit.execution_time?.toString() || '');
    } else {
      setName('');
      setDescription('');
      setExecutionTime('');
    }
  }, [exerciseToEdit]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    onSubmit({ 
      name, 
      description, 
      execution_time: executionTime ? parseInt(executionTime) : undefined 
    });
    
    if (!exerciseToEdit) {
      setName('');
      setDescription('');
      setExecutionTime('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre del ejercicio"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          placeholder="Tiempo de ejecución (segundos)"
          value={executionTime}
          onChange={e => setExecutionTime(e.target.value)}
          min="0"
        />
      </div>
      <div className="form-buttons">
        <button type="submit">
          {exerciseToEdit ? 'Actualizar' : 'Agregar'} Ejercicio
        </button>
        {exerciseToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};