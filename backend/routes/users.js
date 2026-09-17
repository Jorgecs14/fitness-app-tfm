/**
 * Rutas para gestionar usuarios en la aplicación fitness-app-tfm
 * Incluye CRUD completo, gestión de perfiles y asociación Entrenador-Cliente
 */

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { supabase, supabaseAdmin } = require('../database/supabaseClient')
const { authenticateToken } = require('../middleware/auth')

const JWT_SECRET = process.env.JWT_SECRET || 'lifeboost_jwt_secret_8f9a2b4c6e1d3f5a7b9c0d2e4f6a8b1c2d3e4f5a'

// POST /api/users/login - Inicio de sesión nativo en Neon DB
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Email requerido' })
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (!user) {
      const { data: newUser, error: createErr } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          name: email.split('@')[0],
          surname: 'Usuario',
          role: 'client',
          birth_date: '2000-01-01',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createErr || !newUser) {
        return res.status(400).json({ error: 'Usuario no encontrado' })
      }

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      return res.json({ token, user: newUser })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user })
  } catch (err) {
    console.error('Error login:', err)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// POST /api/users/register - Registro de usuario nativo en Neon DB
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, surname, birth_date, role } = req.body

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      const token = jwt.sign(
        { id: existingUser.id, email: existingUser.email, role: existingUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      return res.status(200).json({ token, user: existingUser })
    }

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name: name || email.split('@')[0],
        surname: surname || '',
        birth_date: birth_date || '2000-01-01',
        role: role || 'client',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) throw createError

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user: newUser })
  } catch (err) {
    console.error('Error registro:', err)
    res.status(500).json({ error: 'Error al registrar usuario', details: err.message })
  }
})

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

// PUT /api/users/:id/onboarding - Guardado atómico del Onboarding Inicial del Cliente
router.put('/:id/onboarding', async (req, res) => {
  try {
    const { id } = req.params
    const {
      gender,
      birth_date,
      height,
      weight,
      activity_level,
      fitness_goal,
      chest_measurement,
      waist_measurement,
      hip_measurement,
      thigh_measurement,
      bicep_measurement,
      allergies,
      food_intolerances,
      injuries_conditions,
      disliked_foods,
      training_days,
      observations
    } = req.body

    const todayDate = new Date().toISOString().split('T')[0]

    // 1. Actualizar usuario en tabla users
    const userUpdate = {
      gender: gender || null,
      birth_date: birth_date || null,
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      activity_level: activity_level || null,
      fitness_goal: fitness_goal || null,
      onboarding_completed: true
    }

    const { data: updatedUser, error: userError } = await supabaseAdmin
      .from('users')
      .update(userUpdate)
      .eq('id', id)
      .select()
      .single()

    if (userError) {
      console.error('Error actualizando usuario en onboarding:', userError)
      // Si alguna columna como activity_level o onboarding_completed no existiera en la BD relacional directa, intentamos actualización segura
      const safeUpdate = {
        birth_date: birth_date || null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null
      }
      await supabaseAdmin.from('users').update(safeUpdate).eq('id', id)
    }

    // 2. Guardar o actualizar Ficha Médica
    const medicalNotes = [
      training_days ? `Disponibilidad semanal: ${training_days} días.` : '',
      observations ? `Observaciones: ${observations}` : ''
    ].filter(Boolean).join(' | ')

    const { data: existingMedical } = await supabaseAdmin
      .from('client_medical_info')
      .select('id')
      .eq('user_id', id)
      .maybeSingle()

    const medicalPayload = {
      user_id: Number(id),
      allergies: allergies || null,
      food_intolerances: food_intolerances || null,
      injuries_conditions: injuries_conditions || null,
      disliked_foods: disliked_foods || null,
      daily_nutrition_log: medicalNotes || null,
      updated_at: new Date().toISOString()
    }

    if (existingMedical && existingMedical.id) {
      await supabaseAdmin.from('client_medical_info').update(medicalPayload).eq('id', existingMedical.id)
    } else {
      await supabaseAdmin.from('client_medical_info').insert([medicalPayload])
    }

    // 3. Guardar Punto de Partida Biométrico (Día 1)
    const { data: existingTracking } = await supabaseAdmin
      .from('weekly_tracking')
      .select('id')
      .eq('user_id', id)
      .eq('week_start_date', todayDate)
      .maybeSingle()

    const trackingPayload = {
      user_id: Number(id),
      week_start_date: todayDate,
      weight: weight ? Number(weight) : null,
      chest_measurement: chest_measurement ? Number(chest_measurement) : null,
      waist_measurement: waist_measurement ? Number(waist_measurement) : null,
      hip_measurement: hip_measurement ? Number(hip_measurement) : null,
      thigh_measurement: thigh_measurement ? Number(thigh_measurement) : null,
      bicep_measurement: bicep_measurement ? Number(bicep_measurement) : null,
      exercise_difficulties: injuries_conditions || null,
      updated_at: new Date().toISOString()
    }

    if (existingTracking && existingTracking.id) {
      await supabaseAdmin.from('weekly_tracking').update(trackingPayload).eq('id', existingTracking.id)
    } else {
      await supabaseAdmin.from('weekly_tracking').insert([trackingPayload])
    }

    // Obtener usuario final fresco
    const { data: finalUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    res.json({
      success: true,
      message: 'Onboarding inicial completado con éxito',
      user: {
        ...(finalUser || updatedUser),
        onboarding_completed: true,
        gender,
        activity_level,
        fitness_goal
      }
    })
  } catch (error) {
    console.error('Error procesando onboarding:', error)
    res.status(500).json({ error: 'Error al procesar onboarding', details: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { email, name, surname, birth_date, role, trainer_id, weight, height, gender, activity_level, fitness_goal, onboarding_completed, can_reset_initial_photos } = req.body

    const updateFields = { email, name, surname, birth_date, role, trainer_id, weight, height, gender, activity_level, fitness_goal, onboarding_completed, can_reset_initial_photos }
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key])

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Fallback si algún campo opcional no estuviera presente en el schema
      const safeFields = { email, name, surname, birth_date, role, trainer_id, weight, height, can_reset_initial_photos }
      Object.keys(safeFields).forEach(key => safeFields[key] === undefined && delete safeFields[key])
      const { data: safeData } = await supabaseAdmin.from('users').update(safeFields).eq('id', id).select().single()
      return res.json(safeData || { id, ...updateFields })
    }

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

