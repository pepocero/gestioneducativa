'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  institution_id: string
  email: string
  role: 'admin' | 'professor' | 'student'
  first_name: string
  last_name: string
  phone?: string
  is_active: boolean
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener el usuario actual de auth.users
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setUser(null)
        return
      }

      // Buscar el usuario en la tabla users usando auth_user_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError) {
        console.error('Error loading current user:', userError)
        setError('Error al cargar información del usuario')
        setUser(null)
      } else {
        setUser(userData)
      }
    } catch (err) {
      console.error('Error loading current user:', err)
      setError('Error al cargar información del usuario')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = () => {
    loadCurrentUser()
  }

  const isAdmin = user?.role === 'admin'
  const isProfessor = user?.role === 'professor'
  const isStudent = user?.role === 'student'

  return {
    user,
    loading,
    error,
    refreshUser,
    isAdmin,
    isProfessor,
    isStudent,
    institutionId: user?.institution_id
  }
}
