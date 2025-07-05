/**
 * Middleware de autenticación para verificar tokens JWT de Supabase
 * Gestiona la autenticación de usuarios y crea automáticamente perfiles en la base de datos
 */

const { supabaseAdmin } = require('../database/supabaseClient')

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debes estar autenticado para acceder a este recurso'
      })
    }

    const {
      data: { user },
      error: authError
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return res.status(403).json({
        error: 'Token inválido o expirado',
        message: 'El token proporcionado no es válido'
      })
    }

    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (dbError) {
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la información del usuario'
      })
    }

    if (!dbUser) {
      const { data: newDbUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_user_id: user.id,
          name: user.user_metadata?.first_name || '',
          surname: user.user_metadata?.last_name || '',
          email: user.email,
          role: 'client',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        return res.status(500).json({
          error: 'Error interno del servidor',
          message: 'No se pudo crear el usuario en la base de datos'
        })
      }

      req.user = newDbUser
    } else {
      req.user = dbUser
    }
    req.authUser = user
    req.token = token

    next()
  } catch (error) {
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al procesar la autenticación'
    })
  }
}

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const userRole = req.user.role
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Se requiere uno de estos roles: ${allowedRoles.join(', ')}`
      })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  requireRole
}
