import { Client } from '../types/Client';
import { ClientCard } from './Client/ClientCard';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

export const ClientList = ({ clients, onEdit, onDelete }: ClientListProps) => {
  return (
    <div className="clients-list">
      <h2>Clientes</h2>
      {clients.length === 0 ? (
        <p>No hay clientes registrados</p>
      ) : (
        clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};