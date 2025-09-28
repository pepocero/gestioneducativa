'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import EnrollmentRequestForm from '@/components/forms/EnrollmentRequestForm'
import { studentService, subjectService, careerService } from '@/lib/supabase-service'
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
  Trash2,
  UserPlus,
  Calendar
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EnrollmentsTabProps {
  institutionId: string
}

export default function EnrollmentsTab({ institutionId }: EnrollmentsTabProps) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    if (institutionId) {
      loadData()
    }
  }, [institutionId])

  const loadData = async () => {
    if (!institutionId) return
    
    try {
      setLoading(true)
      
      // Cargar inscripciones con datos relacionados y filtradas por institución
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          students(
            student_number,
            users(first_name, last_name, email, phone),
            careers(name, description)
          ),
          subjects_new(
            name, 
            code, 
            credits,
            description,
            careers(name, description)
          )
        `)
        .eq('students.institution_id', institutionId)
        .order('created_at', { ascending: false })

      if (enrollmentsError) {
        console.error('Error cargando inscripciones:', enrollmentsError)
        toast.error('Error cargando inscripciones')
        return
      }

      // Transformar los datos para que tengan la estructura esperada
      const transformedEnrollments = (enrollmentsData || []).map(enrollment => ({
        ...enrollment,
        student_name: enrollment.students?.users ? 
          `${enrollment.students.users.first_name} ${enrollment.students.users.last_name}` : 
          'Estudiante no encontrado',
        student_email: enrollment.students?.users?.email || '',
        student_phone: enrollment.students?.users?.phone || '',
        student_number: enrollment.students?.student_number || '',
        subject_name: enrollment.subjects_new?.name || 'Materia no encontrada',
        subject_code: enrollment.subjects_new?.code || '',
        subject_credits: enrollment.subjects_new?.credits || 0,
        subject_description: enrollment.subjects_new?.description || '',
        career_name: enrollment.students?.careers?.name || enrollment.subjects_new?.careers?.name || 'Carrera no encontrada',
        career_description: enrollment.students?.careers?.description || enrollment.subjects_new?.careers?.description || '',
        enrollment_date: enrollment.enrollment_date || enrollment.created_at
      }))

      setEnrollments(transformedEnrollments)

      // Cargar datos básicos para formularios
      const [studentsData, subjectsData, careersData] = await Promise.all([
        studentService.getAll(institutionId),
        subjectService.getAll(institutionId),
        careerService.getAll(institutionId)
      ])
      
      setStudents(studentsData)
      setSubjects(subjectsData)
      setCareers(careersData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
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
      },
      completed: { 
        icon: CheckCircle, 
        color: 'bg-green-100 text-green-800', 
        label: 'Completado' 
      },
      dropped: { 
        icon: XCircle, 
        color: 'bg-red-100 text-red-800', 
        label: 'Abandonado' 
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

  // Filtrar inscripciones
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus
    const matchesSearch = !searchTerm || 
      enrollment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.career_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  // Calcular estadísticas
  const statusCounts = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    enrolled: enrollments.filter(e => e.status === 'enrolled').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
    dropped: enrollments.filter(e => e.status === 'dropped').length
  }

  // Función para manejar cambio de estado
  const handleStatusUpdate = async (enrollmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ status: newStatus })
        .eq('id', enrollmentId)

      if (error) {
        console.error('Error actualizando estado:', error)
        toast.error('Error actualizando estado')
        return
      }

      toast.success('Estado actualizado exitosamente')
      loadData() // Recargar la lista de inscripciones
    } catch (error) {
      console.error('Error actualizando estado:', error)
      toast.error('Error actualizando estado')
    }
  }

  // Función para inscribir estudiante (de approved a enrolled)
  const handleEnrollStudent = async (enrollmentId: string) => {
    await handleStatusUpdate(enrollmentId, 'enrolled')
  }

  // Función para eliminar inscripción
  const handleDeleteEnrollment = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId)

      if (error) {
        console.error('Error eliminando inscripción:', error)
        toast.error('Error eliminando inscripción')
        return
      }

      toast.success('Inscripción eliminada exitosamente')
      loadData() // Recargar la lista
      setShowDeleteModal(false)
      setEnrollmentToDelete(null)
    } catch (error) {
      console.error('Error eliminando inscripción:', error)
      toast.error('Error eliminando inscripción')
    }
  }

  // Función para editar inscripción
  const handleEditEnrollment = async (enrollmentId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update(updates)
        .eq('id', enrollmentId)

      if (error) {
        console.error('Error editando inscripción:', error)
        toast.error('Error editando inscripción')
        return
      }

      toast.success('Inscripción actualizada exitosamente')
      loadData() // Recargar la lista
      setShowEditModal(false)
      setSelectedEnrollment(null)
    } catch (error) {
      console.error('Error editando inscripción:', error)
      toast.error('Error editando inscripción')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header y estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inscripciones</h2>
          <p className="text-gray-600">Gestiona las inscripciones de esta institución</p>
        </div>
        <Button onClick={() => setShowRequestForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Estadísticas compactas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{statusCounts.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-600">{statusCounts.pending}</p>
              <p className="text-xs text-gray-600">Pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{statusCounts.approved}</p>
              <p className="text-xs text-gray-600">Aprobadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">{statusCounts.enrolled}</p>
              <p className="text-xs text-gray-600">Inscritos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{statusCounts.completed}</p>
              <p className="text-xs text-gray-600">Completados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xl font-bold text-red-600">{statusCounts.rejected + statusCounts.dropped}</p>
              <p className="text-xs text-gray-600">Rechazados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, código de estudiante, materia o carrera..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobadas</option>
                <option value="enrolled">Inscritos</option>
                <option value="completed">Completados</option>
                <option value="rejected">Rechazadas</option>
                <option value="dropped">Abandonados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de inscripciones */}
      <div className="space-y-4">
        {filteredEnrollments.map((enrollment) => (
          <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Información del estudiante */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {enrollment.student_name}
                      </h3>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      {/* ID del estudiante */}
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">ID:</span>
                        <span className="ml-2">{enrollment.student_number}</span>
                      </div>
                      
                      {/* Email del estudiante */}
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">Email:</span>
                        <span className="ml-2 truncate">{enrollment.student_email || 'No disponible'}</span>
                      </div>
                      
                      {/* Materia */}
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-medium text-gray-900">{enrollment.subject_name}</span>
                          {enrollment.subject_code && (
                            <span className="text-gray-500 ml-1">({enrollment.subject_code})</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Carrera */}
                      <div className="flex items-center md:col-span-2">
                        <GraduationCap className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{enrollment.career_name}</span>
                      </div>
                      
                      {/* Fecha de solicitud */}
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span>{new Date(enrollment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex items-center space-x-2 ml-4">
                  {/* Botón Editar */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedEnrollment(enrollment)
                      setShowEditModal(true)
                    }}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  
                  {/* Botón Eliminar */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEnrollmentToDelete(enrollment)
                      setShowDeleteModal(true)
                    }}
                    className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                  
                  {/* Botones de estado específicos */}
                  {enrollment.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(enrollment.id, 'approved')}
                        className="!bg-blue-50 !text-blue-600 border !border-blue-200 hover:!bg-blue-100"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(enrollment.id, 'rejected')}
                        className="!bg-red-50 !text-red-600 border !border-red-200 hover:!bg-red-100"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    </>
                  )}
                  
                  {enrollment.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => handleEnrollStudent(enrollment.id)}
                      className="!bg-blue-50 !text-blue-600 border !border-blue-200 hover:!bg-blue-100"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Inscribir
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredEnrollments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay inscripciones</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'No se encontraron inscripciones con los filtros aplicados.'
                  : 'Comienza creando tu primera solicitud de inscripción.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de formulario de solicitud */}
      {showRequestForm && (
        <EnrollmentRequestForm
          onClose={() => setShowRequestForm(false)}
          onSave={() => {
            loadData()
            setShowRequestForm(false)
          }}
        />
      )}

      {/* Modal de edición */}
      {showEditModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Editar Estado de Inscripción</h3>
            <p className="text-gray-600 mb-4">
              <strong>Estudiante:</strong> {selectedEnrollment.student_name}<br/>
              <strong>Materia:</strong> {selectedEnrollment.subject_name}<br/>
              <strong>Estado actual:</strong> {selectedEnrollment.status}
            </p>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Nuevo Estado:
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={selectedEnrollment.status}
                onChange={(e) => {
                  handleEditEnrollment(selectedEnrollment.id, { status: e.target.value })
                }}
              >
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobada</option>
                <option value="rejected">Rechazada</option>
                <option value="enrolled">Inscrito</option>
                <option value="completed">Completado</option>
                <option value="dropped">Abandonado</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedEnrollment(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de eliminación */}
      {showDeleteModal && enrollmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Eliminar Inscripción</h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres eliminar esta inscripción?
            </p>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p><strong>Estudiante:</strong> {enrollmentToDelete.student_name}</p>
              <p><strong>Materia:</strong> {enrollmentToDelete.subject_name}</p>
              <p><strong>Estado:</strong> {enrollmentToDelete.status}</p>
            </div>
            <p className="text-red-600 text-sm mb-4">
              Esta acción no se puede deshacer.
            </p>
            
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
                onClick={() => handleDeleteEnrollment(enrollmentToDelete.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
