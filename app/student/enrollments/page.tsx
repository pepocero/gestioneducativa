'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SubjectBrowser } from '@/components/student/SubjectBrowser'
import { EnrollmentRequestForm } from '@/components/student/EnrollmentRequestForm'
import { enrollmentRequestService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { BookOpen, Clock, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react'

interface EnrollmentRequest {
  id: string
  subject_id: string
  subject_name: string
  subject_code: string
  career_name: string
  cycle_name: string
  academic_year: string
  semester: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  request_date: string
  reviewed_at?: string
  admin_notes?: string
  student_notes?: string
}

export default function StudentEnrollmentsPage() {
  const [currentStudentId, setCurrentStudentId] = useState('')
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<{
    id: string
    name: string
    careerName: string
    cycleName: string
  } | null>(null)

  useEffect(() => {
    loadCurrentStudent()
  }, [])

  const loadCurrentStudent = async () => {
    try {
      // TODO: Obtener el ID del estudiante actual desde el contexto de autenticación
      // Por ahora usamos un ID de prueba
      const studentId = '990e8400-e29b-41d4-a716-446655440001' // Ana Martínez
      setCurrentStudentId(studentId)
      await loadEnrollmentRequests(studentId)
    } catch (error) {
      console.error('Error cargando estudiante:', error)
      toast.error('Error cargando información del estudiante')
    }
  }

  const loadEnrollmentRequests = async (studentId: string) => {
    try {
      setLoading(true)
      const requests = await enrollmentRequestService.getAll({ student_id: studentId })
      setEnrollmentRequests(requests as EnrollmentRequest[])
    } catch (error) {
      console.error('Error cargando solicitudes:', error)
      toast.error('Error cargando solicitudes de inscripción')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestEnrollment = (subjectId: string, subjectName: string, careerName: string, cycleName: string) => {
    setSelectedSubject({
      id: subjectId,
      name: subjectName,
      careerName,
      cycleName
    })
    setShowRequestForm(true)
  }

  const handleRequestSuccess = () => {
    if (currentStudentId) {
      loadEnrollmentRequests(currentStudentId)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      await enrollmentRequestService.cancel(requestId)
      toast.success('Solicitud cancelada correctamente')
      if (currentStudentId) {
        loadEnrollmentRequests(currentStudentId)
      }
    } catch (error: any) {
      console.error('Error cancelando solicitud:', error)
      toast.error(error.message || 'Error cancelando solicitud')
    }
  }

  const getStatusBadge = (status: EnrollmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" icon={Clock}>Pendiente</Badge>
      case 'approved':
        return <Badge variant="success" icon={CheckCircle}>Aprobado</Badge>
      case 'rejected':
        return <Badge variant="danger" icon={XCircle}>Rechazado</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getStatusColor = (status: EnrollmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600'
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      case 'cancelled':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inscripciones a Materias</h1>
        <p className="text-gray-600">
          Navega por las carreras y ciclos para solicitar inscripción a las materias disponibles.
        </p>
      </div>

      {/* Navegador de Materias */}
      {currentStudentId && (
        <SubjectBrowser
          studentId={currentStudentId}
          onRequestEnrollment={handleRequestEnrollment}
        />
      )}

      {/* Historial de Solicitudes */}
      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            Mis Solicitudes de Inscripción
          </h2>
          <Button
            onClick={() => currentStudentId && loadEnrollmentRequests(currentStudentId)}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : enrollmentRequests.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tienes solicitudes de inscripción</p>
            <p className="text-sm text-gray-500 mt-1">
              Usa el navegador de materias arriba para solicitar inscripción a una materia
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollmentRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{request.subject_name}</h3>
                    <p className="text-sm text-gray-600">
                      {request.subject_code} • {request.career_name} • {request.cycle_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {request.academic_year} - Semestre {request.semester}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Solicitado: {formatDate(request.request_date)}</span>
                    {request.reviewed_at && (
                      <span>Revisado: {formatDate(request.reviewed_at)}</span>
                    )}
                  </div>
                  
                  {request.status === 'pending' && (
                    <Button
                      onClick={() => handleCancelRequest(request.id)}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>

                {request.admin_notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Notas del Administrador:</h4>
                    <p className="text-sm text-gray-700">{request.admin_notes}</p>
                  </div>
                )}

                {request.student_notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Tus notas:</h4>
                    <p className="text-sm text-gray-700">{request.student_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de Solicitud de Inscripción */}
      {showRequestForm && selectedSubject && currentStudentId && (
        <EnrollmentRequestForm
          isOpen={showRequestForm}
          onClose={() => {
            setShowRequestForm(false)
            setSelectedSubject(null)
          }}
          onSuccess={handleRequestSuccess}
          studentId={currentStudentId}
          subjectId={selectedSubject.id}
          subjectName={selectedSubject.name}
          careerName={selectedSubject.careerName}
          cycleName={selectedSubject.cycleName}
        />
      )}
    </div>
  )
}
