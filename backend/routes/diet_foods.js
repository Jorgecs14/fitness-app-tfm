/**
 * Rutas para gestionar relaciones entre dietas y alimentos en la aplicación fitness-app-tfm
 * Permite añadir, actualizar y eliminar alimentos de las dietas con sus cantidades correspondientes
 */

const express = require('express')
const router = express.Router()
const { supabase } = require('../database/supabaseClient')

router.get('/', async (req, res) => {
  try {
    const { diet_id } = req.query

    let query = supabase.from('diet_foods').select(`
        *,
        foods (
          id,
          name,
          description,
          calories
        )
      `)

    if (diet_id) {
      query = query.eq('diet_id', diet_id)
    }

    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Error al obtener relaciones dieta-alimento' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { diet_id, food_id, quantity } = req.body
    if (!diet_id || !food_id || quantity == null) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }
    const { data, error } = await supabase
      .from('diet_foods')
      .insert([{ diet_id, food_id, quantity }])
      .select(
        `
        *,
        foods (
          id,
          name,
          description,
          calories
        )
      `
      )
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al añadir alimento a dieta' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body
    const { data, error } = await supabase
      .from('diet_foods')
      .update({ quantity })
      .eq('id', id)
      .select(
        `
        *,
        foods (
          id,
          name,
          description,
          calories
        )
      `
      )
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cantidad' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('diet_foods')
      .delete()
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    res.json({ message: 'Alimento eliminado de la dieta' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar alimento de dieta' })
  }
})

module.exports = router
