const express = require('express');
const router = express.Router();

let workouts = [
  {
    id: 1,
    titulo: 'Entrenamiento de Piernas',
    ejercicios: [
      'Sentadillas',
      'Prensa de piernas',
      'Extensiones de cuádriceps',
      'Curl femoral'
    ],
    notas: 'Realizar 4 series de cada ejercicio, descansando 90 segundos entre series.'
  },
  {
    id: 2,
    titulo: 'Entrenamiento de Pecho',
    ejercicios: [
      'Press de banca',
      'Press inclinado con mancuernas',
      'Aperturas',
      'Fondos'
    ],
    notas: 'Enfocarse en la técnica y no en el peso.'
  }
];

let nextWorkoutId = 3;


router.get('/', (req, res) => {
  res.json(workouts);
});


router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const workout = workouts.find(w => w.id === id);
  if (!workout) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  res.json(workout);
});


router.post('/', (req, res) => {
  const { titulo, ejercicios, notas } = req.body;
  if (!titulo || !Array.isArray(ejercicios) || ejercicios.length === 0) {
    return res.status(400).json({ error: 'Título y lista de ejercicios son requeridos' });
  }
  const newWorkout = {
    id: nextWorkoutId++,
    titulo,
    ejercicios,
    notas: notas || ''
  };
  workouts.push(newWorkout);
  res.status(201).json(newWorkout);
});


router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, ejercicios, notas } = req.body;
  const workoutIndex = workouts.findIndex(w => w.id === id);
  if (workoutIndex === -1) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  if (!titulo || !Array.isArray(ejercicios) || ejercicios.length === 0) {
    return res.status(400).json({ error: 'Título y lista de ejercicios son requeridos' });
  }
  workouts[workoutIndex] = { id, titulo, ejercicios, notas: notas || '' };
  res.json(workouts[workoutIndex]);
});


router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const workoutIndex = workouts.findIndex(w => w.id === id);
  if (workoutIndex === -1) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  workouts.splice(workoutIndex, 1);
  res.json({ message: 'Entrenamiento eliminado correctamente' });
});


module.exports = router;