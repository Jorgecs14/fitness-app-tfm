/**
 * Cliente de Supabase para la aplicación fitness-app-tfm
 * Configura el cliente administrativo con SERVICE_ROLE_KEY para operaciones del backend
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_key'

// Cliente administrativo con SERVICE_ROLE_KEY para operaciones del backend
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

// Para compatibilidad, exportamos el mismo cliente como supabase y supabaseAdmin
const supabase = supabaseAdmin

module.exports = { supabase, supabaseAdmin }

