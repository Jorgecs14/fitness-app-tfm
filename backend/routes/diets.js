/**
 * Rutas para gestionar dietas en la aplicación fitness-app-tfm
 * Incluye CRUD de dietas, gestión de alimentos asociados y asignación a usuarios
 */

const express = require('express')
const router = express.Router()
const { supabase } = require('../database/supabaseClient')

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('diets').select('*').order('id')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener dietas' })
  }
})

router.get('/with-foods', async (req, res) => {
  try {
    const { data: diets, error: dietsError } = await supabase
      .from('diets')
      .select('*')
      .order('id')

    if (dietsError) {
      throw dietsError
    }

    const { data: dietsWithFoods, error: joinError } = await supabase
      .from('diets')
      .select(
        `
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
      `
      )
      .order('id')

    if (joinError) {
      const dietsOnly = diets.map((diet) => ({
        ...diet,
        diet_foods: []
      }))
      return res.json(dietsOnly)
    }

    res.json(dietsWithFoods)
  } catch (err) {
    res.status(500).json({
      error: 'Error al obtener dietas con alimentos',
      details: err.message,
      stack: err.stack
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('diets')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Dieta no encontrada' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar dieta' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, description, calories } = req.body

    if (!name || !description || calories == null) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    const { data, error } = await supabase
      .from('diets')
      .insert([{ name, description, calories }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al crear dieta' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, calories } = req.body

    if (!name || !description || calories == null) {
      return res.status(400).json({
        error: 'Todos los campos son requeridos',
        received: { name, description, calories }
      })
    }

    const { data, error } = await supabase
      .from('diets')
      .update({ name, description, calories })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return res.status(404).json({ error: 'Dieta no encontrada' })
    }

    res.json(data)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al actualizar dieta', details: error.message })
  }
})

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
    if (!data) return res.status(404).json({ error: 'Dieta no encontrada' })
    res.json({ message: 'Dieta eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar dieta' })
  }
})

router.get('/:id/users', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('user_diets')
      .select('user_id, users(id, name, surname, email)')
      .eq('diet_id', id)

    if (error) {
      throw error
    }

    const users = data.map((item) => item.users)

    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios de la dieta' })
  }
})

router.post('/:id/users', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const { data, error } = await supabase
      .from('user_diets')
      .insert([{ diet_id: id, user_id: userId }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res
          .status(400)
          .json({ error: 'El usuario ya está asignado a esta dieta' })
      }
      throw error
    }

    res.status(201).json({ message: 'Usuario asignado correctamente', data })
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar usuario a la dieta' })
  }
})

router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params

    const { data, error } = await supabase
      .from('user_diets')
      .delete()
      .eq('diet_id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return res
        .status(404)
        .json({ error: 'Relación usuario-dieta no encontrada' })
    }

    res.json({ message: 'Usuario quitado de la dieta correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al quitar usuario de la dieta' })
  }
})

router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('diets')
      .select(
        `
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
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return res.status(404).json({ error: 'Dieta no encontrada' })
    }

    res.json(data)
  } catch (error) {
    res
      .status(500)
      .json({
        error: 'Error al obtener detalles de la dieta',
        details: error.message
      })
  }
})

module.exports = router
