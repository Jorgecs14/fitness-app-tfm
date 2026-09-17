/**
 * Rutas para gestionar dietas en la aplicación fitness-app-tfm
 * Incluye CRUD de dietas, gestión de alimentos asociados y asignación a usuarios con Neon PostgreSQL nativo
 */

const express = require('express')
const router = express.Router()
const { pool } = require('../database/supabaseClient')

// Obtener todas las dietas
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM diets ORDER BY id ASC')
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener dietas:', err)
    res.status(500).json({ error: 'Error al obtener dietas', details: err.message })
  }
})

// Obtener todas las dietas con sus alimentos asociados
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

// Obtener la dieta asignada a un usuario específico
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { rows: userDiets } = await pool.query(
      `SELECT d.*
       FROM user_diets ud
       JOIN diets d ON ud.diet_id = d.id
       WHERE ud.user_id = $1
       ORDER BY ud.id DESC
       LIMIT 1`,
      [userId]
    )

    if (userDiets.length === 0) {
      return res.json(null)
    }

    const diet = userDiets[0]
    const { rows: dietFoods } = await pool.query(
      `SELECT df.id, df.quantity, df.food_id,
              f.name, f.description, f.calories
       FROM diet_foods df
       LEFT JOIN foods f ON df.food_id = f.id
       WHERE df.diet_id = $1`,
      [diet.id]
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
  } catch (err) {
    console.error('Error en GET /diets/user/:userId:', err)
    res.status(500).json({ error: 'Error al obtener la dieta del usuario', details: err.message })
  }
})

// Obtener una dieta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query('SELECT * FROM diets WHERE id = $1', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dieta no encontrada' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Error al buscar dieta:', err)
    res.status(500).json({ error: 'Error al buscar dieta', details: err.message })
  }
})

// Obtener detalles completos de una dieta con sus alimentos
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

