'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import EnrollmentRequestForm from '@/components/forms/EnrollmentRequestForm'
import { studentService, subjectService, careerService } from '@/lib/supabase-service'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useEnrollments } from '@/hooks/useGrades'
import { supabase } from '@/lib/supabase'
import { 
  GraduationCap, 
  User, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function EnrollmentsPage() {
  const { institutionId, loading: userLoading } = useCurrentUser()
  const { enrollments, loading, refetch } = useEnrollments()
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [careers, setCareers] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<any>(null)

  // Cargar datos básicos al montar el componente
  useEffect(() => {
    if (institutionId && !userLoading) {
      loadBasicData()
    }
  }, [institutionId, userLoading])

  const loadBasicData = async () => {
    if (!institutionId) return
    
    try {
      // Cargar datos básicos
      const [studentsData, subjectsData, careersData] = await Promise.all([
        studentService.getAll(institutionId),
        subjectService.getAll(institutionId),
        careerService.getAll(institutionId)
      ])
      
      setStudents(studentsData)
      setSubjects(subjectsData)
      setCareers(careersData)
    } catch (error) {
      console.error('Error cargando datos básicos:', error)
      toast.error('Error cargando datos básicos')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        icon: Clock, 
        color: 'bg-yellow-100 text-yellow-800', 
        label: 'Pendiente' 
      },
      approved: { 
        icon: CheckCircle, 
        color: 'bg-green-100 text-green-800', 
        label: 'Aprobada' 
      },
      rejected: { 
        icon: XCircle, 
        color: 'bg-red-100 text-red-800', 
        label: 'Rechazada' 
      },
      enrolled: { 
        icon: GraduationCap, 
        color: 'bg-blue-100 text-blue-800', 
        label: 'Inscrito' 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      enrollment.students?.users?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.students?.users?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.subjects_new?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.subjects_new?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
    enrolled: enrollments.filter(e => e.status === 'enrolled').length
  }

  const handleRequestSaved = () => {
    refetch()
    setShowRequestForm(false)
  }

  const handleViewEnrollment = (enrollment: any) => {
    setSelectedEnrollment(enrollment)
    setShowViewModal(true)
  }

  const handleEditEnrollment = (enrollment: any) => {
    setSelectedEnrollment(enrollment)
    setShowEditModal(true)
  }

  const handleDeleteEnrollment = (enrollment: any) => {
    setEnrollmentToDelete(enrollment)
    setShowDeleteModal(true)
  }

  const confirmDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return
    
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentToDelete.id)
      
      if (error) throw error
      
      toast.success('Inscripción eliminada correctamente')
      refetch()
      setShowDeleteModal(false)
      setEnrollmentToDelete(null)
    } catch (error) {
      console.error('Error eliminando inscripción:', error)
      toast.error('Error eliminando inscripción')
    }
  }

  const handleApproveEnrollment = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ status: 'approved' })
        .eq('id', enrollmentId)
      
      if (error) throw error
      
      toast.success('Inscripción aprobada correctamente')
      refetch()
    } catch (error) {
      console.error('Error aprobando inscripción:', error)
      toast.error('Error aprobando inscripción')
    }
  }

  const handleRejectEnrollment = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ status: 'rejected' })
        .eq('id', enrollmentId)
      
      if (error) throw error
      
      toast.success('Inscripción rechazada correctamente')
      refetch()
    } catch (error) {
      console.error('Error rechazando inscripción:', error)
      toast.error('Error rechazando inscripción')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {userLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando datos del usuario...</span>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Inscripciones</h1>
            <p className="mt-1 text-sm text-gray-500">
              Administra las inscripciones de estudiantes a materias
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => setShowRequestForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Inscripción
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{statusCounts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{statusCounts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Aprobadas</p>
                  <p className="text-2xl font-semibold text-gray-900">{statusCounts.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rechazadas</p>
                  <p className="text-2xl font-semibold text-gray-900">{statusCounts.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Inscritos</p>
                  <p className="text-2xl font-semibold text-gray-900">{statusCounts.enrolled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por estudiante o materia..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filterStatus === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  Pendientes
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('approved')}
                >
                  Aprobadas
                </Button>
                <Button
                  variant={filterStatus === 'rejected' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('rejected')}
                >
                  Rechazadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de inscripciones */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Inscripciones</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando inscripciones...</p>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay inscripciones</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No se encontraron inscripciones con los filtros aplicados.'
                    : 'Aún no hay inscripciones registradas en el sistema.'
                  }
                </p>
                <Button onClick={() => setShowRequestForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Inscripción
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {enrollment.students?.users?.first_name} {enrollment.students?.users?.last_name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              <strong>Estudiante:</strong> #{enrollment.students?.student_number}
                            </span>
                            <span className="text-sm text-gray-600">
                              <strong>Materia:</strong> {enrollment.subjects_new?.name} ({enrollment.subjects_new?.code})
                            </span>
                            <span className="text-sm text-gray-600">
                              <strong>Carrera ID:</strong> {enrollment.subjects_new?.career_id}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-400">
                              <strong>Inscripción:</strong> {new Date(enrollment.enrollment_date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-400">
                              <strong>Estado:</strong> {enrollment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(enrollment.status)}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewEnrollment(enrollment)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {enrollment.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApproveEnrollment(enrollment.id)}
                              title="Aprobar inscripción"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectEnrollment(enrollment.id)}
                              title="Rechazar inscripción"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditEnrollment(enrollment)}
                          title="Editar inscripción"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteEnrollment(enrollment)}
                          title="Eliminar inscripción"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Nueva Solicitud */}
        {showRequestForm && (
          <EnrollmentRequestForm
            onClose={() => setShowRequestForm(false)}
            onSave={handleRequestSaved}
          />
        )}

        {/* Modal de Ver Detalles */}
        {showViewModal && selectedEnrollment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalles de la Inscripción</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowViewModal(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estudiante</label>
                    <p className="text-sm text-gray-900">
                      {selectedEnrollment.students?.users?.first_name} {selectedEnrollment.students?.users?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Estudiante</label>
                    <p className="text-sm text-gray-900">#{selectedEnrollment.students?.student_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Materia</label>
                    <p className="text-sm text-gray-900">
                      {selectedEnrollment.subjects_new?.name} ({selectedEnrollment.subjects_new?.code})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Carrera ID</label>
                    <p className="text-sm text-gray-900">{selectedEnrollment.subjects_new?.career_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedEnrollment.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Inscripción</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedEnrollment.enrollment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Editar */}
        {showEditModal && selectedEnrollment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Editar Estado</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de la Inscripción
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={selectedEnrollment.status}
                    onChange={async (e) => {
                      try {
                        const { error } = await supabase
                          .from('enrollments')
                          .update({ status: e.target.value })
                          .eq('id', selectedEnrollment.id)
                        
                        if (error) throw error
                        
                        toast.success('Estado actualizado correctamente')
                        refetch()
                        setShowEditModal(false)
                      } catch (error) {
                        console.error('Error actualizando estado:', error)
                        toast.error('Error actualizando estado')
                      }
                    }}
                  >
                    <option value="enrolled">Inscrito</option>
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                    <option value="completed">Completado</option>
                    <option value="dropped">Abandonado</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Eliminación */}
        {showDeleteModal && enrollmentToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Eliminar Inscripción</h3>
                  <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-3">
                  ¿Estás seguro de que quieres eliminar esta inscripción?
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm">
                    <p><strong>Estudiante:</strong> {enrollmentToDelete.students?.users?.first_name} {enrollmentToDelete.students?.users?.last_name}</p>
                    <p><strong>Materia:</strong> {enrollmentToDelete.subjects_new?.name} ({enrollmentToDelete.subjects_new?.code})</p>
                    <p><strong>Estado:</strong> {enrollmentToDelete.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setEnrollmentToDelete(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDeleteEnrollment}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
