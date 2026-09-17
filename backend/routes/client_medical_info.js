/**
 * Rutas para gestionar la información médica de los clientes
 * Incluye endpoints para crear, obtener, actualizar y eliminar datos médicos iniciales
 */

const express = require('express')
const router = express.Router()
const { supabaseAdmin } = require('../database/supabaseClient')
const { authenticateToken } = require('../middleware/auth')

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken)

// Obtener información médica por ID de usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabaseAdmin
      .from('client_medical_info')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Información médica no encontrada' })
      }
      throw error
    }

    res.json(data)
  } catch (error) {
    console.error('Error al obtener información médica:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Crear o actualizar información médica (Upsert por user_id)
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      allergies,
      food_intolerances,
      injuries_conditions,
      disliked_foods,
      lab_results,
      daily_nutrition_log
    } = req.body

    // Validar campos requeridos
    if (!user_id) {
      return res.status(400).json({ message: 'El ID del usuario es requerido' })
    }

    // Comprobar si ya existe ficha médica previa para este usuario
    const { data: existing } = await supabaseAdmin
      .from('client_medical_info')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle()

    const medicalPayload = {
      user_id,
      allergies: allergies || null,
      food_intolerances: food_intolerances || null,
      injuries_conditions: injuries_conditions || null,
      disliked_foods: disliked_foods || null,
      lab_results: lab_results || null,
      daily_nutrition_log: daily_nutrition_log || null,
      updated_at: new Date().toISOString()
    }

    let responseData
    if (existing && existing.id) {
      const { data, error } = await supabaseAdmin
        .from('client_medical_info')
        .update(medicalPayload)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      responseData = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('client_medical_info')
        .insert([medicalPayload])
        .select()
        .single()

      if (error) throw error
      responseData = data
    }

    res.status(201).json(responseData)
  } catch (error) {
    console.error('Error al crear/actualizar información médica:', error)
    res.status(500).json({ message: 'Error interno del servidor', details: error.message })
  }
})

// Actualizar información médica
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Agregar timestamp de actualización
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('client_medical_info')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Información médica no encontrada' })
      }
      throw error
    }

    res.json(data)
  } catch (error) {
    console.error('Error al actualizar información médica:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Eliminar información médica
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('client_medical_info')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Información médica eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar información médica:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

module.exports = router
