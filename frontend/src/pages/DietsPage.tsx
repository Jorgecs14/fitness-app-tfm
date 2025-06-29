import { useState, useEffect } from 'react';
import { Diet } from '../types/Diet';
import { DietWithFoods } from '../types/DietWithFoods';
import { User } from '../types/User';
import { DietForm } from '../components/Diet/DietForm';
import { DietList } from '../components/Diet/DietList';
import * as dietService from '../services/dietService';
import * as userService from '../services/userService';
import * as dietFoodService from '../services/dietFoodService';
import '../App.css';

export const DietsPage = () => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [editingDiet, setEditingDiet] = useState<DietWithFoods | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadDiets();
    loadUsers();
  }, []);

  const loadDiets = async () => {
    try {
      const data = await dietService.getDiets();
      setDiets(data);
    } catch (error) {
      console.error('Error cargando dietas:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      setUsers([]);
    }
  };

  const handleSubmit = async (dietData: Omit<Diet, 'id'>, foodsToSave?: any[]) => {
    try {
      let dietId = editingDiet ? editingDiet.id : null;
      if (editingDiet) {
        await dietService.updateDiet(editingDiet.id, dietData);
        await dietFoodService.removeAllFoodsFromDiet(editingDiet.id);
        dietId = editingDiet.id;
        setEditingDiet(null);
      } else {
        const newDiet = await dietService.createDiet(dietData);
        dietId = newDiet.id;
      }
      // Guarda los alimentos seleccionados
      if (dietId && foodsToSave && foodsToSave.length > 0) {
        await dietFoodService.addFoodsToDiet(dietId, foodsToSave);
      }
      loadDiets();
    } catch (error) {
      console.error('Error guardando dieta:', error);
    }
  };

  const handleEdit = async (diet: Diet) => {
    try {
      const fullDiet = await dietService.getDietWithFoods(diet.id);
      setEditingDiet(fullDiet);
    } catch (error) {
      setEditingDiet(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta dieta?')) {
      try {
        await dietService.deleteDiet(id);
        loadDiets();
      } catch (error) {
        console.error('Error eliminando dieta:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingDiet(null);
  };

  return (
    <div className="app">
      <h1>Gestión de Dietas - Entrenador Fitness</h1>
      <DietForm
        users={users}
        onSubmit={handleSubmit}
        dietToEdit={editingDiet}
        onCancelEdit={handleCancelEdit}
      />
      <DietList
        diets={diets}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};