import { useState, useEffect } from 'react';
import './App.css';
import { Cliente } from './types/Cliente';
import { ClienteForm } from './components/ClienteForm';
import { ClienteList } from './components/ClienteList';
import * as api from './services/api';

function App() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const data = await api.getClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const handleSubmit = async (clienteData: Omit<Cliente, 'id'>) => {
    try {
      if (editingCliente) {
        await api.updateCliente(editingCliente.id, clienteData);
        setEditingCliente(null);
      } else {
        await api.createCliente(clienteData);
      }
      loadClientes();
    } catch (error) {
      console.error('Error guardando cliente:', error);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await api.deleteCliente(id);
        loadClientes();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCliente(null);
  };

  return (
    <div className="app">
      <h1>Gestión de Clientes - Entrenador Fitness</h1>
      
      <ClienteForm
        onSubmit={handleSubmit}
        clienteToEdit={editingCliente}
        onCancelEdit={handleCancelEdit}
      />
      
      <ClienteList
        clientes={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;