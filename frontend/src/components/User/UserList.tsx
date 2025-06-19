import { User } from '../../types/User';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export const UserList = ({ users, onEdit, onDelete }: UserListProps) => {
  return (
    <div className="clients-list">
      <h2>Usuarios</h2>
      {users.length === 0 ? (
        <p>No hay usuarios registrados</p>
      ) : (
        users.map((user) => (
          <div className="client" key={user.id}>
            <div className="client-info">
              <h3>{user.name} {user.surname}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rol:</strong> {user.role}</p>
              <p><strong>Fecha nacimiento:</strong> {user.birth_date}</p>
              <p><small><strong>Registrado:</strong> {new Date(user.created_at).toLocaleDateString()}</small></p>
            </div>
            <div className="client-actions">
              <button onClick={() => onEdit(user)}>Editar</button>
              <button onClick={() => onDelete(user.id)}>Eliminar</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};