import { Workout } from '../../types/Workout';
import { WorkoutCard } from '../../components/Workouts/WorkoutCard';


interface WorkoutListProps {
    workouts: Workout[];
    onEdit: (workout: Workout) => void;
    onDelete: (id: number) => void;
}

export const WorkoutList = ({ workouts, onEdit, onDelete }: WorkoutListProps) => {
  return (
    <div className="clients-list">
      <h2>Workouts</h2>
      {workouts.length === 0 ? (
        <p>No hay entrenamientos registrados</p>
      ) : (
        workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};
