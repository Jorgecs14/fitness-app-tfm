const express = require('express');
const router = express.Router();
const supabase = require('../database/supabaseClient');

// Obtener todos los registros
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('workout_exercises').select('*').order('id');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener datos de workout_exercises' });
  }
});

// Obtener por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('workout_exercises').select('*').eq('id', id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar workout_exercise' });
  }
});

// Crear un nuevo vínculo ejercicio-entrenamiento
router.post('/', async (req, res) => {
  try {
    const { workout_id, exercise_id, sets, reps } = req.body;
    if (!workout_id || !exercise_id || !sets || !reps) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { data, error } = await supabase.from('workout_exercises').insert([
      { workout_id, exercise_id, sets, reps }
    ]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear workout_exercise' });
  }
});

// Actualizar relación ejercicio-entrenamiento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sets, reps } = req.body;

    const { data, error } = await supabase.from('workout_exercises')
      .update({ sets, reps })
      .eq('id', id)
      .select().single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar workout_exercise' });
  }
});

// Eliminar relación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('workout_exercises')
      .delete()
      .eq('id', id)
      .select().single();

    if (error) throw error;
    res.json({ message: `Registro eliminado correctamente`, deleted: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar workout_exercise' });
  }
});

module.exports = router;