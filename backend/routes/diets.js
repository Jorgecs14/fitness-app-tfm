const express = require('express');
const router = express.Router();

let diets = [
  {
    id: 1,
    nombre: 'Dieta Hipertrofia',
    descripcion: 'Alta en proteínas y calorías para ganar masa muscular.',
    calorias: 3000,
    proteinas: 150
  },
  {
    id: 2,
    nombre: 'Dieta Pérdida de Peso',
    descripcion: 'Baja en calorías y moderada en proteínas para perder peso de forma saludable.',
    calorias: 1500,
    proteinas: 100
  }
];

let nextDietId = 3;

router.get('/', (req, res) => {
  res.json(diets);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const diet = diets.find(d => d.id === id);
  if (!diet) return res.status(404).json({ error: 'Dieta no encontrada' });
  res.json(diet);
});

router.post('/', (req, res) => {
  const { nombre, descripcion, calorias, proteinas } = req.body;
  if (!nombre || !descripcion || calorias == null || proteinas == null) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  const newDiet = { id: nextDietId++, nombre, descripcion, calorias, proteinas };
  diets.push(newDiet);
  res.status(201).json(newDiet);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, descripcion, calorias, proteinas } = req.body;
  const dietIndex = diets.findIndex(d => d.id === id);
  if (dietIndex === -1) return res.status(404).json({ error: 'Dieta no encontrada' });
  if (!nombre || !descripcion || calorias == null || proteinas == null) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  diets[dietIndex] = { id, nombre, descripcion, calorias, proteinas };
  res.json(diets[dietIndex]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const dietIndex = diets.findIndex(d => d.id === id);
  if (dietIndex === -1) return res.status(404).json({ error: 'Dieta no encontrada' });
  diets.splice(dietIndex, 1);
  res.json({ message: 'Dieta eliminada correctamente' });
});

module.exports = router;