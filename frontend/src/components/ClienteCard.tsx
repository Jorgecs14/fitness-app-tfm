import { Cliente } from '../types/Cliente';

interface ClienteCardProps {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

export const ClienteCard = ({ cliente, onEdit, onDelete }: ClienteCardProps) => {
  return (
    <div className="cliente">
      <div className="cliente-info">
        <h3>{cliente.nombre}</h3>
        <p><strong>Email:</strong> {cliente.email}</p>
        <p><strong>Teléfono:</strong> {cliente.telefono}</p>
        <p><strong>Objetivo:</strong> {cliente.objetivo}</p>
      </div>
      <div className="cliente-actions">
        <button onClick={() => onEdit(cliente)}>Editar</button>
        <button onClick={() => onDelete(cliente.id)}>Eliminar</button>
      </div>
    </div>
  );
};