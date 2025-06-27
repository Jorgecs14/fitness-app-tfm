import { useState, useEffect } from 'react';
import { User } from '../types/User';
import { UserForm } from '../components/User/UserForm';
import { UserList } from '../components/User/UserList';
import * as userService from '../services/userService';
import '../App.css';

/**
 * Main page component for user management
 * Handles CRUD operations for users
 */
export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('Página de usuarios cargada');
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const handleSubmit = async (userData: Omit<User, 'id' | 'created_at'>) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
        setEditingUser(null);
      } else {
        await userService.createUser(userData);
      }
      loadUsers();
    } catch (error) {
      console.error('Error guardando usuario:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await userService.deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error('Error eliminando usuario:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  return (
    <div className="app">
      <h1>Gestión de Usuarios</h1>

      <UserForm
        onSubmit={handleSubmit}
        userToEdit={editingUser}
        onCancelEdit={handleCancelEdit}
      />

      <UserList
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};