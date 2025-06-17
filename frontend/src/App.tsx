import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { Client } from './types/Client';
import { ClientForm } from './components/ClientForm';
import { ClientList } from './components/ClientList';
import { Workout } from './types/Workouts';
import { WorkoutForm } from './components/Workouts/WorkoutForm';
import { WorkoutList } from './components/Workouts/WorkoutList';
import * as api from './services/api';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null); //añado

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const loadWorkouts = async () => {
    try {
      const data = await api.getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error('Error cargando entrenamientos:', error);
    }
  };


  useEffect(() => {
    loadClients();
    loadWorkouts();
  }, []);


  const handleSubmit = async (clientData: Omit<Client, 'id'>) => {
    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, clientData);
        setEditingClient(null);
      } else {
        await api.createClient(clientData);
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
        await api.deleteClient(id);
        loadClients();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
  };

  const handleSubmitWorkout = async (workoutData: Omit<Workout, 'id'>) => {
    try {
      if (editingWorkout) {
        await api.updateWorkout(editingWorkout.id, workoutData);
        setEditingWorkout(null);
      } else {
        await api.createWorkout(workoutData);
      }
      loadWorkouts(); // Reload workouts list after changes
    } catch (error) {
      console.error('Error guardando entrenamiento:', error);
    }
  };


  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
  };


  const handleDeleteWorkout = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este entrenamiento?')) {
      try {
        await api.deleteWorkout(id);
        loadWorkouts();
      } catch (error) {
        console.error('Error eliminando entrenamiento:', error);
      }
    }
  };


  const handleCancelEditWorkout = () => {
    setEditingWorkout(null);
  };
  return (

    <Router>
      <div className="app">
        <h1>Gestión de Clientes - Entrenador Fitness</h1>

        <nav>
          <Link to="/">Clientes</Link> | <Link to="/workouts">Entrenamientos</Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <>
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
              </>
            }
          />
          <Route //abrimos otro route para navegar entre ellos
            path="/workouts"
            element={ /* editamos esto cuando este el api*/
              <>
                <WorkoutForm
                  onSubmit={handleSubmitWorkout}
                  workoutToEdit={editingWorkout}
                  onCancelEdit={handleCancelEditWorkout}
                />
                <WorkoutList
                  workouts={workouts}
                  onEdit={handleEditWorkout}
                  onDelete={handleDeleteWorkout}
                />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

