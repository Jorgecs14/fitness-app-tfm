import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'


export const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        setUser(null)
      } else {
        setUser(data.user)
      }
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>

  if (!user) {
    // Not logged in: redirect to /login
    return <Navigate to="/login" replace />
  }

  // Logged in: render nested routes/components
  return <Outlet />
}
