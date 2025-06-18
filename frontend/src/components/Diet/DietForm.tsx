import { useState, useEffect, FormEvent } from 'react';
import { Diet } from '../../types/Diet';

interface DietFormProps {
  onSubmit: (diet: Omit<Diet, 'id'>) => void;
  dietToEdit?: Diet | null;
  onCancelEdit?: () => void;
}

export const DietForm = ({ onSubmit, dietToEdit, onCancelEdit }: DietFormProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [calorias, setCalorias] = useState('');
  const [proteinas, setProteinas] = useState('');

  useEffect(() => {
    if (dietToEdit) {
      setNombre(dietToEdit.nombre);
      setDescripcion(dietToEdit.descripcion);
      setCalorias(dietToEdit.calorias.toString());
      setProteinas(dietToEdit.proteinas.toString());
    } else {
      setNombre('');
      setDescripcion('');
      setCalorias('');
      setProteinas('');
    }
  }, [dietToEdit]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nombre.trim() || !descripcion.trim() || !calorias.trim() || !proteinas.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }
    onSubmit({
      nombre,
      descripcion,
      calorias: Number(calorias),
      proteinas: Number(proteinas),
    });
    if (!dietToEdit) {
      setNombre('');
      setDescripcion('');
      setCalorias('');
      setProteinas('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre de la dieta"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          placeholder="Calorías"
          value={calorias}
          onChange={(e) => setCalorias(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          placeholder="Proteínas (g)"
          value={proteinas}
          onChange={(e) => setProteinas(e.target.value)}
        />
      </div>
      <div className="form-buttons">
        <button type="submit">
          {dietToEdit ? 'Actualizar' : 'Agregar'} Dieta
        </button>
        {dietToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};