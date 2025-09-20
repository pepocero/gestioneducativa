import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          institution_id: string
          email: string
          role: 'admin' | 'professor' | 'student'
          first_name: string
          last_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          email: string
          role: 'admin' | 'professor' | 'student'
          first_name: string
          last_name: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          email?: string
          role?: 'admin' | 'professor' | 'student'
          first_name?: string
          last_name?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      careers: {
        Row: {
          id: string
          institution_id: string
          name: string
          description: string | null
          duration_years: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          name: string
          description?: string | null
          duration_years: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          name?: string
          description?: string | null
          duration_years?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cycles: {
        Row: {
          id: string
          career_id: string
          name: string
          year: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          career_id: string
          name: string
          year: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          career_id?: string
          name?: string
          year?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          cycle_id: string
          name: string
          code: string
          description: string | null
          credits: number
          hours_per_week: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cycle_id: string
          name: string
          code: string
          description?: string | null
          credits: number
          hours_per_week: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cycle_id?: string
          name?: string
          code?: string
          description?: string | null
          credits?: number
          hours_per_week?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      professor_subjects: {
        Row: {
          id: string
          professor_id: string
          subject_id: string
          created_at: string
        }
        Insert: {
          id?: string
          professor_id: string
          subject_id: string
          created_at?: string
        }
        Update: {
          id?: string
          professor_id?: string
          subject_id?: string
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string
          institution_id: string
          career_id: string
          student_number: string
          enrollment_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          institution_id: string
          career_id: string
          student_number: string
          enrollment_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          institution_id?: string
          career_id?: string
          student_number?: string
          enrollment_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          enrollment_date: string
          status: 'enrolled' | 'completed' | 'dropped'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          enrollment_date: string
          status?: 'enrolled' | 'completed' | 'dropped'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          enrollment_date?: string
          status?: 'enrolled' | 'completed' | 'dropped'
          created_at?: string
          updated_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          enrollment_id: string
          professor_id: string
          grade: number
          max_grade: number
          grade_type: 'exam' | 'assignment' | 'project' | 'final'
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enrollment_id: string
          professor_id: string
          grade: number
          max_grade: number
          grade_type: 'exam' | 'assignment' | 'project' | 'final'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string
          professor_id?: string
          grade?: number
          max_grade?: number
          grade_type?: 'exam' | 'assignment' | 'project' | 'final'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      correlatives: {
        Row: {
          id: string
          subject_id: string
          required_subject_id: string
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          required_subject_id: string
          created_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          required_subject_id?: string
          created_at?: string
        }
      }
    }
  }
}