import { useState, useEffect, FormEvent } from 'react';
import { User } from '../../types/User';

interface UserFormProps {
  onSubmit: (user: Omit<User, 'id' | 'created_at'>) => void;
  userToEdit?: User | null;
  onCancelEdit?: () => void;
}

export const UserForm = ({ onSubmit, userToEdit, onCancelEdit }: UserFormProps) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setSurname(userToEdit.surname);
      setEmail(userToEdit.email);
      setBirthDate(userToEdit.birth_date);
      setRole(userToEdit.role);
    } else {
      setName('');
      setSurname('');
      setEmail('');
      setPassword('');
      setBirthDate('');
      setRole('');
    }
  }, [userToEdit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name || !surname || !email || (!userToEdit && !password)) {
      alert('Faltan campos obligatorios');
      return;
    }

    onSubmit({
      name,
      surname,
      email,
      password,
      birth_date: birthDate,
      role: role || 'client',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <input type="text" placeholder="Apellido" value={surname} onChange={e => setSurname(e.target.value)} />
      </div>
      <div className="form-group">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      {!userToEdit && (
        <div className="form-group">
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
      )}
      <div className="form-group">
        <input type="date" placeholder="Fecha de nacimiento" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
      </div>
      <div className="form-group">
        <input type="text" placeholder="Rol (opcional)" value={role} onChange={e => setRole(e.target.value)} />
      </div>
      <div className="form-buttons">
        <button type="submit">{userToEdit ? 'Actualizar' : 'Agregar'} Usuario</button>
        {userToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>Cancelar</button>
        )}
      </div>
    </form>
  );
};