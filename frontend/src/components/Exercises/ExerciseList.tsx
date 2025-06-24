import { Exercise } from '../../types/Exercise';
import { ExerciseCard } from '../../components/Exercises/ExerciseCard';


interface ExerciseListProps {
    exercises: Exercise[];
    onEdit: (exercise: Exercise) => void;
    onDelete: (id: number) => void;
}

export const ExerciseList = ({ exercises, onEdit, onDelete }: ExerciseListProps) => {
  return (
    <div className="clients-list">
      <h2>Ejercicios</h2>
      {exercises.length === 0 ? (
        <p>No hay entrenamientos registrados</p>
      ) : (
        exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};
