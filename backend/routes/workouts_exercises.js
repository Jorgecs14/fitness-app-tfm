/**
 * Rutas para gestionar relaciones entre entrenamientos y ejercicios en la aplicación fitness-app-tfm
 * Permite añadir, actualizar y eliminar ejercicios de los entrenamientos con sets y repeticiones con Neon PostgreSQL nativo
 */

const express = require('express')
const router = express.Router()
const { pool } = require('../database/supabaseClient')

// Obtener todas las relaciones
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM workout_exercises ORDER BY id ASC')
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener workout_exercises:', err)
    res.status(500).json({ error: 'Error al obtener datos de workout_exercises', details: err.message })
  }
})

// Obtener una relación por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query('SELECT * FROM workout_exercises WHERE id = $1', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Workout exercise no encontrado' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Error al buscar workout_exercise:', err)
    res.status(500).json({ error: 'Error al buscar workout_exercise', details: err.message })
  }
})

// Insertar ejercicios a un entrenamiento (uno o array)
router.post('/', async (req, res) => {
  try {
    const exercises = Array.isArray(req.body) ? req.body : [req.body]

    if (
      !exercises.every(
        (ex) =>
          ex.workout_id != null &&
          ex.exercise_id != null &&
          ex.sets != null &&
          ex.reps != null
      )
    ) {
      return res.status(400).json({ error: 'Faltan campos requeridos en uno o más ejercicios (workout_id, exercise_id, sets, reps)' })
    }

    const insertedRows = []
    for (const ex of exercises) {
      const { rows } = await pool.query(
        `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [ex.workout_id, ex.exercise_id, ex.sets, ex.reps]
      )
      insertedRows.push(rows[0])
    }

    res.status(201).json(Array.isArray(req.body) ? insertedRows : insertedRows[0])
  } catch (err) {
    console.error('Error al guardar ejercicios del entrenamiento:', err)
    res.status(500).json({ error: 'Error al guardar ejercicios del entrenamiento', details: err.message })
  }
})

// Actualizar sets/reps de un ejercicio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { sets, reps } = req.body

    const { rows } = await pool.query(
      `UPDATE workout_exercises
       SET sets = COALESCE($1, sets),
           reps = COALESCE($2, reps)
       WHERE id = $3
       RETURNING *`,
      [sets != null ? sets : null, reps != null ? reps : null, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Workout exercise no encontrado' })
    }

    res.json(rows[0])
  } catch (err) {
    console.error('Error al actualizar workout_exercise:', err)
    res.status(500).json({ error: 'Error al actualizar workout_exercise', details: err.message })
  }
})

// Eliminar ejercicio de un entrenamiento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rowCount } = await pool.query('DELETE FROM workout_exercises WHERE id = $1', [id])

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Workout exercise no encontrado' })
    }

    res.json({ message: 'Ejercicio eliminado del entrenamiento correctamente' })
  } catch (err) {
    console.error('Error al eliminar workout_exercise:', err)
    res.status(500).json({ error: 'Error al eliminar workout_exercise', details: err.message })
  }
})

module.exports = router
