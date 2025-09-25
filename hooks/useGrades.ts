import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

// Hook para gestión de inscripciones
export function useEnrollments(studentId?: string) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('enrollments')
        .select(`
          *,
          students(
            student_number,
            users(first_name, last_name, email)
          ),
          subjects_new(name, code, career_id)
        `)
        .order('enrollment_date', { ascending: false })

      if (studentId) {
        query = query.eq('student_id', studentId)
      }

      const { data, error } = await query

      if (error) throw error
      setEnrollments(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Error al cargar inscripciones')
    } finally {
      setLoading(false)
    }
  }

  const createEnrollment = async (enrollmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert([enrollmentData])
        .select(`
          *,
          students(
            student_number,
            users(first_name, last_name, email)
          ),
          subjects_new(name, code, career_id)
        `)
        .single()

      if (error) throw error
      
      setEnrollments(prev => [data, ...prev])
      toast.success('Inscripción creada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al crear inscripción')
      throw err
    }
  }

  const updateEnrollment = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          students(
            student_number,
            users(first_name, last_name, email)
          ),
          subjects_new(name, code, career_id)
        `)
        .single()

      if (error) throw error
      
      setEnrollments(prev => 
        prev.map(enrollment => enrollment.id === id ? data : enrollment)
      )
      toast.success('Inscripción actualizada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al actualizar inscripción')
      throw err
    }
  }

  const deleteEnrollment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setEnrollments(prev => prev.filter(enrollment => enrollment.id !== id))
      toast.success('Inscripción eliminada exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar inscripción')
      throw err
    }
  }

  useEffect(() => {
    fetchEnrollments()
  }, [studentId])

  return {
    enrollments,
    loading,
    error,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    refetch: fetchEnrollments
  }
}

// Hook para gestión de calificaciones
export function useGrades(enrollmentId?: string) {
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGrades = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('grades')
        .select(`
          *,
          enrollments(
            students(
              student_number,
              users(first_name, last_name, email)
            ),
            subjects_new(name, code)
          ),
          users(first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (enrollmentId) {
        query = query.eq('enrollment_id', enrollmentId)
      }

      const { data, error } = await query

      if (error) throw error
      setGrades(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Error al cargar calificaciones')
    } finally {
      setLoading(false)
    }
  }

  const createGrade = async (gradeData: any) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert([gradeData])
        .select(`
          *,
          enrollments(
            students(
              student_number,
              users(first_name, last_name, email)
            ),
            subjects_new(name, code)
          ),
          users(first_name, last_name)
        `)
        .single()

      if (error) throw error
      
      setGrades(prev => [data, ...prev])
      toast.success('Calificación creada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al crear calificación')
      throw err
    }
  }

  const updateGrade = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          enrollments(
            students(
              student_number,
              users(first_name, last_name, email)
            ),
            subjects_new(name, code)
          ),
          users(first_name, last_name)
        `)
        .single()

      if (error) throw error
      
      setGrades(prev => 
        prev.map(grade => grade.id === id ? data : grade)
      )
      toast.success('Calificación actualizada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al actualizar calificación')
      throw err
    }
  }

  const deleteGrade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setGrades(prev => prev.filter(grade => grade.id !== id))
      toast.success('Calificación eliminada exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar calificación')
      throw err
    }
  }

  useEffect(() => {
    fetchGrades()
  }, [enrollmentId])

  return {
    grades,
    loading,
    error,
    createGrade,
    updateGrade,
    deleteGrade,
    refetch: fetchGrades
  }
}

// Hook para gestión de correlatividades
export function useCorrelatives(subjectId?: string) {
  const [correlatives, setCorrelatives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCorrelatives = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('correlatives')
        .select(`
          *,
          subjects_new(name, code),
          required_subjects:subjects!correlatives_required_subject_id_fkey(name, code)
        `)
        .order('created_at', { ascending: false })

      if (subjectId) {
        query = query.eq('subject_id', subjectId)
      }

      const { data, error } = await query

      if (error) throw error
      setCorrelatives(data || [])
    } catch (err: any) {
      setError(err.message)
      toast.error('Error al cargar correlatividades')
    } finally {
      setLoading(false)
    }
  }

  const createCorrelative = async (correlativeData: any) => {
    try {
      const { data, error } = await supabase
        .from('correlatives')
        .insert([correlativeData])
        .select(`
          *,
          subjects_new(name, code),
          required_subjects:subjects!correlatives_required_subject_id_fkey(name, code)
        `)
        .single()

      if (error) throw error
      
      setCorrelatives(prev => [data, ...prev])
      toast.success('Correlatividad creada exitosamente')
      return data
    } catch (err: any) {
      toast.error('Error al crear correlatividad')
      throw err
    }
  }

  const deleteCorrelative = async (id: string) => {
    try {
      const { error } = await supabase
        .from('correlatives')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setCorrelatives(prev => prev.filter(correlative => correlative.id !== id))
      toast.success('Correlatividad eliminada exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar correlatividad')
      throw err
    }
  }

  useEffect(() => {
    fetchCorrelatives()
  }, [subjectId])

  return {
    correlatives,
    loading,
    error,
    createCorrelative,
    deleteCorrelative,
    refetch: fetchCorrelatives
  }
}
