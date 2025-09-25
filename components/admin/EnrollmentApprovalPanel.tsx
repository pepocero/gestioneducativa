'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { enrollmentRequestService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  RefreshCw, 
  Filter,
  MessageSquare,
  Calendar,
  GraduationCap,
  BookOpen
} from 'lucide-react'

interface EnrollmentRequest {
  request_id: string
  student_id: string
  student_name: string
  student_number: string
  subject_id: string
  subject_name: string
  subject_code: string
  career_id: string
  career_name: string
  cycle_id: string
  cycle_name: string
  academic_year: string
  semester: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  request_date: string
  reviewed_by?: string
  reviewed_by_name?: string
  reviewed_at?: string
  admin_notes?: string
  student_notes?: string
  created_at: string
  updated_at: string
}

export default function EnrollmentApprovalPanel() {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<EnrollmentRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all')

  useEffect(() => {
    loadRequests()
  }, [statusFilter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const filters = statusFilter === 'all' ? {} : { status: statusFilter }
      const data = await enrollmentRequestService.getAll(filters)
      setRequests(data as EnrollmentRequest[])
    } catch (error) {
      console.error('Error cargando solicitudes:', error)
      toast.error('Error cargando solicitudes de inscripción')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      await enrollmentRequestService.approve(requestId)
      toast.success('Solicitud aprobada correctamente')
      loadRequests()
      setShowDetailsModal(false)
      setSelectedRequest(null)
    } catch (error: any) {
      console.error('Error aprobando solicitud:', error)
      toast.error(error.message || 'Error aprobando solicitud')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await enrollmentRequestService.reject(requestId, rejectNotes || undefined)
      toast.success('Solicitud rechazada correctamente')
      loadRequests()
      setShowRejectModal(false)
      setShowDetailsModal(false)
      setSelectedRequest(null)
      setRejectNotes('')
    } catch (error: any) {
      console.error('Error rechazando solicitud:', error)
      toast.error(error.message || 'Error rechazando solicitud')
    }
  }

  const openDetailsModal = (request: EnrollmentRequest) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const openRejectModal = (request: EnrollmentRequest) => {
    setSelectedRequest(request)
    setShowRejectModal(true)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusCounts = () => {
    const counts = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Gestión de Inscripciones
          </h2>
          <Button
            onClick={loadRequests}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.total}</div>
            <div className="text-sm text-blue-800">Total</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-yellow-800">Pendientes</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
            <div className="text-sm text-green-800">Aprobadas</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            <div className="text-sm text-red-800">Rechazadas</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.cancelled}</div>
            <div className="text-sm text-gray-800">Canceladas</div>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="cancelled">Canceladas</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Lista de solicitudes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Solicitudes de Inscripción</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay solicitudes de inscripción</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.request_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{request.subject_name}</h4>
                      <span className="text-sm text-gray-500">({request.subject_code})</span>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Estudiante:</strong> {request.student_name} ({request.student_number})</p>
                        <p><strong>Carrera:</strong> {request.career_name}</p>
                        <p><strong>Ciclo:</strong> {request.cycle_name}</p>
                      </div>
                      <div>
                        <p><strong>Período:</strong> {request.academic_year} - Semestre {request.semester}</p>
                        <p><strong>Solicitado:</strong> {formatDate(request.request_date)}</p>
                        {request.reviewed_at && (
                          <p><strong>Revisado:</strong> {formatDate(request.reviewed_at)}</p>
                        )}
                      </div>
                    </div>

                    {request.student_notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Notas del estudiante:
                        </h5>
                        <p className="text-sm text-gray-700">{request.student_notes}</p>
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-900 mb-1">Notas del administrador:</h5>
                        <p className="text-sm text-gray-700">{request.admin_notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      onClick={() => openDetailsModal(request)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    
                    {request.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApprove(request.request_id)}
                          variant="success"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => openRejectModal(request)}
                          variant="danger"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de detalles */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detalles de la Solicitud</h3>
              <Button onClick={() => setShowDetailsModal(false)} variant="outline" size="sm">
                Cerrar
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Información Académica
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Materia:</strong> {selectedRequest.subject_name} ({selectedRequest.subject_code})</p>
                    <p><strong>Carrera:</strong> {selectedRequest.career_name}</p>
                    <p><strong>Ciclo:</strong> {selectedRequest.cycle_name}</p>
                    <p><strong>Período:</strong> {selectedRequest.academic_year} - Semestre {selectedRequest.semester}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Información del Estudiante
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {selectedRequest.student_name}</p>
                    <p><strong>Número:</strong> {selectedRequest.student_number}</p>
                    <p><strong>Estado:</strong> {getStatusBadge(selectedRequest.status)}</p>
                    <p><strong>Solicitado:</strong> {formatDate(selectedRequest.request_date)}</p>
                  </div>
                </div>
              </div>

              {selectedRequest.student_notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notas del Estudiante</h4>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedRequest.student_notes}</p>
                  </div>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notas del Administrador</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(selectedRequest.request_id)}
                    variant="success"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar Solicitud
                  </Button>
                  <Button
                    onClick={() => openRejectModal(selectedRequest)}
                    variant="danger"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar Solicitud
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de rechazo */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Rechazar Solicitud</h3>
              <Button onClick={() => setShowRejectModal(false)} variant="outline" size="sm">
                Cerrar
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                ¿Estás seguro de que quieres rechazar la solicitud de inscripción a 
                <strong> {selectedRequest.subject_name}</strong> del estudiante 
                <strong> {selectedRequest.student_name}</strong>?
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del rechazo (opcional)
                </label>
                <Textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Explica el motivo del rechazo..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setShowRejectModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleReject(selectedRequest.request_id)}
                  variant="danger"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
