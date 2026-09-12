/**
 * Rutas para gestionar el historial de sesiones de entrenamiento ejecutadas (Logged Sessions)
 */

const express = require('express')
const router = express.Router()
const { supabase } = require('../database/supabaseClient')

// POST /api/logged-sessions - Guardar una nueva sesión de entrenamiento finalizada
router.post('/', async (req, res) => {
  try {
    const { user_id, workout_id, name, started_at, completed_at, duration_seconds, notes, rating, sets } = req.body

    if (!user_id || !name) {
      return res.status(400).json({ error: 'user_id y name son obligatorios' })
    }

    // 1. Insertar la sesión
    const { data: session, error: sessionError } = await supabase
      .from('logged_sessions')
      .insert([{
        user_id,
        workout_id: workout_id || null,
        name,
        started_at: started_at || new Date().toISOString(),
        completed_at: completed_at || new Date().toISOString(),
        duration_seconds: duration_seconds || 0,
        notes: notes || '',
        rating: rating || 5
      }])
      .select()
      .single()

    if (sessionError) throw sessionError

    // 2. Insertar las series si vienen en la petición
    if (Array.isArray(sets) && sets.length > 0) {
      const setsToInsert = sets.map((s, index) => ({
        session_id: session.id,
        exercise_id: s.exercise_id,
        set_order: s.set_order || index + 1,
        phase: s.phase || 'work',
        type: s.type || 'straight',
        weight: s.weight || 0,
        reps: s.reps || 0,
        rpe: s.rpe || null,
        completed: s.completed !== undefined ? s.completed : true,
        extra_data: s.extra_data || null
      }))

      const { error: setsError } = await supabase
        .from('logged_sets')
        .insert(setsToInsert)

      if (setsError) console.error('Error insertando series:', setsError.message)
    }

    // Retornar la sesión con sus series
    res.status(201).json(session)
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar sesión de entrenamiento', details: err.message })
  }
})

// GET /api/logged-sessions/user/:userId - Obtener historial de entrenamientos de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { data: sessions, error } = await supabase
      .from('logged_sessions')
      .select(`
        *,
        logged_sets (
          id,
          exercise_id,
          set_order,
          phase,
          type,
          weight,
          reps,
          rpe,
          completed,
          extra_data,
          exercises (
            id,
            name,
            body_part,
            target_muscle,
            gif_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) throw error
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial del usuario', details: err.message })
  }
})

// GET /api/logged-sessions/:id - Obtener detalle de una sesión específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data: session, error } = await supabase
      .from('logged_sessions')
      .select(`
        *,
        logged_sets (
          id,
          exercise_id,
          set_order,
          phase,
          type,
          weight,
          reps,
          rpe,
          completed,
          extra_data,
          exercises (
            id,
            name,
            body_part,
            target_muscle,
            image_url,
            gif_url
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!session) return res.status(404).json({ error: 'Sesión no encontrada' })

    res.json(session)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener detalle de la sesión' })
  }
})

// DELETE /api/logged-sessions/:id - Eliminar una sesión
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('logged_sessions')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Sesión no encontrada' })

    res.json({ message: 'Sesión eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar sesión' })
  }
})

module.exports = router
