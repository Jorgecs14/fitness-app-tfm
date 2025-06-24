const express = require('express');
const router = express.Router();
const supabase = require('../database/supabaseClient');

// Obtener todos los entrenamientos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('workouts').select('*').order('id');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener entrenamientos' });
  }
});

// Obtener un entrenamiento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('workouts').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar entrenamiento' });
  }
});

// Crear un nuevo entrenamiento
router.post('/', async (req, res) => {
  try {
    const { title, category, notes } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title y category son requeridos' });
    }
    const { data, error } = await supabase.from('workouts').insert([{ title, category, notes: notes || '' }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear entrenamiento' });
  }
});

// Actualizar un entrenamiento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, notes } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title y category son requeridos' });
    }
    const { data, error } = await supabase.from('workouts').update({ title, category, notes: notes || '' }).eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar entrenamiento' });
  }
});

// Eliminar un entrenamiento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('workouts').delete().eq('id', id).select('title').single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    res.json({ message: 'Entrenamiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar entrenamiento' });
  }
});

module.exports = router;