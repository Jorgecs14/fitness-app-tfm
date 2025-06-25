const express = require('express');
const router = express.Router();
const supabase = require('../database/supabaseClient');


router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('workouts').select('').order('id');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener entrenamientos' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('workouts').select('').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar entrenamiento' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { user_id, name, category, notes } = req.body;
    if (!user_id, !name,  !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { data, error } = await supabase.from('workouts').insert([
      { user_id, name, category, notes }
    ]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear entrenamiento' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, notes } = req.body;

    const { data, error } = await supabase.from('workouts')
      .update({ name, category, notes })
      .eq('id', id)
      .select().single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar entrenamiento' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from('workouts')
      .delete()
      .eq('id', id)
      .select('name')
      .single();

    if (error) throw error;
    res.json({ message: 'Entrenamiento "${data.name}": eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar entrenamiento' });
  }
});

module.exports = router;