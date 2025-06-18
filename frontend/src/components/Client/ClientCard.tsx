import { Client } from '../../types/Client';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

export const ClientCard = ({ client, onEdit, onDelete }: ClientCardProps) => {
  return (
    <div className="client">
      <div className="client-info">
        <h3>{client.nombre}</h3>
        <p><strong>Email:</strong> {client.email}</p>
        <p><strong>Teléfono:</strong> {client.telefono}</p>
        <p><strong>Objetivo:</strong> {client.objetivo}</p>
      </div>
      <div className="client-actions">
        <button onClick={() => onEdit(client)}>Editar</button>
        <button onClick={() => onDelete(client.id)}>Eliminar</button>
      </div>
    </div>
  );
};