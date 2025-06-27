import { useState, useEffect, FormEvent } from 'react';
import { Diet } from '../../types/Diet';

interface DietFormProps {
  onSubmit: (diet: Omit<Diet, 'id'>) => void;
  dietToEdit?: Diet | null;
  onCancelEdit?: () => void;
}

export const DietForm = ({ onSubmit, dietToEdit, onCancelEdit }: DietFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');

  useEffect(() => {
    if (dietToEdit) {
      setName(dietToEdit.name);
      setDescription(dietToEdit.description);
      setCalories(dietToEdit.calories.toString());
    } else {
      setName('');
      setDescription('');
      setCalories('');
    }
  }, [dietToEdit]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !calories.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }
    onSubmit({
      name,
      description,
      calories: Number(calories),
    });
    if (!dietToEdit) {
      setName('');
      setDescription('');
      setCalories('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre de la dieta"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          placeholder="Calorías"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
      </div>
      <div className="form-buttons">
        <button type="submit">
          {dietToEdit ? 'Actualizar' : 'Agregar'} Dieta
        </button>
        {dietToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};