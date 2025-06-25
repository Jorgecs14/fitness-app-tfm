
import { Workout } from '../../types/Workout';

interface WorkoutCardProps { 
    workout: Workout;
    onEdit: (workout: Workout) => void;
    onDelete: (id: number) => void;
    onViewDetails: (workout: Workout) => void
}

export const WorkoutCard = ({workout, onEdit, onDelete, onViewDetails}: WorkoutCardProps) => {
return (
    <div className="client">
      <div className="client-info">
        <h3>{workout.name}</h3>
        <p><strong>Category:</strong> {workout.category}</p>
        <p><strong>Notes:</strong> {workout.notes || 'No notes'}</p>
      </div>
      <div className="client-actions">
        <button onClick={() => onViewDetails(workout)}>Ver</button>
        <button onClick={() => onEdit(workout)}>Editar</button>
        <button onClick={() => onDelete(workout.id)}>Eliminar</button>
      </div>
    </div>
  );
};



