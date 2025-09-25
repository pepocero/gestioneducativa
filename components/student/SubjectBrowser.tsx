'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useCareers } from '@/hooks/useData'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { BookOpen, GraduationCap, Calendar, Plus, CheckCircle, Clock, XCircle } from 'lucide-react'

interface SubjectBrowserProps {
  studentId: string
  onRequestEnrollment: (subjectId: string, subjectName: string, careerName: string, cycleName: string) => void
}

interface Cycle {
  id: string
  name: string
  year: number
  career_id: string
}

interface Subject {
  id: string
  name: string
  code: string
  credits: number
  hours_per_week: number
  cycle_id: string
}

interface EnrollmentStatus {
  subject_id: string
  status: 'enrolled' | 'pending' | 'approved' | 'rejected' | 'none'
}

export default function SubjectBrowser({ studentId, onRequestEnrollment }: SubjectBrowserProps) {
  const [selectedCareerId, setSelectedCareerId] = useState('')
  const [selectedCycleId, setSelectedCycleId] = useState('')
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<EnrollmentStatus[]>([])
  const [loadingCycles, setLoadingCycles] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  const { careers, loading: careersLoading } = useCareers()

  useEffect(() => {
    if (selectedCareerId) {
      loadCyclesForCareer(selectedCareerId)
    } else {
      setCycles([])
      setSubjects([])
      setSelectedCycleId('')
    }
  }, [selectedCareerId])

  useEffect(() => {
    if (selectedCareerId) {
      loadSubjectsForCareer(selectedCareerId)
    } else {
      setSubjects([])
    }
  }, [selectedCareerId])

  const loadCyclesForCareer = async (careerId: string) => {
    try {
      setLoadingCycles(true)
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('career_id', careerId)
        .eq('is_active', true)
        .order('year', { ascending: true })
      
      if (error) throw error
      setCycles(data || [])
    } catch (error) {
      console.error('Error cargando ciclos:', error)
      toast.error('Error cargando ciclos')
    } finally {
      setLoadingCycles(false)
    }
  }

  const loadSubjectsForCareer = async (careerId: string) => {
    try {
      setLoadingSubjects(true)
      const { data, error } = await supabase
        .from('subjects_new')
        .select('*')
        .eq('career_id', careerId)
        .eq('is_active', true)
        .order('code', { ascending: true })
      
      if (error) throw error
      setSubjects(data || [])
      
      // Cargar estado de inscripciones para estas materias
      await loadEnrollmentStatuses(data?.map(s => s.id) || [])
    } catch (error) {
      console.error('Error cargando materias:', error)
      toast.error('Error cargando materias')
    } finally {
      setLoadingSubjects(false)
    }
  }

  const loadEnrollmentStatuses = async (subjectIds: string[]) => {
    if (subjectIds.length === 0) {
      setEnrollmentStatuses([])
      return
    }

    try {
      // Obtener inscripciones activas
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('subject_id')
        .eq('student_id', studentId)
        .in('subject_id', subjectIds)
        .eq('status', 'enrolled')

      if (enrollmentError) throw enrollmentError

      // Obtener solicitudes pendientes
      const { data: requests, error: requestError } = await supabase
        .from('enrollment_requests')
        .select('subject_id, status')
        .eq('student_id', studentId)
        .in('subject_id', subjectIds)
        .in('status', ['pending', 'approved', 'rejected'])

      if (requestError) throw requestError

      // Crear mapa de estados
      const statusMap: { [key: string]: 'enrolled' | 'pending' | 'approved' | 'rejected' | 'none' } = {}
      
      // Marcar inscripciones activas
      enrollments?.forEach(enrollment => {
        statusMap[enrollment.subject_id] = 'enrolled'
      })

      // Marcar solicitudes
      requests?.forEach(request => {
        if (!statusMap[request.subject_id]) { // Solo si no está ya inscrito
          statusMap[request.subject_id] = request.status as 'pending' | 'approved' | 'rejected'
        }
      })

      // Crear array de estados
      const statuses: EnrollmentStatus[] = subjectIds.map(subjectId => ({
        subject_id: subjectId,
        status: statusMap[subjectId] || 'none'
      }))

      setEnrollmentStatuses(statuses)
    } catch (error) {
      console.error('Error cargando estados de inscripción:', error)
    }
  }

  const getEnrollmentStatus = (subjectId: string): EnrollmentStatus['status'] => {
    const status = enrollmentStatuses.find(s => s.subject_id === subjectId)
    return status?.status || 'none'
  }

  const getStatusIcon = (status: EnrollmentStatus['status']) => {
    switch (status) {
      case 'enrolled':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: EnrollmentStatus['status']) => {
    switch (status) {
      case 'enrolled':
        return 'Inscrito'
      case 'pending':
        return 'Pendiente'
      case 'approved':
        return 'Aprobado'
      case 'rejected':
        return 'Rechazado'
      default:
        return 'No inscrito'
    }
  }

  const canRequestEnrollment = (status: EnrollmentStatus['status']) => {
    return status === 'none' || status === 'rejected'
  }

  const getCareerName = (careerId: string) => {
    const career = careers.find(c => c.id === careerId)
    return career?.name || ''
  }

  const getCycleName = (cycleId: string) => {
    const cycle = cycles.find(c => c.id === cycleId)
    return cycle?.name || ''
  }

  return (
    <div className="space-y-6">
      {/* Selectores de Carrera y Ciclo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
          Navegación por Materias
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrera
            </label>
            <Select
              value={selectedCareerId}
              onChange={(e) => {
                setSelectedCareerId(e.target.value)
                setSelectedCycleId('')
              }}
              placeholder="Seleccionar carrera"
              disabled={careersLoading}
            >
              {careers.map((career: any) => (
                <option key={career.id} value={career.id}>
                  {career.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciclo
            </label>
            <Select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              placeholder="Seleccionar ciclo"
              disabled={!selectedCareerId || loadingCycles}
            >
              {cycles.map((cycle: any) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name} - Año {cycle.year}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Lista de Materias */}
      {selectedCycleId && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-green-600" />
            Materias del {getCycleName(selectedCycleId)} - {getCareerName(selectedCareerId)}
          </h3>

          {loadingSubjects ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando materias...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay materias disponibles en este ciclo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => {
                const status = getEnrollmentStatus(subject.id)
                const canRequest = canRequestEnrollment(status)
                
                return (
                  <div
                    key={subject.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                        <p className="text-sm text-gray-600">Código: {subject.code}</p>
                      </div>
                      {getStatusIcon(status)}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Créditos:</span>
                        <span>{subject.credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horas/semana:</span>
                        <span>{subject.hours_per_week}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <span className={`font-medium ${
                          status === 'enrolled' ? 'text-green-600' :
                          status === 'pending' ? 'text-yellow-600' :
                          status === 'approved' ? 'text-blue-600' :
                          status === 'rejected' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                    </div>

                    {canRequest && (
                      <Button
                        onClick={() => onRequestEnrollment(
                          subject.id,
                          subject.name,
                          getCareerName(selectedCareerId),
                          getCycleName(selectedCycleId)
                        )}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Solicitar Inscripción
                      </Button>
                    )}

                    {status === 'rejected' && (
                      <Button
                        onClick={() => onRequestEnrollment(
                          subject.id,
                          subject.name,
                          getCareerName(selectedCareerId),
                          getCycleName(selectedCycleId)
                        )}
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Reintentar Solicitud
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {!selectedCareerId && (
        <Card className="p-6">
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Selecciona una carrera para ver las materias disponibles</p>
          </div>
        </Card>
      )}
    </div>
  )
}
