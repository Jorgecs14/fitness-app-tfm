import { Cliente } from '../types/Cliente';
import { ClienteCard } from './ClienteCard';

interface ClienteListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

export const ClienteList = ({ clientes, onEdit, onDelete }: ClienteListProps) => {
  return (
    <div className="clientes-list">
      <h2>Clientes</h2>
      {clientes.length === 0 ? (
        <p>No hay clientes registrados</p>
      ) : (
        clientes.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};