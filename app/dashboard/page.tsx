'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatsCard } from '@/components/ui/Stats'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Grid } from '@/components/ui/Layout'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCheck,
  TrendingUp,
  Calendar
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    professors: 0,
    careers: 0,
    subjects: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Obtener la institución del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStats({ students: 0, professors: 0, careers: 0, subjects: 0 })
        setLoading(false)
        return
      }

      // Obtener la institución del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('institution_id')
        .eq('id', user.id)
        .single()

      if (userError || !userData?.institution_id) {
        setStats({ students: 0, professors: 0, careers: 0, subjects: 0 })
        setLoading(false)
        return
      }

      // Cargar estadísticas reales de la institución
      const [studentsResult, professorsResult, careersResult, subjectsResult] = await Promise.all([
        supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('institution_id', userData.institution_id),
        supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('institution_id', userData.institution_id)
          .eq('role', 'professor'),
        supabase
          .from('careers')
          .select('id', { count: 'exact' })
          .eq('institution_id', userData.institution_id),
        supabase
          .from('subjects')
          .select('id', { count: 'exact' })
          .eq('institution_id', userData.institution_id)
      ])

      setStats({
        students: studentsResult.count || 0,
        professors: professorsResult.count || 0,
        careers: careersResult.count || 0,
        subjects: subjectsResult.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({ students: 0, professors: 0, careers: 0, subjects: 0 })
    } finally {
      setLoading(false)
    }
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Resumen general del sistema educativo
          </p>
        </div>

        {/* Estadísticas principales */}
        <Grid cols={2} gap="md">
          <StatsCard
            title="Total Estudiantes"
            value={loading ? "..." : stats.students.toString()}
            icon={<Users className="h-8 w-8" />}
          />
          <StatsCard
            title="Profesores Activos"
            value={loading ? "..." : stats.professors.toString()}
            icon={<UserCheck className="h-8 w-8" />}
          />
        </Grid>

        {/* Contenido principal */}
        <Grid cols={2} gap="lg">
          {/* Actividad reciente */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">
                Actividad Reciente
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Nuevo estudiante registrado
                    </p>
                    <p className="text-sm text-gray-500">
                      Juan Pérez se inscribió en Ingeniería en Sistemas
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Hace 2 horas
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Nueva materia creada
                    </p>
                    <p className="text-sm text-gray-500">
                      Programación Web II agregada al tercer año
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Hace 4 horas
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Calificaciones actualizadas
                    </p>
                    <p className="text-sm text-gray-500">
                      15 nuevas calificaciones en Análisis Matemático I
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Hace 6 horas
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximos eventos */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">
                Próximos Eventos
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Examen Final - Programación I
                    </p>
                    <p className="text-sm text-gray-500">
                      15 de Diciembre, 2024 - 14:00
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Entrega de Trabajo Práctico
                    </p>
                    <p className="text-sm text-gray-500">
                      Base de Datos II - 20 de Diciembre, 2024
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Inicio de Clases 2025
                    </p>
                    <p className="text-sm text-gray-500">
                      1 de Marzo, 2025
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen académico */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              Resumen Académico
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{loading ? "..." : stats.students}</div>
                <div className="text-sm text-gray-500">Estudiantes Activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{loading ? "..." : stats.professors}</div>
                <div className="text-sm text-gray-500">Profesores Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}