/**
 * Rutas para gestionar el seguimiento mensual de los clientes
 * Incluye endpoints para crear, obtener, actualizar y eliminar datos de seguimiento mensual
 */

const express = require('express')
const router = express.Router()
const { supabase, supabaseAdmin } = require('../database/supabaseClient')
const { authenticateToken } = require('../middleware/auth')

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken)

// Obtener seguimiento mensual por ID de usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from('monthly_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('month_date', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Error al obtener seguimiento mensual:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Obtener seguimiento mensual por usuario y fecha específica
router.get('/user/:userId/month/:monthDate', async (req, res) => {
  try {
    const { userId, monthDate } = req.params

    const { data, error } = await supabase
      .from('monthly_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month_date', monthDate)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Seguimiento mensual no encontrado' })
      }
      throw error
    }

    res.json(data)
  } catch (error) {
    console.error('Error al obtener seguimiento mensual por fecha:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Crear nuevo seguimiento mensual
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      month_date,
      progress_photos_completed,
      notes
    } = req.body

    // Validar campos requeridos
    if (!user_id || !month_date) {
      return res.status(400).json({ 
        message: 'El ID del usuario y la fecha del mes son requeridos' 
      })
    }

    const { data, error } = await supabase
      .from('monthly_tracking')
      .insert([{
        user_id,
        month_date,
        progress_photos_completed: progress_photos_completed || false,
        notes
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error('Error al crear seguimiento mensual:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Actualizar seguimiento mensual
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const { data, error } = await supabase
      .from('monthly_tracking')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Seguimiento mensual no encontrado' })
      }
      throw error
    }

    res.json(data)
  } catch (error) {
    console.error('Error al actualizar seguimiento mensual:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Eliminar seguimiento mensual
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('monthly_tracking')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Seguimiento mensual eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar seguimiento mensual:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

module.exports = router
