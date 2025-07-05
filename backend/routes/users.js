/**
 * Rutas para gestionar usuarios en la aplicación fitness-app-tfm
 * Incluye CRUD completo, gestión de perfiles y creación de usuarios con autenticación Supabase
 */

const express = require('express')
const router = express.Router()
const { supabase, supabaseAdmin } = require('../database/supabaseClient')
const { authenticateToken } = require('../middleware/auth')

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil del usuario' })
  }
})

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').order('id')

    if (error) throw error

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
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

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar usuario' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { email, password, name, surname, birth_date, role } = req.body

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

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single()

    if (userError || !userData) {
      const { data: manualUserData, error: manualError } = await supabase
        .from('users')
        .insert([
          {
            auth_user_id: authData.user.id,
            email,
            name,
            surname,
            birth_date: birth_date,
            role: role || 'client',
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
    const { email, name, surname, birth_date, role } = req.body

    const { data, error } = await supabase
      .from('users')
      .update({ email, name, surname, birth_date, role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' })

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select('email')
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' })

    res.json({ message: `Usuario ${data.email} eliminado correctamente` })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
})

module.exports = router
