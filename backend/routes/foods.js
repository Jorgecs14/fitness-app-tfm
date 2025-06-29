const express = require('express');
const router = express.Router();
const supabase = require('../database/supabaseClient');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .order('id');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alimentos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Alimento no encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alimento' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, calories } = req.body;
    if (!name || !calories) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const { data, error } = await supabase
      .from('foods')
      .insert([{ name, description, calories }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear alimento' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, calories } = req.body;
    const { data, error } = await supabase
      .from('foods')
      .update({ name, description, calories })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar alimento' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('foods')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ message: 'Alimento eliminado', deleted: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar alimento' });
  }
});

module.exports = router;