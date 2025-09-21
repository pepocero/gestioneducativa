import { supabase } from './supabase'

export interface Student {
  id?: string
  institution_id: string
  career_id?: string
  student_number: string
  enrollment_date: string
  is_active: boolean
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  dni?: string
  birth_date?: string
  address?: string
}

export interface Professor {
  id?: string
  institution_id: string
  email: string
  role: 'admin' | 'professor' | 'student'
  first_name: string
  last_name: string
  phone?: string
}

export interface Institution {
  id?: string
  name: string
  email?: string
  phone?: string
  address?: string
  created_at?: string
  updated_at?: string
}

export interface Career {
  id?: string
  institution_id: string
  name: string
  description?: string
  duration_years?: number
  is_active: boolean
}

export interface Cycle {
  id?: string
  career_id: string
  name: string
  year: number
  is_active: boolean
}

export interface Subject {
  id?: string
  cycle_id: string
  name: string
  code: string
  description?: string
  credits: number
  hours_per_week?: number
  is_active: boolean
}

export interface Enrollment {
  id?: string
  student_id: string
  subject_id: string
  enrollment_date: string
  status: 'enrolled' | 'completed' | 'dropped'
}

export interface Grade {
  id?: string
  enrollment_id: string
  professor_id: string
  grade: number
  max_grade: number
  grade_type: 'exam' | 'assignment' | 'final'
  description?: string
}

// Servicios para estudiantes
export const studentService = {
  async create(student: Omit<Student, 'id'>) {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getAll(institutionId?: string) {
    let query = supabase.from('students').select(`
      *,
      institutions(name),
      careers(name)
    `)
    
    if (institutionId) {
      query = query.eq('institution_id', institutionId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        institutions(name),
        careers(name)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Student>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Servicios para profesores (usando tabla users)
export const professorService = {
  async create(professor: Omit<Professor, 'id'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...professor,
        role: 'professor'
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getAll(institutionId?: string) {
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'professor')
    
    if (institutionId) {
      query = query.eq('institution_id', institutionId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'professor')
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Professor>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .eq('role', 'professor')
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'professor')
    
    if (error) throw error
  }
}

// Servicios para instituciones
export const institutionService = {
  async getAll() {
    // Usar cliente normal con políticas RLS correctas
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    // Usar cliente normal con políticas RLS correctas
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(institution: Omit<Institution, 'id'>) {
    // Crear la institución usando cliente normal con políticas RLS
    const { data, error } = await supabase
      .from('institutions')
      .insert([institution])
      .select()
    
    if (error) throw error
    const newInstitution = data[0]

    // Vincular automáticamente al usuario a la institución creada usando función SQL
    const { error: linkError } = await supabase.rpc('link_user_to_institution', {
      institution_id: newInstitution.id
    })

    if (linkError) {
      console.error('Error vinculando usuario a institución:', linkError)
      // No lanzar error aquí para no romper el flujo de creación
    }

    return newInstitution
  },

  async update(id: string, updates: Partial<Institution>) {
    const { data, error } = await supabase
      .from('institutions')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('institutions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Servicios para carreras
export const careerService = {
  async getAll(institutionId?: string) {
    let query = supabase.from('careers').select('*')
    
    if (institutionId) {
      query = query.eq('institution_id', institutionId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(career: Omit<Career, 'id'>) {
    const { data, error } = await supabase
      .from('careers')
      .insert([career])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id: string, updates: Partial<Career>) {
    const { data, error } = await supabase
      .from('careers')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('careers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Servicios para ciclos
export const cycleService = {
  async getAll(careerId?: string) {
    let query = supabase.from('cycles').select('*')
    
    if (careerId) {
      query = query.eq('career_id', careerId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(cycle: Omit<Cycle, 'id'>) {
    const { data, error } = await supabase
      .from('cycles')
      .insert([cycle])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id: string, updates: Partial<Cycle>) {
    const { data, error } = await supabase
      .from('cycles')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('cycles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Servicios para materias
export const subjectService = {
  async getAll(cycleId?: string) {
    let query = supabase.from('subjects').select(`
      *,
      cycles(name, year, careers(name))
    `)
    
    if (cycleId) {
      query = query.eq('cycle_id', cycleId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        cycles(name, year, careers(name))
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(subject: Omit<Subject, 'id'>) {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subject])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id: string, updates: Partial<Subject>) {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Servicios para inscripciones
export const enrollmentService = {
  async create(enrollment: Omit<Enrollment, 'id'>) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([enrollment])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        subjects(name, code, credits),
        students(first_name, last_name, student_number)
      `)
      .eq('student_id', studentId)
    
    if (error) throw error
    return data
  },

  async getBySubject(subjectId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        subjects(name, code),
        students(first_name, last_name, student_number)
      `)
      .eq('subject_id', subjectId)
    
    if (error) throw error
    return data
  }
}

// Servicios para calificaciones
export const gradeService = {
  async create(grade: Omit<Grade, 'id'>) {
    const { data, error } = await supabase
      .from('grades')
      .insert([grade])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getByEnrollment(enrollmentId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('enrollment_id', enrollmentId)
    
    if (error) throw error
    return data
  }
}

