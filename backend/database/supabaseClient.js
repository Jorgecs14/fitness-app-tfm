/**
 * Cliente de Supabase para la aplicación fitness-app-tfm
 * Configura dos clientes: uno normal con ANON_KEY y otro administrativo con SERVICE_ROLE_KEY
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = { supabase, supabaseAdmin }
