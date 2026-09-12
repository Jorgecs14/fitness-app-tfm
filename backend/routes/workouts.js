/**
 * Rutas para gestionar entrenamientos en la aplicación fitness-app-tfm
 * Incluye CRUD de entrenamientos, gestión de ejercicios asociados y asignación a usuarios
 */

const express = require('express')
const router = express.Router()
const { supabase, supabaseAdmin, pool } = require('../database/supabaseClient')

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('id')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener entrenamientos' })
  }
})

router.get('/with-exercises', async (req, res) => {
  try {
    const { rows: workouts } = await pool.query('SELECT * FROM workouts ORDER BY id ASC')
    const { rows: workoutExercises } = await pool.query(`
      SELECT we.id, we.workout_id, we.sets, we.reps, we.exercise_id,
             e.name, e.description, e.execution_time
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
            execution_time: we.execution_time
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
    res.status(500).json({ error: 'Error al obtener entrenamientos con ejercicios' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    if (!data)
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar entrenamiento' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { user_id, name, category, notes } = req.body

    if (!user_id || !name || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    const { data, error } = await supabase
      .from('workouts')
      .insert([{ user_id, name, category, notes }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al crear entrenamiento' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, notes } = req.body

    const { data, error } = await supabase
      .from('workouts')
      .update({ name, category, notes })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar entrenamiento' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error: deleteExercisesError } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', id)

    if (deleteExercisesError) {
      throw deleteExercisesError
    }

    const { data, error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .select('name')
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    }

    res.json({
      message: `Entrenamiento "${data.name}" eliminado correctamente`
    })
  } catch (err) {
    res.status(500).json({
      error: 'Error al eliminar entrenamiento',
      details: err.message
    })
  }
})

router.get('/:id/full', async (req, res) => {
  try {
    const { id } = req.params

    const { rows: workouts } = await pool.query('SELECT * FROM workouts WHERE id = $1', [id])
    const workout = workouts[0]

    if (!workout) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    }

    const { rows: workoutExercises } = await pool.query(
      `SELECT we.id as link_id, we.sets, we.reps, e.id, e.name, e.description, e.execution_time
       FROM workout_exercises we
       LEFT JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = $1`,
      [id]
    )

    res.json({ ...workout, exercises: workoutExercises })
  } catch (err) {
    console.error('Error en GET /workouts/:id/full:', err)
    res.status(500).json({ error: 'Error al obtener el entrenamiento completo' })
  }
})

router.get('/:id/details', async (req, res) => {
  const { id } = req.params
  try {
    const { rows: workouts } = await pool.query('SELECT * FROM workouts WHERE id = $1', [id])
    const workout = workouts[0]

    if (!workout) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' })
    }

    const { rows: exercises } = await pool.query(
      `SELECT we.id as link_id, we.exercise_id, we.sets, we.reps, e.name, e.description, e.execution_time
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
    res.status(500).json({ error: 'Error cargando detalles del entrenamiento' })
  }
})

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
    res.status(500).json({ error: 'Error al obtener usuario del workout' })
  }
})

router.put('/:id/user/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params

    const { data, error } = await supabase
      .from('workouts')
      .update({ user_id: userId })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return res.status(404).json({ error: 'Workout no encontrado' })
    }

    res.json({ message: 'Propietario cambiado correctamente', data })
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar propietario del workout' })
  }
})

router.delete('/:id/user', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('workouts')
      .update({ user_id: null })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return res.status(404).json({ error: 'Workout no encontrado' })
    }

    res.json({ message: 'Propietario quitado correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al quitar propietario del workout' })
  }
})

module.exports = router
