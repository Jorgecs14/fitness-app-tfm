import { useState, useEffect } from 'react';
import { Diet } from '../types/Diet';
import { DietForm } from '../components/Diet/DietForm';
import { DietList } from '../components/Diet/DietList';
import * as dietService from '../services/dietService';
import '../App.css';

export const DietsPage = () => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [editingDiet, setEditingDiet] = useState<Diet | null>(null);

  useEffect(() => {
    loadDiets();
  }, []);

  const loadDiets = async () => {
    try {
      const data = await dietService.getDiets();
      setDiets(data);
    } catch (error) {
      console.error('Error cargando dietas:', error);
    }
  };

  const handleSubmit = async (dietData: Omit<Diet, 'id'>) => {
    try {
      if (editingDiet) {
        await dietService.updateDiet(editingDiet.id, dietData);
        setEditingDiet(null);
      } else {
        await dietService.createDiet(dietData);
      }
      loadDiets();
    } catch (error) {
      console.error('Error guardando dieta:', error);
    }
  };

  const handleEdit = (diet: Diet) => {
    setEditingDiet(diet);
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