// Crear una nueva dieta
router.post('/', async (req, res) => {
  try {
    const { name, description, calories, export_template, water_liters, meals_data, supplement_products, notes } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la dieta es obligatorio' })
    }

    const cal = calories ? Math.min(Math.max(Number(calories), 500), 10000) : 2000
    const water = water_liters != null ? Math.max(0.5, Math.min(Number(water_liters), 10.0)) : 2.5
    const mealsDataJson = meals_data ? (typeof meals_data === 'string' ? meals_data : JSON.stringify(meals_data)) : null
    const supplementProductsJson = supplement_products ? (typeof supplement_products === 'string' ? supplement_products : JSON.stringify(supplement_products)) : null

    const { rows } = await pool.query(
      `INSERT INTO diets (name, description, calories, export_template, water_liters, meals_data, supplement_products, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name.trim(),
        description || '',
        cal,
        export_template || 'visual',
        water,
        mealsDataJson,
        supplementProductsJson,
        notes || ''
      ]
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Error al crear dieta:', err)
    res.status(500).json({ error: 'Error al crear dieta', details: err.message })
  }
})

// Actualizar una dieta existente (nombre, calorías, agua, comidas, suplementos, notas)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, calories, export_template, water_liters, meals_data, supplement_products, notes } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la dieta es obligatorio' })
    }

    const cal = calories ? Math.min(Math.max(Number(calories), 500), 10000) : 2000
    const water = water_liters != null ? Math.max(0.5, Math.min(Number(water_liters), 10.0)) : 2.5
    const mealsDataJson = meals_data ? (typeof meals_data === 'string' ? meals_data : JSON.stringify(meals_data)) : null
    const supplementProductsJson = supplement_products ? (typeof supplement_products === 'string' ? supplement_products : JSON.stringify(supplement_products)) : null

    const { rows } = await pool.query(
      `UPDATE diets
       SET name = $1,
           description = $2,
           calories = $3,
           export_template = COALESCE($4, export_template),
           water_liters = $5,
           meals_data = COALESCE($6, meals_data),
           supplement_products = COALESCE($7, supplement_products),
           notes = COALESCE($8, notes)
       WHERE id = $9
       RETURNING *`,
      [
        name.trim(),
        description || '',
        cal,
        export_template || null,
        water,
        mealsDataJson,
        supplementProductsJson,
        notes || '',
        id
      ]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dieta no encontrada' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error al actualizar dieta:', error)
    res.status(500).json({ error: 'Error al actualizar dieta', details: error.message })
  }
})

// Eliminar una dieta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await pool.query('DELETE FROM user_diets WHERE diet_id = $1', [id])
    await pool.query('DELETE FROM diet_foods WHERE diet_id = $1', [id])
    const { rowCount } = await pool.query('DELETE FROM diets WHERE id = $1', [id])

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Dieta no encontrada' })
    }

    res.json({ message: 'Dieta eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar dieta:', error)
    res.status(500).json({ error: 'Error al eliminar dieta', details: error.message })
  }
})

// Obtener usuarios asignados a una dieta
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

// Asignar un usuario a una dieta
router.post('/:id/users', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const existing = await pool.query(
      'SELECT * FROM user_diets WHERE diet_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (existing.rows.length > 0) {
      return res.status(200).json({ message: 'Usuario ya asignado a esta dieta', data: existing.rows[0] })
    }

    const { rows } = await pool.query(
      'INSERT INTO user_diets (diet_id, user_id) VALUES ($1, $2) RETURNING *',
      [id, userId]
    )

    res.status(201).json({ message: 'Usuario asignado correctamente', data: rows[0] })
  } catch (error) {
    console.error('Error al asignar usuario a dieta:', error)
    res.status(500).json({ error: 'Error al asignar usuario a la dieta', details: error.message })
  }
})

// Desasignar un usuario de una dieta
router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params
    await pool.query(
      'DELETE FROM user_diets WHERE diet_id = $1 AND user_id = $2',
      [id, userId]
    )
    res.json({ message: 'Usuario quitado de la dieta correctamente' })
  } catch (error) {
    console.error('Error al quitar usuario de la dieta:', error)
    res.status(500).json({ error: 'Error al quitar usuario de la dieta', details: error.message })
  }
})

// Asegurar tabla de observaciones de dieta
pool.query(`
  CREATE TABLE IF NOT EXISTS diet_observations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    diet_id INTEGER,
    note TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_diet_obs_date UNIQUE (user_id, date)
  )
`).catch(err => console.error('Error creating diet_observations table:', err.message))

// Guardar o actualizar la observación de dieta del día
router.post('/observations', async (req, res) => {
  try {
    const { user_id, diet_id, note, date } = req.body
    if (!user_id || !note) {
      return res.status(400).json({ error: 'user_id y note son requeridos' })
    }

    const targetDate = date || new Date().toISOString().split('T')[0]

    const { rows } = await pool.query(
      `INSERT INTO diet_observations (user_id, diet_id, note, date, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, date)
       DO UPDATE SET note = EXCLUDED.note, diet_id = EXCLUDED.diet_id, created_at = NOW()
       RETURNING *`,
      [user_id, diet_id || null, note.trim(), targetDate]
    )

    res.status(200).json({ message: 'Observación guardada correctamente', data: rows[0] })
  } catch (error) {
    console.error('Error guardando observación:', error)
    res.status(500).json({ error: 'Error al guardar observación', details: error.message })
  }
})

// Obtener observaciones de dieta de un usuario
router.get('/observations/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { rows } = await pool.query(
      `SELECT * FROM diet_observations
       WHERE user_id = $1
       ORDER BY date DESC, id DESC
       LIMIT 30`,
      [userId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error al obtener observaciones:', error)
    res.status(500).json({ error: 'Error al obtener observaciones' })
  }
})

// Obtener observación de hoy de un usuario
router.get('/observations/:userId/today', async (req, res) => {
  try {
    const { userId } = req.params
    const today = new Date().toISOString().split('T')[0]
    const { rows } = await pool.query(
      `SELECT * FROM diet_observations
       WHERE user_id = $1 AND date = $2
       LIMIT 1`,
      [userId, today]
    )
    res.json(rows[0] || null)
  } catch (error) {
    console.error('Error al obtener observación de hoy:', error)
    res.status(500).json({ error: 'Error al obtener observación de hoy' })
  }
})

module.exports = router
