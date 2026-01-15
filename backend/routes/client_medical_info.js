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

// Crear nueva información médica
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

    const { data, error } = await supabaseAdmin
      .from('client_medical_info')
      .insert([{
        user_id,
        allergies,
        food_intolerances,
        injuries_conditions,
        disliked_foods,
        lab_results,
        daily_nutrition_log
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error('Error al crear información médica:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
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
