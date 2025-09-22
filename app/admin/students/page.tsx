'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateStudentForm from '@/components/forms/CreateStudentForm'
import EditStudentForm from '@/components/forms/EditStudentForm'
import DeleteStudentModal from '@/components/modals/DeleteStudentModal'
import EnrollStudentForm from '@/components/forms/EnrollStudentForm'
import { studentService, careerService } from '@/lib/supabase-service'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  BookOpen,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react'

export default function StudentsPage() {
  const { institutionId, loading: userLoading } = useCurrentUser()
  const [students, setStudents] = useState<any[]>([])
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    if (institutionId && !userLoading) {
      loadStudents()
    }
  }, [institutionId, userLoading])

  const loadStudents = async () => {
    if (!institutionId) return
    
    try {
      setLoading(true)
      const [studentsData, careersData] = await Promise.all([
        studentService.getAll(institutionId),
        careerService.getAll(institutionId)
      ])
      setStudents(studentsData)
      setCareers(careersData)
    } catch (error) {
      console.error('Error cargando estudiantes:', error)
      toast.error('Error cargando estudiantes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = () => {
    loadStudents()
    setShowCreateForm(false)
  }

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student)
    setShowEditForm(true)
  }

  const handleStudentUpdated = () => {
    loadStudents()
    setShowEditForm(false)
    setSelectedStudent(null)
  }

  const handleDeleteStudent = (student: any) => {
    setSelectedStudent(student)
    setShowDeleteModal(true)
  }

  const handleStudentDeleted = () => {
    loadStudents()
    setShowDeleteModal(false)
    setSelectedStudent(null)
  }

  const handleEnrollStudent = (student: any) => {
    setSelectedStudent(student)
    setShowEnrollForm(true)
  }

  const handleEnrollComplete = () => {
    loadStudents()
    setShowEnrollForm(false)
    setSelectedStudent(null)
  }

  const getStatusBadge = (student: any) => {
    if (!student.career_id) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Sin Carrera
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Inscrito
      </span>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estudiantes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona todos los estudiantes de tu institución
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Estudiante
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Estudiantes</p>
                  <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Inscritos en Carrera</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {students.filter(s => s.career_id).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserPlus className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Sin Carrera</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {students.filter(s => !s.career_id).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Este Mes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {students.filter(s => {
                      const enrollmentDate = new Date(s.enrollment_date)
                      const now = new Date()
                      return enrollmentDate.getMonth() === now.getMonth() && 
                             enrollmentDate.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de estudiantes */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lista de Estudiantes</h3>
          </CardHeader>
          <CardContent>
            {userLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando información del usuario...</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando estudiantes...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes registrados</h3>
                <p className="text-gray-500 mb-4">Comienza agregando el primer estudiante a tu institución.</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Estudiante
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-400 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {student.email}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {student.phone}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              DNI: {student.dni}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-400">
                              #{student.student_number}
                            </span>
                            <span className="text-xs text-gray-400">
                              Inscripción: {new Date(student.enrollment_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(student)}
                        {!student.career_id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEnrollStudent(student)}
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Inscribir
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteStudent(student)}
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

        {/* Modales */}
        {showCreateForm && (
          <CreateStudentForm
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateStudent}
          />
        )}

        {showEnrollForm && selectedStudent && (
          <EnrollStudentForm
            student={selectedStudent}
            onClose={() => {
              setShowEnrollForm(false)
              setSelectedStudent(null)
            }}
            onSave={handleEnrollComplete}
          />
        )}

        {showEditForm && selectedStudent && (
          <EditStudentForm
            student={selectedStudent}
            careers={careers}
            onClose={() => {
              setShowEditForm(false)
              setSelectedStudent(null)
            }}
            onSave={handleStudentUpdated}
          />
        )}

        {showDeleteModal && selectedStudent && (
          <DeleteStudentModal
            student={selectedStudent}
            onClose={() => {
              setShowDeleteModal(false)
              setSelectedStudent(null)
            }}
            onConfirm={handleStudentDeleted}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

