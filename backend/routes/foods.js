/**
 * Rutas para gestionar alimentos en la aplicación fitness-app-tfm
 * Incluye CRUD completo para alimentos con Neon PostgreSQL nativo
 */

const express = require('express')
const router = express.Router()
const { pool } = require('../database/supabaseClient')

// Obtener todos los alimentos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM foods ORDER BY name ASC')
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener alimentos:', err)
    res.status(500).json({ error: 'Error al obtener alimentos', details: err.message })
  }
})

// Crear un alimento
router.post('/', async (req, res) => {
  try {
    const { name, description, calories } = req.body

    if (!name || calories == null) {
      return res.status(400).json({ error: 'Nombre y calorías son obligatorios' })
    }

    const { rows } = await pool.query(
      `INSERT INTO foods (name, description, calories)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), description || '', Number(calories)]
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Error al crear alimento:', err)
    res.status(500).json({ error: 'Error al crear alimento', details: err.message })
  }
})

// Actualizar un alimento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, calories } = req.body

    if (!name || calories == null) {
      return res.status(400).json({ error: 'Nombre y calorías son obligatorios' })
    }

    const { rows } = await pool.query(
      `UPDATE foods
       SET name = $1, description = $2, calories = $3
       WHERE id = $4
       RETURNING *`,
      [name.trim(), description || '', Number(calories), id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alimento no encontrado' })
    }

    res.json(rows[0])
  } catch (err) {
    console.error('Error al actualizar alimento:', err)
    res.status(500).json({ error: 'Error al actualizar alimento', details: err.message })
  }
})

// Eliminar un alimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await pool.query('DELETE FROM diet_foods WHERE food_id = $1', [id])
    const { rows } = await pool.query('DELETE FROM foods WHERE id = $1 RETURNING name', [id])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alimento no encontrado' })
    }

    res.json({ message: `Alimento "${rows[0].name}" eliminado correctamente` })
  } catch (err) {
    console.error('Error al eliminar alimento:', err)
    res.status(500).json({ error: 'Error al eliminar alimento', details: err.message })
  }
})

module.exports = router
