import { useState, useEffect } from 'react';
import { Client } from '../types/Client';
import { ClientForm } from '../components/Client/ClientForm';
import { ClientList } from '../components/Client/ClientList';
import * as clientService from '../services/clientService';
import '../App.css';

/**
 * Main page component for client management
 * Handles CRUD operations for fitness clients
 */
export const ClientsPage = () => {
  // State for all clients
  const [clients, setClients] = useState<Client[]>([]);
  // State for client being edited
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Load clients when component mounts
  useEffect(() => {
    console.log('Página de clientes cargada');
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  /**
   * Handle form submission for create/update
   */
  const handleSubmit = async (clientData: Omit<Client, 'id'>) => {
    try {
      if (editingClient) {
        await clientService.updateClient(editingClient.id, clientData);
        setEditingClient(null);
      } else {
        await clientService.createClient(clientData);
      }
      loadClients();
    } catch (error) {
      console.error('Error guardando cliente:', error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await clientService.deleteClient(id);
        loadClients();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
  };

  return (
    <div className="app">
      <h1>Gestión de Clientes - Entrenador Fitness</h1>
      
      <ClientForm
        onSubmit={handleSubmit}
        clientToEdit={editingClient}
        onCancelEdit={handleCancelEdit}
      />
      
      <ClientList
        clients={clients}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};