'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { securityLogger, SecurityEventType, SecurityLevel } from '@/lib/security/security-logger'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      // Logging de registro
      if (error) {
        securityLogger.logAuth(
          SecurityEventType.REGISTRATION_FAILED,
          email,
          'unknown', // IP no disponible en cliente
          navigator.userAgent,
          { error: error.message }
        )
      } else {
        securityLogger.logAuth(
          SecurityEventType.REGISTRATION_SUCCESS,
          email,
          'unknown',
          navigator.userAgent,
          { userData }
        )
      }

      return { error }
    } catch (error) {
      securityLogger.logSystemError(
        error as Error,
        'Registro de usuario',
        email
      )
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // Logging de login
      if (error) {
        securityLogger.logAuth(
          SecurityEventType.LOGIN_FAILED,
          email,
          'unknown', // IP no disponible en cliente
          navigator.userAgent,
          { error: error.message }
        )
      } else {
        securityLogger.logAuth(
          SecurityEventType.LOGIN_SUCCESS,
          email,
          'unknown',
          navigator.userAgent
        )
      }
      
      // Esperar un momento para que la sesión se establezca
      if (!error) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      return { error }
    } catch (error) {
      securityLogger.logSystemError(
        error as Error,
        'Login de usuario',
        email
      )
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const currentUser = user?.email || 'unknown'
      await supabase.auth.signOut()
      
      // Logging de logout
      securityLogger.logAuth(
        SecurityEventType.LOGOUT,
        currentUser,
        'unknown',
        navigator.userAgent
      )
    } catch (error) {
      securityLogger.logSystemError(
        error as Error,
        'Logout de usuario',
        user?.email
      )
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
