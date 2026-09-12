/**
 * Rutas para gestionar dietas en la aplicación fitness-app-tfm
 * Incluye CRUD de dietas, gestión de alimentos asociados y asignación a usuarios
 */

const express = require('express')
const router = express.Router()
const { supabase, supabaseAdmin, pool } = require('../database/supabaseClient')

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('diets').select('*').order('id')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener dietas' })
  }
})

router.get('/with-foods', async (req, res) => {
  try {
    const { rows: diets } = await pool.query('SELECT * FROM diets ORDER BY id ASC')
    const { rows: dietFoods } = await pool.query(`
      SELECT df.id, df.diet_id, df.quantity, df.food_id,
             f.name, f.description, f.calories
      FROM diet_foods df
      LEFT JOIN foods f ON df.food_id = f.id
    `)

    const dietsWithFoods = diets.map((diet) => {
      const foods = dietFoods
        .filter((df) => df.diet_id === diet.id)
        .map((df) => ({
          id: df.id,
          quantity: df.quantity,
          food_id: df.food_id,
          foods: {
            id: df.food_id,
            name: df.name,
            description: df.description,
            calories: df.calories
          }
        }))
      return {
        ...diet,
        diet_foods: foods
      }
    })

    res.json(dietsWithFoods)
  } catch (err) {
    console.error('Error en GET /diets/with-foods:', err)
    res.status(500).json({
      error: 'Error al obtener dietas con alimentos',
      details: err.message
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

    const { rows: users } = await pool.query(
      `SELECT u.id, u.name, u.surname, u.email
       FROM user_diets ud
       JOIN users u ON ud.user_id = u.id
       WHERE ud.diet_id = $1`,
      [id]
    )

    res.json(users)
  } catch (error) {
    console.error('Error en GET /diets/:id/users:', error)
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

    const { rows: diets } = await pool.query('SELECT * FROM diets WHERE id = $1', [id])
    const diet = diets[0]

    if (!diet) {
      return res.status(404).json({ error: 'Dieta no encontrada' })
    }

    const { rows: dietFoods } = await pool.query(
      `SELECT df.id, df.quantity, df.food_id,
              f.name, f.description, f.calories
       FROM diet_foods df
       LEFT JOIN foods f ON df.food_id = f.id
       WHERE df.diet_id = $1`,
      [id]
    )

    const formattedFoods = dietFoods.map((df) => ({
      id: df.id,
      quantity: df.quantity,
      food_id: df.food_id,
      foods: {
        id: df.food_id,
        name: df.name,
        description: df.description,
        calories: df.calories
      }
    }))

    res.json({
      ...diet,
      diet_foods: formattedFoods
    })
  } catch (error) {
    console.error('Error en GET /diets/:id/details:', error)
    res.status(500).json({
      error: 'Error al obtener detalles de la dieta',
      details: error.message
    })
  }
})

module.exports = router
