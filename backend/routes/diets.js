const express = require('express');
const router = express.Router();
const supabase = require('../database/supabaseClient');

// Obtener todas las dietas
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('diets').select('*').order('id');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener dietas' });
  }
});

// Obtener una dieta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('diets').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Dieta no encontrada' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar dieta' });
  }
});

// Crear una nueva dieta
router.post('/', async (req, res) => {
  try {
    const { name, description, calories } = req.body;
    if (!name || !description || !calories) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const { data, error } = await supabase.from('diets').insert([{ name, description, calories }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear dieta' });
  }
});

// Actualizar una dieta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, calories } = req.body;
    if (!name || !description || !calories) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const { data, error } = await supabase.from('diets').update({ name, description, calories }).eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Dieta no encontrada' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar dieta' });
  }
});

// Eliminar una dieta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('diets').delete().eq('id', id).select('name').single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Dieta no encontrada' });
    res.json({ message: 'Dieta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar dieta' });
  }
});

module.exports = router;