/**
 * Rutas para el registro y check interactivo de comidas y retos alimenticios
 */

const express = require('express')
const router = express.Router()
const { supabaseAdmin } = require('../database/supabaseClient')

// GET /meal-checks?user_id=...&date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id || req.user?.id
    const dateStr = req.query.date || new Date().toISOString().split('T')[0]

    if (!userId) {
      return res.status(400).json({ error: 'Se requiere user_id' })
    }

    const { data, error } = await supabaseAdmin
      .from('meal_checks')
      .select('*')
      .eq('user_id', userId)
      .eq('check_date', dateStr)

    if (error) {
      // Si la tabla aún no existe en Supabase, responder array vacío para resiliencia
      if (error.code === '42P01') return res.json([])
      throw error
    }

    res.json(data || [])
  } catch (error) {
    console.error('Error obteniendo meal_checks:', error)
    res.status(500).json({ error: 'Error al obtener registros de comidas' })
  }
})

// POST /meal-checks - Registrar o alternar check de comida
router.post('/', async (req, res) => {
  try {
    const { user_id, diet_id, check_date, meal_key, food_id, completed } = req.body
    const targetUserId = user_id || req.user?.id
    const dateStr = check_date || new Date().toISOString().split('T')[0]

    if (!targetUserId || !meal_key) {
      return res.status(400).json({ error: 'Faltan datos requeridos (user_id, meal_key)' })
    }

    // Intentar buscar si ya existe
    let query = supabaseAdmin
      .from('meal_checks')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('check_date', dateStr)
      .eq('meal_key', meal_key)

    if (food_id) {
      query = query.eq('food_id', food_id)
    } else {
      query = query.is('food_id', null)
    }

    const { data: existing } = await query

    if (existing && existing.length > 0) {
      if (completed === false) {
        // Eliminar check
        await supabaseAdmin.from('meal_checks').delete().eq('id', existing[0].id)
        return res.json({ message: 'Check eliminado', completed: false })
      } else {
        // Actualizar
        const { data: updated } = await supabaseAdmin
          .from('meal_checks')
          .update({ completed: true })
          .eq('id', existing[0].id)
          .select()
          .single()
        return res.json({ message: 'Check actualizado', data: updated, completed: true })
      }
    } else {
      if (completed !== false) {
        // Insertar nuevo check
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('meal_checks')
          .insert([
            {
              user_id: targetUserId,
              diet_id: diet_id || null,
              check_date: dateStr,
              meal_key,
              food_id: food_id || null,
              completed: true
            }
          ])
          .select()
          .single()

        if (insertError) throw insertError
        return res.status(201).json({ message: 'Check guardado', data: inserted, completed: true })
      } else {
        return res.json({ message: 'No action needed', completed: false })
      }
    }
  } catch (error) {
    console.error('Error guardando meal_check:', error)
    res.status(500).json({ error: 'Error al registrar check de comida', details: error.message })
  }
})

// GET /meal-checks/streak?user_id=...
router.get('/streak', async (req, res) => {
  try {
    const userId = req.query.user_id || req.user?.id
    if (!userId) return res.status(400).json({ error: 'user_id requerido' })

    const { data, error } = await supabaseAdmin
      .from('meal_checks')
      .select('check_date, meal_key')
      .eq('user_id', userId)
      .order('check_date', { ascending: false })

    if (error || !data) return res.json({ streakDays: 0, totalChecks: 0 })

    // Agrupar por fechas distintas
    const dateMap = {}
    data.forEach((item) => {
      dateMap[item.check_date] = (dateMap[item.check_date] || 0) + 1
    })

    const uniqueDates = Object.keys(dateMap).sort().reverse()
    let streakDays = 0
    const todayStr = new Date().toISOString().split('T')[0]

    for (let i = 0; i < uniqueDates.length; i++) {
      if (dateMap[uniqueDates[i]] >= 2) {
        streakDays++
      } else {
        break
      }
    }

    res.json({
      streakDays,
      totalChecks: data.length,
      activeDays: uniqueDates.length
    })
  } catch (error) {
    res.status(500).json({ error: 'Error calculando racha' })
  }
})

module.exports = router
