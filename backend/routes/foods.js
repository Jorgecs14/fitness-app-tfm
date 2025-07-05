/**
 * Rutas para gestionar alimentos en la aplicación fitness-app-tfm
 * Incluye CRUD completo para alimentos con nombre, descripción y calorías
 */

const express = require('express')
const router = express.Router()
const { supabase } = require('../database/supabaseClient')

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('foods').select('*').order('id')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alimentos' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, description, calories } = req.body

    if (!name || !description || calories == null) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        received: { name, description, calories },
        missing: {
          name: !name,
          description: !description,
          calories: calories == null
        }
      })
    }

    const { data, error } = await supabase
      .from('foods')
      .insert([{ name, description, calories }])
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json(data)
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Error al crear alimento', details: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, calories } = req.body
    const { data, error } = await supabase
      .from('foods')
      .update({ name, description, calories })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar alimento' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('foods')
      .delete()
      .eq('id', id)
      .select('name')
      .single()
    if (error) throw error
    res.json({ message: `Alimento "${data.name}" eliminado correctamente` })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar alimento' })
  }
})

module.exports = router
