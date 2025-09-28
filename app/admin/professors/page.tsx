'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateProfessorForm from '@/components/forms/CreateProfessorForm'
import EditProfessorForm from '@/components/forms/EditProfessorForm'
import DeleteProfessorModal from '@/components/modals/DeleteProfessorModal'
import AssignSubjectsToProfessorModal from '@/components/modals/AssignSubjectsToProfessorModal'
import { professorService, professorSubjectService } from '@/lib/supabase-service'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Users, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  BookOpen,
  Edit,
  Trash2,
  Search,
  Filter,
  GraduationCap,
  Link
} from 'lucide-react'

export default function ProfessorsPage() {
  const { institutionId, loading: userLoading } = useCurrentUser()
  const [professors, setProfessors] = useState<any[]>([])
  const [professorSubjects, setProfessorSubjects] = useState<{[key: string]: any[]}>({})
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Cargar profesores al montar el componente
  useEffect(() => {
    if (institutionId && !userLoading) {
      loadProfessors()
    }
  }, [institutionId, userLoading])

  const loadProfessors = async () => {
    if (!institutionId) return
    
    try {
      setLoading(true)
      const professorsData = await professorService.getAll(institutionId)
      setProfessors(professorsData)
      
      // Cargar materias asignadas para cada profesor
      const subjectsMap: {[key: string]: any[]} = {}
      for (const professor of professorsData) {
        try {
          const assignments = await professorSubjectService.getByProfessor(professor.id)
          subjectsMap[professor.id] = assignments
        } catch (error) {
          console.error(`Error cargando materias para profesor ${professor.id}:`, error)
          subjectsMap[professor.id] = []
        }
      }
      setProfessorSubjects(subjectsMap)
    } catch (error) {
      console.error('Error cargando profesores:', error)
      toast.error('Error cargando profesores')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfessor = () => {
    loadProfessors()
    setShowCreateForm(false)
  }

  const handleEditProfessor = (professor: any) => {
    setSelectedProfessor(professor)
    setShowEditForm(true)
  }

  const handleProfessorUpdated = () => {
    loadProfessors()
    setShowEditForm(false)
    setSelectedProfessor(null)
  }

  const handleDeleteProfessor = (professor: any) => {
    setSelectedProfessor(professor)
    setShowDeleteModal(true)
  }

  const handleProfessorDeleted = () => {
    loadProfessors()
    setShowDeleteModal(false)
    setSelectedProfessor(null)
  }

  const handleAssignSubjects = (professor: any) => {
    setSelectedProfessor(professor)
    setShowAssignModal(true)
  }

  const handleSubjectsAssigned = () => {
    loadProfessors()
    setShowAssignModal(false)
    setSelectedProfessor(null)
  }

  // Filtrar profesores
  const filteredProfessors = professors.filter(professor => {
    const matchesSearch = searchTerm === '' || 
      professor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Asumir que todos los profesores están activos por defecto si no hay campo is_active
    const isActive = professor.is_active !== false
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && isActive) ||
                         (filterStatus === 'inactive' && !isActive)
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (professor: any) => {
    const isActive = professor.is_active !== false
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    )
  }

  // Estadísticas
  const stats = {
    total: professors.length,
    active: professors.filter(p => p.is_active !== false).length,
    inactive: professors.filter(p => p.is_active === false).length,
    thisMonth: professors.filter(p => {
      const createdDate = new Date(p.created_at)
      const now = new Date()
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear()
    }).length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profesores</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona todos los profesores de tu institución
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Profesor
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Profesores</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Activos</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Inactivos</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{stats.thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                >
                  Activos
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactivos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de profesores */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lista de Profesores</h3>
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
                <p className="mt-2 text-gray-500">Cargando profesores...</p>
              </div>
            ) : filteredProfessors.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No se encontraron profesores'
                    : 'No hay profesores registrados'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Intenta con otros criterios de búsqueda'
                    : 'Comienza agregando el primer profesor a tu institución.'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Profesor
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProfessors.map((professor) => {
                  const assignedSubjects = professorSubjects[professor.id] || []
                  return (
                    <div key={professor.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <GraduationCap className="h-6 w-6 text-purple-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">
                              {professor.first_name} {professor.last_name}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {professor.email}
                              </span>
                              {professor.phone && (
                                <span className="text-sm text-gray-600 flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {professor.phone}
                                </span>
                              )}
                              <span className="text-sm text-gray-600 flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" />
                                {assignedSubjects.length} materia{assignedSubjects.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {/* Mostrar materias asignadas */}
                            {assignedSubjects.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-2">
                                  {assignedSubjects.slice(0, 3).map((assignment: any) => (
                                    <span 
                                      key={assignment.id}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {assignment.subjects_new?.code || assignment.subjects?.code}: {assignment.subjects_new?.name || assignment.subjects?.name}
                                    </span>
                                  ))}
                                  {assignedSubjects.length > 3 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      +{assignedSubjects.length - 3} más
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-400">
                                Registrado: {new Date(professor.created_at).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-400">
                                ID: {professor.id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(professor)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAssignSubjects(professor)}
                            className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                            title="Asignar materias"
                          >
                            <Link className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProfessor(professor)}
                            title="Editar profesor"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProfessor(professor)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                            title="Eliminar profesor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modales */}
        {showCreateForm && (
          <CreateProfessorForm
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateProfessor}
          />
        )}

        {showEditForm && selectedProfessor && (
          <EditProfessorForm
            professor={selectedProfessor}
            onClose={() => {
              setShowEditForm(false)
              setSelectedProfessor(null)
            }}
            onSave={handleProfessorUpdated}
          />
        )}

        {showDeleteModal && selectedProfessor && (
          <DeleteProfessorModal
            professor={selectedProfessor}
            onClose={() => {
              setShowDeleteModal(false)
              setSelectedProfessor(null)
            }}
            onConfirm={handleProfessorDeleted}
          />
        )}

        {showAssignModal && selectedProfessor && (
          <AssignSubjectsToProfessorModal
            professor={selectedProfessor}
            onClose={() => {
              setShowAssignModal(false)
              setSelectedProfessor(null)
            }}
            onSave={handleSubjectsAssigned}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
