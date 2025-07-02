const express = require('express')
const router = express.Router()
const supabase = require('../database/supabaseClient')

// Obtener todas las dietas
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .order('id')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener dietas' })
  }
})

// Obtener todas las dietas con sus alimentos y cantidades
router.get('/with-foods', async (req, res) => {
  try {
    const { data: diets, error: dietsError } = await supabase
      .from('diets')
      .select(`
        *,
        diet_foods (
          id,
          quantity,
          food_id,
          foods (
            id,
            name,
            description,
            calories
          )
        )
      `)
      .order('id')

    if (dietsError) throw dietsError
    res.json(diets)
  } catch (err) {
    console.error('Error al obtener dietas con alimentos:', err)
    res.status(500).json({ error: 'Error al obtener dietas con alimentos' })
  }
})

// Obtener una dieta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    if (!data)
      return res.status(404).json({ error: 'Dieta no encontrada' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar dieta' })
  }
})

// Crear una dieta
router.post('/', async (req, res) => {
  try {
    const { name, description, calories } = req.body;

    if (!name || !description || calories == null) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { data, error } = await supabase
      .from('diets')
      .insert([{ name, description, calories }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear dieta' });
  }
})

// Actualizar una dieta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, calories } = req.body

    const { data, error } = await supabase
      .from('diets')
      .update({ name, description, calories })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar dieta' })
  }
})

// Eliminar una dieta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('diets')
      .delete()
      .eq('id', id)
      .select('name')
      .single()

    if (error) throw error
    if (!data)
      return res.status(404).json({ error: 'Dieta no encontrada' })
    res.json({
      message: `Dieta "${data.name}" eliminada correctamente`
    })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar dieta' })
  }
})

module.exports = router
