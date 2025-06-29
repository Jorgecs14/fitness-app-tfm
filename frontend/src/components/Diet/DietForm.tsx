import { useState, useEffect } from 'react';
import { Diet } from '../../types/Diet';
import { Food } from '../../types/Food';
import { User } from '../../types/User';
import { getFoods, createFood } from '../../services/foodService';
import { SelectedFood } from '../../types/DietFood';
import { DietWithFoods } from '../../types/DietWithFoods';

interface DietFormProps {
  onSubmit: (
    diet: Omit<Diet, 'id'>,
    foods?: SelectedFood[]
  ) => void;
  dietToEdit?: DietWithFoods | null;
  onCancelEdit?: () => void;
  users: User[];
}

export const DietForm = ({
  onSubmit,
  dietToEdit,
  onCancelEdit,
  users
}: DietFormProps) => {
  const [userId, setUserId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [currentFood, setCurrentFood] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');

  const [showNewFoodForm, setShowNewFoodForm] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodDescription, setNewFoodDescription] = useState('');
  const [newFoodCalories, setNewFoodCalories] = useState('');

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    if (dietToEdit) {
      setUserId(dietToEdit.user_id);
      setName(dietToEdit.name);
      setDescription(dietToEdit.description);

      if (dietToEdit.foods && Array.isArray(dietToEdit.foods)) {
        setSelectedFoods(dietToEdit.foods.map((f) => ({
          food_id: f.food_id,
          quantity: f.quantity
        })));
      }
    } else {
      setUserId('');
      setName('');
      setDescription('');
      setSelectedFoods([]);
    }
  }, [dietToEdit]);

  const loadFoods = async () => {
    try {
      const data = await getFoods();
      setFoods(data);
    } catch (error) {
      setFoods([]);
    }
  };

  const handleAddFood = () => {
    if (!currentFood || !currentQuantity) {
      alert('Por favor completa todos los campos del alimento');
      return;
    }

    const foodId = parseInt(currentFood);
    if (selectedFoods.some((f) => f.food_id === foodId)) {
      alert('Este alimento ya fue agregado');
      return;
    }

    const newFood = {
      food_id: foodId,
      quantity: parseInt(currentQuantity)
    };

    setSelectedFoods([...selectedFoods, newFood]);
    setCurrentFood('');
    setCurrentQuantity('');
  };

  const handleRemoveFood = (foodId: number) => {
    setSelectedFoods(selectedFoods.filter((f) => f.food_id !== foodId));
  };

  const handleCreateFood = async () => {
    const parsedCalories = parseInt(newFoodCalories);

    if (!newFoodName.trim() || isNaN(parsedCalories)) {
      alert('El nombre y las calorías son obligatorios');
      return;
    }

    const newFood = {
      name: newFoodName.trim(),
      description: newFoodDescription.trim(),
      calories: parsedCalories
    };

    try {
      const created = await createFood(newFood);
      setFoods((prev) => [...prev, created]);
      setNewFoodName('');
      setNewFoodDescription('');
      setNewFoodCalories('');
      setShowNewFoodForm(false);
      alert(`Alimento "${created.name}" creado correctamente`);
    } catch (error) {
      console.error('Error al crear alimento:', error);
      alert('Ocurrió un error al guardar el alimento');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId || !name.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    onSubmit(
      { user_id: userId as number, name, description },
      selectedFoods
    );

    if (!dietToEdit) {
      setUserId('');
      setName('');
      setDescription('');
      setSelectedFoods([]);
    }
  };

  const getFoodName = (foodId: number) => {
    const food = foods.find((f) => f.id === foodId);
    return food ? food.name : '';
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <select
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
          required
        >
          <option value="">Seleccionar usuario asignado</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} {user.surname}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre de la dieta"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-section">
        <h3 className="form-section-title">
          {dietToEdit ? 'Alimentos asignados' : 'Agregar alimentos a la dieta'}
        </h3>

        {selectedFoods.length > 0 ? (
          <div className="selected-foods">
            {selectedFoods.map((food) => (
              <div key={food.food_id} className="selected-food-item">
                <span>
                  {getFoodName(food.food_id)} – {food.quantity} g
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFood(food.food_id)}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No hay alimentos asignados</p>
        )}

        <div className="food-selector">
          <select
            value={currentFood}
            onChange={(e) => setCurrentFood(e.target.value)}
          >
            <option value="">Seleccionar alimento</option>
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Cantidad (g)"
            value={currentQuantity}
            onChange={(e) => setCurrentQuantity(e.target.value)}
            min="1"
          />

          <button type="button" onClick={handleAddFood}>
            Agregar alimento
          </button>
        </div>

        {!showNewFoodForm ? (
          <button
            type="button"
            onClick={() => setShowNewFoodForm(true)}
            className="new-food-toggle"
          >
            + Nuevo alimento
          </button>
        ) : (
          <div className="new-food-form">
            <input
              type="text"
              placeholder="Nombre"
              value={newFoodName}
              onChange={(e) => setNewFoodName(e.target.value)}
            />
            <textarea
              placeholder="Descripción"
              value={newFoodDescription}
              onChange={(e) => setNewFoodDescription(e.target.value)}
            />
            <input
              type="number"
              placeholder="Calorías"
              value={newFoodCalories}
              onChange={(e) => setNewFoodCalories(e.target.value)}
              min="0"
            />
            <button type="button" onClick={handleCreateFood}>
              Guardar
            </button>
          </div>
        )}
      </div>
      
      <div className="form-buttons">
        <button type="submit">
          {dietToEdit ? 'Actualizar' : 'Crear'} Dieta
        </button>
        {dietToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};