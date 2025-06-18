const express = require('express');
const router = express.Router();

let workouts = [
  {
    id: 1,
    title: 'Piernas y Glúteos',
    category: 'Fuerza',
    notes: 'Enfocado en tren inferior. 4 series de 12 repeticiones.'
  },
  {
    id: 2,
    title: 'Pecho y Tríceps',
    category: 'Hipertrofia',
    notes: 'Incluye press banca y fondos. Descanso 90 segundos.'
  }
];

let nextWorkoutId = 3;

// Obtener todos los entrenamientos
router.get('/', (req, res) => {
  res.json(workouts);
});

// Obtener un entrenamiento por ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const workout = workouts.find(w => w.id === id);
  if (!workout) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  res.json(workout);
});

// Crear un nuevo entrenamiento
router.post('/', (req, res) => {
  const { title, category, notes } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'Title y category son requeridos' });
  }
  const newWorkout = {
    id: nextWorkoutId++,
    title,
    category,
    notes: notes || ''
  };
  workouts.push(newWorkout);
  res.status(201).json(newWorkout);
});

// Actualizar un entrenamiento
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, category, notes } = req.body;
  const workoutIndex = workouts.findIndex(w => w.id === id);
  if (workoutIndex === -1) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  if (!title || !category) {
    return res.status(400).json({ error: 'Title y category son requeridos' });
  }
  workouts[workoutIndex] = { id, title, category, notes: notes || '' };
  res.json(workouts[workoutIndex]);
});

// Eliminar un entrenamiento
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const workoutIndex = workouts.findIndex(w => w.id === id);
  if (workoutIndex === -1) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  workouts.splice(workoutIndex, 1);
  res.json({ message: 'Entrenamiento eliminado correctamente' });
});

module.exports = router;