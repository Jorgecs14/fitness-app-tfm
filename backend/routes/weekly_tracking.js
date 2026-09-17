/**
 * Rutas para gestionar el seguimiento semanal de los clientes
 * Incluye endpoints para crear, obtener, actualizar y eliminar datos de seguimiento semanal
 */

const express = require('express')
const router = express.Router()
const { supabase, supabaseAdmin } = require('../database/supabaseClient')
const { authenticateToken } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')

// Configurar multer para fotos de peso
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/weight-photos/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'weight-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false)
    }
  }
})

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken)

// Obtener seguimiento semanal por ID de usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from('weekly_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Error al obtener seguimiento semanal:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Obtener seguimiento semanal por usuario y fecha específica
router.get('/user/:userId/week/:weekStartDate', async (req, res) => {
  try {
    const { userId, weekStartDate } = req.params

    const { data, error } = await supabase
      .from('weekly_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Seguimiento semanal no encontrado' })
      }
      throw error
    }

    res.json(data)
  } catch (error) {
    console.error('Error al obtener seguimiento semanal por fecha:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Subir foto de peso
router.post('/upload-weight-photo', upload.single('weightPhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' })
    }

    // En un entorno real, aquí subirías el archivo a un servicio de almacenamiento como AWS S3
    const photoUrl = `/uploads/weight-photos/${req.file.filename}`

    res.json({ url: photoUrl })
  } catch (error) {
    console.error('Error al subir foto de peso:', error)
    res.status(500).json({ message: 'Error al subir la foto de peso' })
  }
})

// Crear o actualizar seguimiento semanal
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      week_start_date,
      date,
      weight,
      weight_photo_url,
      chest_measurement,
      waist_measurement,
      hip_measurement,
      thigh_measurement,
      bicep_measurement,
      diet_difficulties,
      exercise_difficulties,
      bowel_movements_per_week,
      daily_water_intake,
      sleep_quality,
      training_days_completed,
      diet_deviations,
      self_rating
    } = req.body

    const targetWeekDate = week_start_date || date || new Date().toISOString().split('T')[0]

    // Validar campos requeridos
    if (!user_id) {
      return res.status(400).json({ 
        message: 'El ID del usuario es requerido' 
      })
    }

    // Validar calidad del sueño si se proporciona
    if (sleep_quality && !['good', 'bad', 'regular'].includes(sleep_quality)) {
      return res.status(400).json({ 
        message: 'Calidad del sueño debe ser: good, bad, o regular' 
      })
    }

    // Validar autoevaluación si se proporciona
    if (self_rating && (self_rating < 1 || self_rating > 10)) {
      return res.status(400).json({ 
        message: 'La autoevaluación debe estar entre 1 y 10' 
      })
    }

    // Comprobar si ya existe un registro para esta fecha
    const { data: existing } = await supabase
      .from('weekly_tracking')
      .select('id')
      .eq('user_id', user_id)
      .eq('week_start_date', targetWeekDate)
      .maybeSingle()

    const trackingPayload = {
      user_id,
      week_start_date: targetWeekDate,
      weight: weight !== undefined && weight !== '' ? Number(weight) : null,
      weight_photo_url: weight_photo_url || null,
      chest_measurement: chest_measurement !== undefined && chest_measurement !== '' ? Number(chest_measurement) : null,
      waist_measurement: waist_measurement !== undefined && waist_measurement !== '' ? Number(waist_measurement) : null,
      hip_measurement: hip_measurement !== undefined && hip_measurement !== '' ? Number(hip_measurement) : null,
      thigh_measurement: thigh_measurement !== undefined && thigh_measurement !== '' ? Number(thigh_measurement) : null,
      bicep_measurement: bicep_measurement !== undefined && bicep_measurement !== '' ? Number(bicep_measurement) : null,
      diet_difficulties: diet_difficulties || null,
      exercise_difficulties: exercise_difficulties || null,
      bowel_movements_per_week: bowel_movements_per_week !== undefined && bowel_movements_per_week !== '' ? Number(bowel_movements_per_week) : null,
      daily_water_intake: daily_water_intake !== undefined && daily_water_intake !== '' ? Number(daily_water_intake) : null,
      sleep_quality: sleep_quality || null,
      training_days_completed: training_days_completed !== undefined && training_days_completed !== '' ? Number(training_days_completed) : null,
      diet_deviations: diet_deviations || null,
      self_rating: self_rating !== undefined && self_rating !== '' ? Number(self_rating) : null,
      updated_at: new Date().toISOString()
    }

    let responseData
    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('weekly_tracking')
        .update(trackingPayload)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      responseData = data
    } else {
      const { data, error } = await supabase
        .from('weekly_tracking')
        .insert([trackingPayload])
        .select()
        .single()

      if (error) throw error
      responseData = data
    }

    res.status(201).json(responseData)
  } catch (error) {
    console.error('Error al crear/actualizar seguimiento semanal:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Actualizar seguimiento semanal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Validar calidad del sueño si se proporciona
    if (updateData.sleep_quality && !['good', 'bad', 'regular'].includes(updateData.sleep_quality)) {
      return res.status(400).json({ 
        message: 'Calidad del sueño debe ser: good, bad, o regular' 
      })
    }

    // Validar autoevaluación si se proporciona
    if (updateData.self_rating && (updateData.self_rating < 1 || updateData.self_rating > 10)) {
      return res.status(400).json({ 
        message: 'La autoevaluación debe estar entre 1 y 10' 
      })
    }

    // Agregar timestamp de actualización
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('weekly_tracking')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Seguimiento semanal no encontrado' })
      }
      throw error
    }

    res.json(data)
  } catch (error) {
    console.error('Error al actualizar seguimiento semanal:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Eliminar seguimiento semanal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('weekly_tracking')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Seguimiento semanal eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar seguimiento semanal:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

module.exports = router
