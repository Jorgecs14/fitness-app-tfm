import { Exercise } from '../../types/Exercise';

interface ExerciseCardProps { 
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: number) => void;
}

export const ExerciseCard = ({exercise, onEdit, onDelete}: ExerciseCardProps) => {
  return (
    <div className="client">
      <div className="client-info">
        <h3>{exercise.name}</h3>
        <p><strong>Descripción:</strong> {exercise.description}</p>
        {exercise.execution_time && (
          <p><strong>Tiempo:</strong> {exercise.execution_time} segundos</p>
        )}
      </div>
      <div className="client-actions">
        <button onClick={() => onEdit(exercise)}>Editar</button>
        <button onClick={() => onDelete(exercise.id)}>Eliminar</button>
      </div>
    </div>
  );
};