/**
 * Rutas para gestionar las fotos de progreso de los clientes
 * Incluye endpoints para subir, obtener y eliminar fotos de progreso
 */

const express = require('express')
const router = express.Router()
const { supabase, supabaseAdmin } = require('../database/supabaseClient')
const { authenticateToken } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')

// Configurar multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/progress-photos/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'progress-' + uniqueSuffix + path.extname(file.originalname))
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

// Obtener fotos de progreso por ID de usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from('client_progress_photos')
      .select('*')
      .eq('user_id', userId)
      .order('photo_date', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Error al obtener fotos de progreso:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Obtener fotos de progreso por usuario y fecha
router.get('/user/:userId/date/:date', async (req, res) => {
  try {
    const { userId, date } = req.params

    const { data, error } = await supabase
      .from('client_progress_photos')
      .select('*')
      .eq('user_id', userId)
      .eq('photo_date', date)
      .order('photo_type')

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Error al obtener fotos de progreso por fecha:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Subir foto de progreso
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' })
    }

    // En un entorno real, aquí subirías el archivo a un servicio de almacenamiento como AWS S3
    // Por ahora, devolvemos la ruta local
    const photoUrl = `/uploads/progress-photos/${req.file.filename}`

    res.json({ url: photoUrl })
  } catch (error) {
    console.error('Error al subir foto:', error)
    res.status(500).json({ message: 'Error al subir la foto' })
  }
})

// Crear nueva foto de progreso
router.post('/', async (req, res) => {
  try {
    const { user_id, photo_type, photo_url, photo_date } = req.body

    // Validar campos requeridos
    if (!user_id || !photo_type || !photo_url || !photo_date) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos: user_id, photo_type, photo_url, photo_date' 
      })
    }

    // Validar tipo de foto
    const validPhotoTypes = ['front_arms_cross', 'side_arms_front', 'back_arms_cross']
    if (!validPhotoTypes.includes(photo_type)) {
      return res.status(400).json({ 
        message: 'Tipo de foto inválido. Debe ser: front_arms_cross, side_arms_front, o back_arms_cross' 
      })
    }

    const { data, error } = await supabase
      .from('client_progress_photos')
      .insert([{
        user_id,
        photo_type,
        photo_url,
        photo_date
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error('Error al crear foto de progreso:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Eliminar foto de progreso
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('client_progress_photos')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Foto de progreso eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar foto de progreso:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// Resetear fotos iniciales (reemplazar la línea de base inicial de un usuario)
router.post('/reset-baseline', async (req, res) => {
  try {
    const { user_id, photos } = req.body
    if (!user_id || !Array.isArray(photos)) {
      return res.status(400).json({ message: 'user_id y photos son requeridos' })
    }

    // 1. Eliminar fotos previas del usuario si se solicitó un reinicio completo
    await supabase.from('client_progress_photos').delete().eq('user_id', user_id)

    // 2. Insertar las nuevas fotos de referencia inicial
    const inserted = []
    for (const p of photos) {
      if (p.photo_type && p.photo_url && p.photo_date) {
        const { data, error } = await supabase
          .from('client_progress_photos')
          .insert([{
            user_id,
            photo_type: p.photo_type,
            photo_url: p.photo_url,
            photo_date: p.photo_date
          }])
          .select()
          .single()
        if (!error && data) inserted.push(data)
      }
    }

    // 3. Volver a bloquear can_reset_initial_photos en el usuario
    await supabaseAdmin
      .from('users')
      .update({ can_reset_initial_photos: false })
      .eq('id', user_id)

    res.json({ message: 'Fotos iniciales actualizadas con éxito', data: inserted })
  } catch (error) {
    console.error('Error al resetear fotos iniciales:', error)
    res.status(500).json({ message: 'Error al actualizar fotos iniciales' })
  }
})

module.exports = router
