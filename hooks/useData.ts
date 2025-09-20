import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

// Hook para gestión de instituciones
export function useInstitutions() {
  const [institutions, setInstitutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstitutions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInstitutions(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Error al cargar instituciones')
    } finally {
      setLoading(false)
    }
  }

  const createInstitution = async (institutionData: any) => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .insert([institutionData])
        .select()
        .single()

      if (error) throw error
      
      setInstitutions(prev => [data, ...prev])
      toast.success('Institución creada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al crear institución')
      throw err
    }
  }

  const updateInstitution = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setInstitutions(prev => 
        prev.map(inst => inst.id === id ? data : inst)
      )
      toast.success('Institución actualizada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al actualizar institución')
      throw err
    }
  }

  const deleteInstitution = async (id: string) => {
    try {
      const { error } = await supabase
        .from('institutions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setInstitutions(prev => prev.filter(inst => inst.id !== id))
      toast.success('Institución eliminada exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar institución')
      throw err
    }
  }

  useEffect(() => {
    fetchInstitutions()
  }, [])

  return {
    institutions,
    loading,
    error,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    refetch: fetchInstitutions
  }
}

// Hook para gestión de usuarios
export function useUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          institutions(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select(`
          *,
          institutions(name)
        `)
        .single()

      if (error) throw error
      
      setUsers(prev => [data, ...prev])
      toast.success('Usuario creado exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al crear usuario')
      throw err
    }
  }

  const updateUser = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          institutions(name)
        `)
        .single()

      if (error) throw error
      
      setUsers(prev => 
        prev.map(user => user.id === id ? data : user)
      )
      toast.success('Usuario actualizado exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al actualizar usuario')
      throw err
    }
  }

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setUsers(prev => prev.filter(user => user.id !== id))
      toast.success('Usuario eliminado exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar usuario')
      throw err
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  }
}

// Hook para gestión de carreras
export function useCareers() {
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCareers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('careers')
        .select(`
          *,
          institutions(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCareers(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Error al cargar carreras')
    } finally {
      setLoading(false)
    }
  }

  const createCareer = async (careerData: any) => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .insert([careerData])
        .select(`
          *,
          institutions(name)
        `)
        .single()

      if (error) throw error
      
      setCareers(prev => [data, ...prev])
      toast.success('Carrera creada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al crear carrera')
      throw err
    }
  }

  const updateCareer = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          institutions(name)
        `)
        .single()

      if (error) throw error
      
      setCareers(prev => 
        prev.map(career => career.id === id ? data : career)
      )
      toast.success('Carrera actualizada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al actualizar carrera')
      throw err
    }
  }

  const deleteCareer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('careers')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setCareers(prev => prev.filter(career => career.id !== id))
      toast.success('Carrera eliminada exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar carrera')
      throw err
    }
  }

  useEffect(() => {
    fetchCareers()
  }, [])

  return {
    careers,
    loading,
    error,
    createCareer,
    updateCareer,
    deleteCareer,
    refetch: fetchCareers
  }
}
