/**
 * Rutas para gestionar relaciones entre dietas y alimentos en la aplicación fitness-app-tfm
 * Permite añadir, actualizar y eliminar alimentos de las dietas con sus cantidades correspondientes con Neon PostgreSQL nativo
 */

const express = require('express')
const router = express.Router()
const { pool } = require('../database/supabaseClient')

// Obtener alimentos de una dieta
router.get('/', async (req, res) => {
  try {
    const { diet_id } = req.query
    let query = `
      SELECT df.id, df.diet_id, df.food_id, df.quantity,
             f.id as food_id, f.name, f.description, f.calories
      FROM diet_foods df
      LEFT JOIN foods f ON df.food_id = f.id
    `
    const params = []
    if (diet_id) {
      query += ' WHERE df.diet_id = $1'
      params.push(diet_id)
    }
    query += ' ORDER BY df.id ASC'

    const { rows } = await pool.query(query, params)
    const formatted = rows.map((r) => ({
      id: r.id,
      diet_id: r.diet_id,
      food_id: r.food_id,
      quantity: r.quantity,
      foods: {
        id: r.food_id,
        name: r.name,
        description: r.description,
        calories: r.calories
      }
    }))
    res.json(formatted)
  } catch (err) {
    console.error('Error en GET /diet_foods:', err)
    res.status(500).json({ error: 'Error al obtener relaciones dieta-alimento', details: err.message })
  }
})

// Añadir alimento a una dieta
router.post('/', async (req, res) => {
  try {
    const { diet_id, food_id, quantity } = req.body
    if (!diet_id || !food_id || quantity == null) {
      return res.status(400).json({ error: 'Faltan campos requeridos: diet_id, food_id, quantity' })
    }

    const { rows } = await pool.query(
      `INSERT INTO diet_foods (diet_id, food_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [diet_id, food_id, Number(quantity)]
    )

    const { rows: foodRows } = await pool.query('SELECT * FROM foods WHERE id = $1', [food_id])

    res.status(201).json({
      ...rows[0],
      foods: foodRows[0] || null
    })
  } catch (err) {
    console.error('Error al añadir alimento a dieta:', err)
    res.status(500).json({ error: 'Error al añadir alimento a dieta', details: err.message })
  }
})

// Actualizar cantidad de un alimento en la dieta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    const { rows } = await pool.query(
      'UPDATE diet_foods SET quantity = $1 WHERE id = $2 RETURNING *',
      [Number(quantity), id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Relación alimento-dieta no encontrada' })
    }

    const { rows: foodRows } = await pool.query('SELECT * FROM foods WHERE id = $1', [rows[0].food_id])

    res.json({
      ...rows[0],
      foods: foodRows[0] || null
    })
  } catch (err) {
    console.error('Error al actualizar cantidad:', err)
    res.status(500).json({ error: 'Error al actualizar cantidad', details: err.message })
  }
})

// Eliminar alimento de la dieta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rowCount } = await pool.query('DELETE FROM diet_foods WHERE id = $1', [id])

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Relación alimento-dieta no encontrada' })
    }

    res.json({ message: 'Alimento eliminado de la dieta correctamente' })
  } catch (err) {
    console.error('Error al eliminar alimento:', err)
    res.status(500).json({ error: 'Error al eliminar alimento', details: err.message })
  }
})

module.exports = router
