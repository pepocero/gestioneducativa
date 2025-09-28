'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateProfessorForm from '@/components/forms/CreateProfessorForm'
import EditProfessorForm from '@/components/forms/EditProfessorForm'
import DeleteProfessorModal from '@/components/modals/DeleteProfessorModal'
import AssignSubjectsToProfessorModal from '@/components/modals/AssignSubjectsToProfessorModal'
import { professorService, professorSubjectService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  UserCheck, 
  BookOpen, 
  Edit,
  Trash2,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react'

interface ProfessorsTabProps {
  institutionId: string
}

export default function ProfessorsTab({ institutionId }: ProfessorsTabProps) {
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

  // Cargar datos cuando el componente se monta o cambia institutionId
  useEffect(() => {
    loadProfessors()
  }, [institutionId])

  const loadProfessors = async () => {
    try {
      setLoading(true)
      const professorsData = await professorService.getAll(institutionId)
      setProfessors(professorsData)

      // Cargar materias asignadas para cada profesor
      const subjectsMap: {[key: string]: any[]} = {}
      for (const professor of professorsData) {
        try {
          const subjects = await professorSubjectService.getByProfessor(professor.id)
          subjectsMap[professor.id] = subjects
        } catch (error) {
          console.error(`Error cargando materias del profesor ${professor.id}:`, error)
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

  // Estadísticas
  const totalProfessors = professors.length
  const activeProfessors = professors.filter(professor => professor.is_active !== false).length
  const inactiveProfessors = professors.filter(professor => professor.is_active === false).length
  const thisMonth = new Date()
  thisMonth.setMonth(thisMonth.getMonth() - 1)
  const newThisMonth = professors.filter(professor => new Date(professor.created_at) > thisMonth).length

  // Filtros
  const filteredProfessors = professors.filter(professor => {
    const matchesSearch = !searchTerm || 
      professor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && professor.is_active !== false) ||
      (filterStatus === 'inactive' && professor.is_active === false)
    
    return matchesSearch && matchesStatus
  })

  const handleEdit = (professor: any) => {
    setSelectedProfessor(professor)
    setShowEditForm(true)
  }

  const handleDelete = (professor: any) => {
    setSelectedProfessor(professor)
    setShowDeleteModal(true)
  }

  const handleAssignSubjects = (professor: any) => {
    setSelectedProfessor(professor)
    setShowAssignModal(true)
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
          <h2 className="text-2xl font-bold text-gray-900">Profesores</h2>
          <p className="text-gray-600">Gestiona los profesores de esta institución</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Profesor
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalProfessors}</p>
                <p className="text-sm text-gray-600">Total Profesores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeProfessors}</p>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{inactiveProfessors}</p>
                <p className="text-sm text-gray-600">Inactivos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{newThisMonth}</p>
                <p className="text-sm text-gray-600">Nuevos (mes)</p>
              </div>
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
                  placeholder="Buscar profesor..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de profesores */}
      <div className="grid gap-4">
        {filteredProfessors.map((professor) => {
          const assignedSubjects = professorSubjects[professor.id] || []
          
          return (
            <Card key={professor.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {professor.first_name} {professor.last_name}
                      </h3>
                      <p className="text-gray-600">{professor.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {professor.phone && (
                          <span className="text-sm text-gray-500">{professor.phone}</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          professor.is_active !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {professor.is_active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      {/* Materias asignadas */}
                      {assignedSubjects.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-1">Materias asignadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {assignedSubjects.slice(0, 3).map((subject, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                              >
                                {subject.subject_name}
                              </span>
                            ))}
                            {assignedSubjects.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                +{assignedSubjects.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAssignSubjects(professor)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Asignar Materias
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(professor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(professor)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredProfessors.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay profesores</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'No se encontraron profesores con los filtros aplicados.'
                  : 'Comienza agregando tu primer profesor.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modales */}
      {showCreateForm && (
        <CreateProfessorForm
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            loadProfessors()
            setShowCreateForm(false)
          }}
        />
      )}

      {showEditForm && selectedProfessor && (
        <EditProfessorForm
          professor={selectedProfessor}
          onClose={() => {
            setShowEditForm(false)
            setSelectedProfessor(null)
          }}
          onSave={() => {
            loadProfessors()
            setShowEditForm(false)
            setSelectedProfessor(null)
          }}
        />
      )}

      {showDeleteModal && selectedProfessor && (
        <DeleteProfessorModal
          professor={selectedProfessor}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedProfessor(null)
          }}
          onDelete={() => {
            loadProfessors()
            setShowDeleteModal(false)
            setSelectedProfessor(null)
          }}
        />
      )}

      {showAssignModal && selectedProfessor && (
        <AssignSubjectsToProfessorModal
          professor={selectedProfessor}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedProfessor(null)
          }}
          onSave={() => {
            loadProfessors()
            setShowAssignModal(false)
            setSelectedProfessor(null)
          }}
        />
      )}
    </div>
  )
}
