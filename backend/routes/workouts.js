/**
 * Rutas para gestionar entrenamientos en la aplicación fitness-app-tfm
 * Incluye CRUD de entrenamientos, gestión de ejercicios asociados y asignación a usuarios con Neon PostgreSQL nativo
 */

const express = require('express')
const router = express.Router()
const { pool } = require('../database/supabaseClient')

// Obtener todos los entrenamientos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM workouts ORDER BY id ASC')
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener entrenamientos:', err)
    res.status(500).json({ error: 'Error al obtener entrenamientos', details: err.message })
  }
})

// Obtener entrenamientos con sus ejercicios asociados
router.get('/with-exercises', async (req, res) => {
  try {
    const { rows: workouts } = await pool.query('SELECT * FROM workouts ORDER BY id ASC')
    const { rows: workoutExercises } = await pool.query(`
      SELECT we.id, we.workout_id, we.sets, we.reps, we.exercise_id,
             e.name, e.description, e.execution_time, e.body_part, e.equipment, e.target_muscle, e.gif_url
      FROM workout_exercises we
      LEFT JOIN exercises e ON we.exercise_id = e.id
    `)

    const result = workouts.map((w) => {
      const weList = workoutExercises
        .filter((we) => we.workout_id === w.id)
        .map((we) => ({
          id: we.id,
          sets: we.sets,
          reps: we.reps,
          exercises: {
            id: we.exercise_id,
            name: we.name,
            description: we.description,
            execution_time: we.execution_time,
            body_part: we.body_part,
            equipment: we.equipment,
            target_muscle: we.target_muscle,
            gif_url: we.gif_url
          }
        }))
      return {
        ...w,
        workout_exercises: weList
      }
    })

    res.json(result)
  } catch (err) {
    console.error('Error en GET /workouts/with-exercises:', err)
    res.status(500).json({ error: 'Error al obtener entrenamientos con ejercicios', details: err.message })
  }
})

// Obtener un entrenamiento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query('SELECT * FROM workouts WHERE id = $1', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Error al buscar entrenamiento:', err)
    res.status(500).json({ error: 'Error al buscar entrenamiento', details: err.message })
  }
})

// Crear un entrenamiento
router.post('/', async (req, res) => {
  try {
    const { user_id, name, category, notes } = req.body

    if (!user_id || !name || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos: user_id, name, category' })
    }

    const { rows } = await pool.query(
      `INSERT INTO workouts (user_id, name, category, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, name.trim(), category, notes || '']
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Error al crear entrenamiento:', err)
    res.status(500).json({ error: 'Error al crear entrenamiento', details: err.message })
  }
})

// Actualizar un entrenamiento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, notes } = req.body

    const { rows } = await pool.query(
      `UPDATE workouts
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [name ? name.trim() : null, category || null, notes != null ? notes : null, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    }

    res.json(rows[0])
  } catch (err) {
    console.error('Error al actualizar entrenamiento:', err)
    res.status(500).json({ error: 'Error al actualizar entrenamiento', details: err.message })
  }
})

// Eliminar un entrenamiento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await pool.query('DELETE FROM workout_exercises WHERE workout_id = $1', [id])
    const { rows } = await pool.query('DELETE FROM workouts WHERE id = $1 RETURNING name', [id])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    }

    res.json({
      message: `Entrenamiento "${rows[0].name}" eliminado correctamente`
    })
  } catch (err) {
    console.error('Error al eliminar entrenamiento:', err)
    res.status(500).json({
      error: 'Error al eliminar entrenamiento',
      details: err.message
    })
  }
})

// Obtener detalles completos de un entrenamiento con ejercicios
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params

    const { rows: workouts } = await pool.query('SELECT * FROM workouts WHERE id = $1', [id])
    const workout = workouts[0]

    if (!workout) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    }

    const { rows: exercises } = await pool.query(
      `SELECT we.id as link_id, we.exercise_id, we.sets, we.reps, e.name, e.description, e.execution_time, e.body_part, e.equipment, e.target_muscle, e.gif_url
       FROM workout_exercises we
       LEFT JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = $1`,
      [id]
    )

    res.json({
      ...workout,
      exercises
    })
  } catch (err) {
    console.error('Error en GET /workouts/:id/details:', err)
    res.status(500).json({ error: 'Error cargando detalles del entrenamiento', details: err.message })
  }
})

// Obtener usuario asignado al entrenamiento
router.get('/:id/user', async (req, res) => {
  try {
    const { id } = req.params

    const { rows } = await pool.query(
      `SELECT w.user_id, u.id, u.name, u.surname, u.email
       FROM workouts w
       LEFT JOIN users u ON w.user_id = u.id
       WHERE w.id = $1`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Workout no encontrado' })
    }

    if (!rows[0].user_id || !rows[0].id) {
      return res.json(null)
    }

    const user = {
      id: rows[0].id,
      name: rows[0].name,
      surname: rows[0].surname,
      email: rows[0].email
    }

    res.json(user)
  } catch (error) {
    console.error('Error en GET /workouts/:id/user:', error)
    res.status(500).json({ error: 'Error al obtener usuario del workout', details: error.message })
  }
})

// Cambiar usuario del entrenamiento
router.put('/:id/user/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params

    const { rows } = await pool.query(
      'UPDATE workouts SET user_id = $1 WHERE id = $2 RETURNING *',
      [userId, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Workout no encontrado' })
    }

    res.json({ message: 'Propietario cambiado correctamente', data: rows[0] })
  } catch (error) {
    console.error('Error al cambiar propietario del workout:', error)
    res.status(500).json({ error: 'Error al cambiar propietario del workout', details: error.message })
  }
})

// Quitar usuario del entrenamiento
router.delete('/:id/user', async (req, res) => {
  try {
    const { id } = req.params

    const { rows } = await pool.query(
      'UPDATE workouts SET user_id = NULL WHERE id = $1 RETURNING *',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Workout no encontrado' })
    }

    res.json({ message: 'Propietario quitado correctamente' })
  } catch (error) {
    console.error('Error al quitar propietario del workout:', error)
    res.status(500).json({ error: 'Error al quitar propietario del workout', details: error.message })
  }
})

module.exports = router
