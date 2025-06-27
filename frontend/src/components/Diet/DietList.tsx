import { Diet } from '../../types/Diet';

interface DietListProps {
  diets: Diet[];
  onEdit: (diet: Diet) => void;
  onDelete: (id: number) => void;
}

export const DietList = ({ diets, onEdit, onDelete }: DietListProps) => {
  return (
    <div className="clients-list">
      <h2>Dietas</h2>
      {diets.length === 0 ? (
        <p>No hay dietas registradas</p>
      ) : (
        diets.map((diet) => (
          <div className="client" key={diet.id}>
            <div className="client-info">
              <h3>{diet.name}</h3>
              <p><strong>Descripción:</strong> {diet.description}</p>
              <p><strong>Calorías:</strong> {diet.calories}</p>
            </div>
            <div className="client-actions">
              <button onClick={() => onEdit(diet)}>Editar</button>
              <button onClick={() => onDelete(diet.id)}>Eliminar</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};