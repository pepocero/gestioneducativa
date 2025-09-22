import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

// Hook para gestión de ciclos
export function useCycles(careerId?: string) {
  const [cycles, setCycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCycles = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('cycles')
        .select(`
          *,
          careers(name, institutions(name))
        `)
        .order('year', { ascending: true })

      if (careerId) {
        query = query.eq('career_id', careerId)
      }

      const { data, error } = await query

      if (error) throw error
      setCycles(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Error al cargar ciclos')
    } finally {
      setLoading(false)
    }
  }

  const createCycle = async (cycleData: any) => {
    try {
      const { data, error } = await supabase
        .from('cycles')
        .insert([cycleData])
        .select(`
          *,
          careers(name, institutions(name))
        `)
        .single()

      if (error) throw error
      
      setCycles(prev => [...prev, data].sort((a, b) => a.year - b.year))
      toast.success('Ciclo creado exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al crear ciclo')
      throw err
    }
  }

  const updateCycle = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('cycles')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          careers(name, institutions(name))
        `)
        .single()

      if (error) throw error
      
      setCycles(prev => 
        prev.map(cycle => cycle.id === id ? data : cycle)
          .sort((a, b) => a.year - b.year)
      )
      toast.success('Ciclo actualizado exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al actualizar ciclo')
      throw err
    }
  }

  const deleteCycle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cycles')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setCycles(prev => prev.filter(cycle => cycle.id !== id))
      toast.success('Ciclo eliminado exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar ciclo')
      throw err
    }
  }

  useEffect(() => {
    fetchCycles()
  }, [careerId])

  return {
    cycles,
    loading,
    error,
    createCycle,
    updateCycle,
    deleteCycle,
    refetch: fetchCycles
  }
}

// Hook para gestión de materias
export function useSubjects(cycleId?: string) {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('subjects_new')
        .select(`
          *,
          careers(name, institutions(name))
        `)
        .order('code', { ascending: true })

      if (cycleId) {
        query = query.eq('career_id', cycleId)
      }

      const { data, error } = await query

      if (error) throw error
      setSubjects(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Error al cargar materias')
    } finally {
      setLoading(false)
    }
  }

  const createSubject = async (subjectData: any) => {
    try {
      const { data, error } = await supabase
        .from('subjects_new')
        .insert([subjectData])
        .select(`
          *,
          careers(name, institutions(name))
        `)
        .single()

      if (error) throw error
      
      setSubjects(prev => [...prev, data].sort((a, b) => a.code.localeCompare(b.code)))
      toast.success('Materia creada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al crear materia')
      throw err
    }
  }

  const updateSubject = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('subjects_new')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          careers(name, institutions(name))
        `)
        .single()

      if (error) throw error
      
      setSubjects(prev => 
        prev.map(subject => subject.id === id ? data : subject)
          .sort((a, b) => a.code.localeCompare(b.code))
      )
      toast.success('Materia actualizada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al actualizar materia')
      throw err
    }
  }

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subjects_new')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setSubjects(prev => prev.filter(subject => subject.id !== id))
      toast.success('Materia eliminada exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar materia')
      throw err
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [cycleId])

  return {
    subjects,
    loading,
    error,
    createSubject,
    updateSubject,
    deleteSubject,
    refetch: fetchSubjects
  }
}

// Hook para gestión de estudiantes
export function useStudents() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      
      // Obtener la institución del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStudents([])
        setLoading(false)
        return
      }

      // Obtener la institución del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('institution_id')
        .eq('auth_user_id', user.id)
        .single()

      if (userError || !userData?.institution_id) {
        setStudents([])
        setLoading(false)
        return
      }

      // Cargar solo estudiantes de la institución del usuario
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          users(first_name, last_name, email, role),
          careers(name),
          institutions(name)
        `)
        .eq('institution_id', userData.institution_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Error al cargar estudiantes')
    } finally {
      setLoading(false)
    }
  }

  const createStudent = async (studentData: any) => {
    try {
      // Obtener la institución del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('institution_id')
        .eq('auth_user_id', user.id)
        .single()

      if (userError || !userData?.institution_id) {
        throw new Error('No se pudo obtener la institución del usuario')
      }

      // Asegurar que el estudiante pertenece a la institución del usuario
      const studentDataWithInstitution = {
        ...studentData,
        institution_id: userData.institution_id
      }

      const { data, error } = await supabase
        .from('students')
        .insert([studentDataWithInstitution])
        .select(`
          *,
          users(first_name, last_name, email, role),
          careers(name),
          institutions(name)
        `)
        .single()

      if (error) throw error
      
      setStudents(prev => [data, ...prev])
      toast.success('Estudiante creado exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al crear estudiante')
      throw err
    }
  }

  const updateStudent = async (id: string, updates: any) => {
    try {
      // Obtener la institución del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('institution_id')
        .eq('auth_user_id', user.id)
        .single()

      if (userError || !userData?.institution_id) {
        throw new Error('No se pudo obtener la institución del usuario')
      }

      // Solo permitir actualizar estudiantes de la misma institución
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .eq('institution_id', userData.institution_id)
        .select(`
          *,
          users(first_name, last_name, email, role),
          careers(name),
          institutions(name)
        `)
        .single()

      if (error) throw error
      
      setStudents(prev => 
        prev.map(student => student.id === id ? data : student)
      )
      toast.success('Estudiante actualizado exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al actualizar estudiante')
      throw err
    }
  }

  const deleteStudent = async (id: string) => {
    try {
      // Obtener la institución del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('institution_id')
        .eq('auth_user_id', user.id)
        .single()

      if (userError || !userData?.institution_id) {
        throw new Error('No se pudo obtener la institución del usuario')
      }

      // Solo permitir eliminar estudiantes de la misma institución
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .eq('institution_id', userData.institution_id)

      if (error) throw error
      
      setStudents(prev => prev.filter(student => student.id !== id))
      toast.success('Estudiante eliminado exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar estudiante')
      throw err
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents
  }
}
