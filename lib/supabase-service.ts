import { supabase } from './supabase'

export interface User {
  id?: string
  auth_user_id?: string
  institution_id: string
  email: string
  role: 'admin' | 'professor' | 'student'
  first_name: string
  last_name: string
  phone?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Student {
  id?: string
  user_id?: string
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
  emergency_contact?: string
  emergency_phone?: string
  notes?: string
}

export interface CareerEnrollment {
  id?: string
  student_id: string
  career_id: string
  enrollment_date: string
  status: 'active' | 'inactive' | 'graduated' | 'dropped'
  academic_year: string
  semester: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface SubjectEnrollment {
  id?: string
  student_id: string
  subject_id: string
  career_enrollment_id: string
  enrollment_date: string
  status: 'enrolled' | 'completed' | 'failed' | 'dropped' | 'incomplete'
  academic_year: string
  semester: string
  final_grade?: number
  attendance_percentage?: number
  notes?: string
  created_at?: string
  updated_at?: string
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
  institution_id: string
  name: string
  code: string
  description?: string
  credits: number
  hours_per_week?: number
  is_active: boolean
}

export interface CycleSubject {
  id?: string
  cycle_id: string
  subject_id: string
  is_required: boolean
  semester?: number
  order_in_cycle?: number
}

export interface SubjectPrerequisite {
  id?: string
  subject_id: string
  prerequisite_subject_id: string
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
// Servicios para materias (Flujo 2 - independientes)
export const subjectService = {
  async getAll(institutionId?: string) {
    let query = supabase.from('subjects_new').select('*')
    
    if (institutionId) {
      query = query.eq('institution_id', institutionId)
    }
    
    const { data, error } = await query.order('name')
    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('subjects_new')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(subject: Omit<Subject, 'id'>) {
    const { data, error } = await supabase
      .from('subjects_new')
      .insert([subject])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id: string, updates: Partial<Subject>) {
    const { data, error } = await supabase
      .from('subjects_new')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('subjects_new')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Obtener materias asignadas a un ciclo específico
  async getByCycle(cycleId: string) {
    const { data, error } = await supabase
      .from('cycle_subjects')
      .select(`
        *,
        subjects_new(*)
      `)
      .eq('cycle_id', cycleId)
      .order('semester')
      .order('order_in_cycle')
    
    if (error) throw error
    return data || []
  },

  // Obtener ciclos donde está asignada una materia
  async getCyclesBySubject(subjectId: string) {
    const { data, error } = await supabase
      .from('cycle_subjects')
      .select(`
        *,
        cycles(name, year, careers(name))
      `)
      .eq('subject_id', subjectId)
    
    if (error) throw error
    return data || []
  }
}

// Servicios para asignación de materias a ciclos
export const cycleSubjectService = {
  async assign(assignment: Omit<CycleSubject, 'id'>) {
    const { data, error } = await supabase
      .from('cycle_subjects')
      .insert([assignment])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async unassign(cycleId: string, subjectId: string) {
    const { error } = await supabase
      .from('cycle_subjects')
      .delete()
      .eq('cycle_id', cycleId)
      .eq('subject_id', subjectId)
    
    if (error) throw error
  },

  async updateAssignment(cycleId: string, subjectId: string, updates: Partial<CycleSubject>) {
    const { data, error } = await supabase
      .from('cycle_subjects')
      .update(updates)
      .eq('cycle_id', cycleId)
      .eq('subject_id', subjectId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getAssignmentsByCycle(cycleId: string) {
    const { data, error } = await supabase
      .from('cycle_subjects')
      .select(`
        *,
        subjects_new(*)
      `)
      .eq('cycle_id', cycleId)
      .order('semester')
      .order('order_in_cycle')
    
    if (error) throw error
    return data || []
  }
}

// Servicio para obtener el usuario actual
export const userService = {
  async getCurrentUser() {
    const { data, error } = await supabase.rpc('get_current_user')
    if (error) throw error
    return data?.[0] || null
  },

  async getUserInstitution() {
    const { data, error } = await supabase.rpc('get_user_institution')
    if (error) throw error
    return data
  },

  async isAdminOfInstitution(institutionId: string) {
    const { data, error } = await supabase.rpc('is_admin_of_institution', { p_institution_id: institutionId })
    if (error) throw error
    return data
  },

  async getAll(institutionId?: string) {
    let query = supabase.from('users').select(`
      *,
      institutions(name)
    `)
    
    if (institutionId) {
      query = query.eq('institution_id', institutionId)
    }
    
    const { data, error } = await query.order('first_name')
    if (error) throw error
    return data || []
  },

  async create(user: Omit<User, 'id'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async update(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Servicios para inscripciones a carreras
export const careerEnrollmentService = {
  async create(enrollment: Omit<CareerEnrollment, 'id'>) {
    const { data, error } = await supabase
      .from('career_enrollments')
      .insert([enrollment])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('career_enrollments')
      .select(`
        *,
        careers(name, description),
        students(first_name, last_name, student_number)
      `)
      .eq('student_id', studentId)
    
    if (error) throw error
    return data
  },

  async getByCareer(careerId: string) {
    const { data, error } = await supabase
      .from('career_enrollments')
      .select(`
        *,
        careers(name, description),
        students(first_name, last_name, student_number)
      `)
      .eq('career_id', careerId)
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<CareerEnrollment>) {
    const { data, error } = await supabase
      .from('career_enrollments')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('career_enrollments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Servicios para inscripciones a materias
export const subjectEnrollmentService = {
  async create(enrollment: Omit<SubjectEnrollment, 'id'>) {
    const { data, error } = await supabase
      .from('subject_enrollments')
      .insert([enrollment])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('subject_enrollments')
      .select(`
        *,
        subjects_new(name, code, credits),
        students(first_name, last_name, student_number),
        career_enrollments(careers(name))
      `)
      .eq('student_id', studentId)
    
    if (error) throw error
    return data
  },

  async getBySubject(subjectId: string) {
    const { data, error } = await supabase
      .from('subject_enrollments')
      .select(`
        *,
        subjects_new(name, code),
        students(first_name, last_name, student_number),
        career_enrollments(careers(name))
      `)
      .eq('subject_id', subjectId)
    
    if (error) throw error
    return data
  },

  async getByCareerEnrollment(careerEnrollmentId: string) {
    const { data, error } = await supabase
      .from('subject_enrollments')
      .select(`
        *,
        subjects_new(name, code, credits),
        students(first_name, last_name, student_number)
      `)
      .eq('career_enrollment_id', careerEnrollmentId)
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<SubjectEnrollment>) {
    const { data, error } = await supabase
      .from('subject_enrollments')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('subject_enrollments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
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

