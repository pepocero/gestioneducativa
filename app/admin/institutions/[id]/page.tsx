'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import CreateStudentForm from '@/components/forms/CreateStudentForm'
import CreateProfessorForm from '@/components/forms/CreateProfessorForm'
import EditInstitutionForm from '@/components/forms/EditInstitutionForm'
import DeleteInstitutionModal from '@/components/modals/DeleteInstitutionModal'
import { professorService, studentService, institutionService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCheck,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react'

export default function InstitutionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const institutionId = params.id as string
  
  const [showCreateStudentForm, setShowCreateStudentForm] = useState(false)
  const [showCreateProfessorForm, setShowCreateProfessorForm] = useState(false)
  const [showEditInstitutionForm, setShowEditInstitutionForm] = useState(false)
  const [showDeleteInstitutionModal, setShowDeleteInstitutionModal] = useState(false)
  const [activeTab, setActiveTab] = useState('estudiantes')
  const [professors, setProfessors] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [institution, setInstitution] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Cargar datos al montar el componente o cuando cambie el ID
  useEffect(() => {
    if (institutionId) {
      loadData()
    }
  }, [institutionId])

  const loadData = async () => {
    if (!institutionId) return
    
    setLoading(true)
    try {
      console.log('🔍 Cargando datos para institución:', institutionId)
      const [professorsData, studentsData, institutionData] = await Promise.all([
        professorService.getAll(institutionId),
        studentService.getAll(institutionId),
        institutionService.getById(institutionId)
      ])
      setProfessors(professorsData)
      setStudents(studentsData)
      setInstitution(institutionData)
      console.log('✅ Datos cargados exitosamente')
    } catch (error) {
      console.error('❌ Error cargando datos:', error)
      toast.error('Error cargando datos de la institución')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = (studentData: any) => {
    console.log('Nuevo estudiante creado:', studentData)
    toast.success('Estudiante creado exitosamente')
    loadData() // Recargar datos
  }

  const handleCreateProfessor = (professorData: any) => {
    console.log('Nuevo profesor creado:', professorData)
    toast.success('Profesor creado exitosamente')
    loadData() // Recargar datos
  }

  const handleEditInstitution = (institutionData: any) => {
    console.log('Institución actualizada:', institutionData)
    toast.success('Institución actualizada exitosamente')
    loadData() // Recargar datos
  }

  const handleDeleteInstitution = () => {
    console.log('Institución eliminada')
    toast.success('Institución eliminada exitosamente')
    // Redirigir a la lista de instituciones
    window.location.href = '/admin/institutions'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/institutions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detalles de {institution?.name || 'Universidad Nacional'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Facultad Regional Buenos Aires
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              onClick={() => setShowEditInstitutionForm(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Institución
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteInstitutionModal(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Institución
            </Button>
          </div>
        </div>

        {/* Información de la institución */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Información General</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nombre</p>
                    <p className="text-sm text-gray-500">{institution?.name || 'Universidad Nacional'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dirección</p>
                    <p className="text-sm text-gray-500">{institution?.address || 'Av. Principal 123, Ciudad, País'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Teléfono</p>
                    <p className="text-sm text-gray-500">{institution?.phone || '+54 11 1234-5678'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">{institution?.email || 'No especificado'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 flex items-center justify-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activa
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estado</p>
                    <p className="text-sm text-gray-500">Operativa</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
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
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Profesores</p>
                  <p className="text-2xl font-semibold text-gray-900">{professors.length}</p>
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
                  <p className="text-sm font-medium text-gray-500">Carreras</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Materias</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pestañas de gestión */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button 
              onClick={() => setActiveTab('estudiantes')}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'estudiantes' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estudiantes
            </button>
            <button 
              onClick={() => setActiveTab('profesores')}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'profesores' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profesores
            </button>
            <button 
              onClick={() => setActiveTab('carreras')}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'carreras' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Carreras
            </button>
            <button 
              onClick={() => setActiveTab('materias')}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'materias' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Materias
            </button>
          </nav>
        </div>

        {/* Contenido de gestión de estudiantes */}
        {activeTab === 'estudiantes' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Gestión de Estudiantes</h3>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCreateStudentForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Estudiante
                </Button>
                <Button variant="outline" size="sm">
                  Importar CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex items-center space-x-4">
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Todas las carreras</option>
                  <option>Ingeniería en Sistemas</option>
                  <option>Ingeniería Industrial</option>
                  <option>Ingeniería Química</option>
                </select>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Todos los años</option>
                  <option>1er Año</option>
                  <option>2do Año</option>
                  <option>3er Año</option>
                  <option>4to Año</option>
                  <option>5to Año</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Buscar estudiante..." 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
                />
              </div>

              {/* Lista de estudiantes */}
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Cargando estudiantes...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes registrados</h3>
                    <p className="text-gray-500 mb-4">Comienza agregando el primer estudiante a esta institución.</p>
                    <Button onClick={() => setShowCreateStudentForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primer Estudiante
                    </Button>
                  </div>
                ) : (
                  students.map((student) => {
                    const initials = `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase()
                    const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-yellow-100 text-yellow-600']
                    const colorClass = colors[Math.floor(Math.random() * colors.length)]
                    
                    return (
                      <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center`}>
                                <span className="text-lg font-medium">{initials}</span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </h4>
                              <p className="text-sm text-gray-500">{student.email}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-400">🎓 {student.careers?.name || 'Sin carrera'}</span>
                                <span className="text-xs text-gray-400">📅 {student.student_number || 'Sin número'}</span>
                                <span className="text-xs text-gray-400">📊 Promedio: {student.average_grade || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {student.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                            <Button variant="outline" size="sm">
                              Ver Perfil
                            </Button>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Dar de Baja
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Contenido de gestión de profesores */}
        {activeTab === 'profesores' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Gestión de Profesores</h3>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCreateProfessorForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Profesor
                </Button>
                <Button variant="outline" size="sm">
                  Importar CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex items-center space-x-4">
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Todas las especializaciones</option>
                  <option>Ingeniería en Sistemas</option>
                  <option>Ingeniería Industrial</option>
                  <option>Ingeniería Química</option>
                  <option>Matemáticas</option>
                </select>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Todos los estados</option>
                  <option>Activos</option>
                  <option>Inactivos</option>
                  <option>En licencia</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Buscar profesor..." 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
                />
              </div>

              {/* Lista de profesores */}
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Cargando profesores...</p>
                  </div>
                ) : professors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay profesores registrados</p>
                  </div>
                ) : (
                  professors.map((professor) => {
                    const initials = `${professor.first_name?.[0] || ''}${professor.last_name?.[0] || ''}`.toUpperCase()
                    const colors = ['bg-green-100 text-green-600', 'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-yellow-100 text-yellow-600']
                    const colorClass = colors[Math.floor(Math.random() * colors.length)]
                    
                    return (
                      <div key={professor.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center`}>
                                <span className="text-lg font-medium">{initials}</span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {professor.first_name} {professor.last_name}
                              </h4>
                              <p className="text-sm text-gray-500">{professor.email}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-400">👨‍🏫 Profesor</span>
                                <span className="text-xs text-gray-400">📞 {professor.phone || 'Sin teléfono'}</span>
                                <span className="text-xs text-gray-400">📅 Registrado: {new Date(professor.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Activo
                            </span>
                            <Button variant="outline" size="sm">
                              Ver Perfil
                            </Button>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Dar de Baja
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Contenido de gestión de carreras */}
        {activeTab === 'carreras' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Gestión de Carreras</h3>
              <Button onClick={() => router.push('/admin/careers')}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Ir a Carreras
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Gestión Completa de Carreras</h4>
              <p className="text-gray-500 mb-4">
                Accede a la sección completa de carreras para crear, editar y gestionar todas las carreras académicas.
              </p>
              <Button onClick={() => router.push('/admin/careers')}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Ver Todas las Carreras
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Contenido de gestión de materias */}
        {activeTab === 'materias' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Gestión de Materias</h3>
              <Button onClick={() => router.push('/admin/subjects')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Ir a Materias
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Gestión Completa de Materias</h4>
              <p className="text-gray-500 mb-4">
                Accede a la sección completa de materias para crear, editar y gestionar todas las materias académicas.
              </p>
              <Button onClick={() => router.push('/admin/subjects')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Ver Todas las Materias
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Formulario de creación de estudiante */}
        {showCreateStudentForm && (
          <CreateStudentForm
            onClose={() => setShowCreateStudentForm(false)}
            onSave={handleCreateStudent}
          />
        )}

        {/* Formulario de creación de profesor */}
        {showCreateProfessorForm && (
          <CreateProfessorForm
            onClose={() => setShowCreateProfessorForm(false)}
            onSave={handleCreateProfessor}
          />
        )}

        {/* Formulario de edición de institución */}
        {showEditInstitutionForm && institution && (
          <EditInstitutionForm
            institution={institution}
            onClose={() => setShowEditInstitutionForm(false)}
            onSave={handleEditInstitution}
          />
        )}

        {/* Modal de eliminación de institución */}
        {showDeleteInstitutionModal && institution && (
          <DeleteInstitutionModal
            institution={institution}
            onClose={() => setShowDeleteInstitutionModal(false)}
            onDelete={handleDeleteInstitution}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
