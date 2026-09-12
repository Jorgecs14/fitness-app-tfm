/**
 * Rutas para gestionar usuarios en la aplicación fitness-app-tfm
 * Incluye CRUD completo, gestión de perfiles y asociación Entrenador-Cliente
 */

const express = require('express')
const router = express.Router()
const { supabase, supabaseAdmin } = require('../database/supabaseClient')
const { authenticateToken } = require('../middleware/auth')

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Usuario no autenticado' })

    let trainerInfo = null
    if (user.trainer_id) {
      const { data: trainerData } = await supabaseAdmin
        .from('users')
        .select('id, name, surname, email, role')
        .eq('id', user.trainer_id)
        .single()

      if (trainerData) trainerInfo = trainerData
    }

    res.json({
      ...user,
      trainer: trainerInfo
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil del usuario' })
  }
})

// GET /api/users/trainers - Obtener todos los usuarios con rol de entrenador o admin
router.get('/trainers', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('role', ['admin', 'trainer', 'entrenador'])
      .order('name')

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de entrenadores' })
  }
})

// GET /api/users/trainer/:trainerId/clients - Obtener todos los clientes asignados a un entrenador
router.get('/trainer/:trainerId/clients', async (req, res) => {
  try {
    const { trainerId } = req.params
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('name')

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes del entrenador' })
  }
})

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('*').order('id')

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({ error: 'Error al obtener usuarios', details: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Si tiene entrenador asignado, adjuntar info
    let trainerInfo = null
    if (data.trainer_id) {
      const { data: trainerData } = await supabaseAdmin
        .from('users')
        .select('id, name, surname, email')
        .eq('id', data.trainer_id)
        .single()
      if (trainerData) trainerInfo = trainerData
    }

    res.json({ ...data, trainer: trainerInfo })
  } catch (error) {
    console.error('Error al buscar usuario:', error)
    res.status(500).json({ error: 'Error al buscar usuario', details: error.message })
  }
})

// PUT /api/users/:id/trainer - Asignar o cambiar el entrenador de un cliente
router.put('/:id/trainer', async (req, res) => {
  try {
    const { id } = req.params
    const { trainer_id } = req.body

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ trainer_id: trainer_id || null })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ message: 'Entrenador asignado correctamente', data })
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar entrenador', details: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { email, password, name, surname, birth_date, role, trainer_id, weight, height } = req.body

    if (!email || !password || !name || !surname || !birth_date) {
      return res
        .status(400)
        .json({
          error:
            'Faltan campos requeridos (email, password, name, surname, birth_date)'
        })
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(birth_date)) {
      return res
        .status(400)
        .json({
          error: 'La fecha de nacimiento debe estar en formato YYYY-MM-DD'
        })
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: name,
          last_name: surname,
          name,
          surname,
          birth_date: birth_date,
          role: role || 'client'
        }
      })

    if (authError) {
      throw authError
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single()

    if (userError || !userData) {
      const { data: manualUserData, error: manualError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            auth_user_id: authData.user.id,
            email,
            name,
            surname,
            birth_date: birth_date,
            role: role || 'client',
            trainer_id: trainer_id || null,
            weight: weight || null,
            height: height || null,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (manualError) {
        throw manualError
      }

      res.status(201).json(manualUserData)
    } else {
      res.status(201).json(userData)
    }
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear usuario',
      details: error.message
    })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { email, name, surname, birth_date, role, trainer_id, weight, height } = req.body

    const updateFields = { email, name, surname, birth_date, role, trainer_id, weight, height }
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key])

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' })

    res.json(data)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    res.status(500).json({ error: 'Error al actualizar usuario', details: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)
      .select('email')
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' })

    res.json({ message: `Usuario ${data.email} eliminado correctamente` })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ error: 'Error al eliminar usuario', details: error.message })
  }
})

module.exports = router

