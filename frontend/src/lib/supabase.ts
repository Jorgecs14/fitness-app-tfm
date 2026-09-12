/**
 * Cliente de Supabase para el frontend de la aplicación fitness-app-tfm
 * Configura la conexión con la base de datos y autenticación
 */

/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

