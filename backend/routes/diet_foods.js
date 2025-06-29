const express = require('express');
const router = express.Router();
const supabase = require('../database/supabaseClient');

router.get('/diet/:dietId', async (req, res) => {
  const { dietId } = req.params;
  try {
    const { data, error } = await supabase
      .from('diet_foods')
      .select(`
        id,
        quantity,
        food_id,
        foods:food_id (
          name,
          description,
          calories
        )
      `)
      .eq('diet_id', dietId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alimentos de la dieta' });
  }
});

router.post('/', async (req, res) => {
  try {
    const foods = Array.isArray(req.body) ? req.body : [req.body];
    if (!foods.every(f => f.diet_id && f.food_id && f.quantity != null)) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const { data, error } = await supabase
      .from('diet_foods')
      .insert(foods)
      .select();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar alimentos a la dieta' });
  }
});

router.delete('/diet/:dietId', async (req, res) => {
  const { dietId } = req.params;
  try {
    const { error } = await supabase
      .from('diet_foods')
      .delete()
      .eq('diet_id', dietId);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'No se pudieron eliminar los alimentos' });
  }
});

module.exports = router;