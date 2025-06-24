
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
        <p><strong>Descripcion:</strong> {exercise.description}</p>
        <p><strong>Tiempo:</strong> {exercise.executionTime} segundos </p>
      </div>
      <div className="client-actions">
        <button onClick={() => onEdit(exercise)}>Editar</button>
        <button onClick={() => onDelete(exercise.id)}>Eliminar</button>
      </div>
    </div>
  );
};



