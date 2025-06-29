import { Diet } from '../../types/Diet';

interface DietCardProps {
  diet: Diet;
  onEdit: (diet: Diet) => void;
  onDelete: (id: number) => void;
}

export const DietCard = ({ diet, onEdit, onDelete }: DietCardProps) => {
  return (
    <div className="client">
      <div className="client-info">
        <h3>{diet.name}</h3>
        <p><strong>Descripción:</strong> {diet.description}</p>
      </div>
      <div className="client-actions">
        <button onClick={() => onEdit(diet)}>Editar</button>
        <button onClick={() => onDelete(diet.id)}>Eliminar</button>
      </div>
    </div>
  );
};