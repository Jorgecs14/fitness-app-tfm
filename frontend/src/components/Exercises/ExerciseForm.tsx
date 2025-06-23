import { useState, useEffect, FormEvent } from 'react';
import { Workout } from '../../types/Workout';

interface WorkoutFormProps {
  onSubmit: (workout: Omit<Workout, 'id'>) => void; 
  workoutToEdit?: Workout | null; 
  onCancelEdit?: () => void; 
}

export const WorkoutForm = ({ onSubmit, workoutToEdit, onCancelEdit }: WorkoutFormProps) => {
const [title, setTitle] = useState('');
const [category, setCategory] = useState('');
const [notes, setNotes] = useState('');

useEffect(() => {
    if (workoutToEdit) {
      setTitle(workoutToEdit.title);
      setCategory(workoutToEdit.category);
      setNotes(workoutToEdit.notes);
      
    } else {
      setTitle('');
      setCategory('');
      setNotes('');
      
    }
  }, [workoutToEdit]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!title.trim() || !category.trim()) {
    alert('Favor de completar todos los campos requeridos');
    return;
  }

  onSubmit({ title, category, notes });
if (!workoutToEdit) {
    setTitle('');
    setCategory('');
    setNotes('');
  }
};

return (
   <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Workout Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
      </div>
      <div className="form-group">
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
      <div className="form-buttons">
        <button type="submit">
          {workoutToEdit ? 'Update' : 'Add'} Workout
        </button>
        {workoutToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};  


