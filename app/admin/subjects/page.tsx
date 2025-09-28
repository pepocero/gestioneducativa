'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateSubjectForm from '@/components/forms/CreateSubjectForm'
import EditSubjectForm from '@/components/forms/EditSubjectForm'
import DeleteSubjectModal from '@/components/modals/DeleteSubjectModal'
import { subjectService, careerService } from '@/lib/supabase-service'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  BookOpen, 
  Clock, 
  Users, 
  Edit,
  Trash2,
  Settings,
  Calendar,
  GraduationCap,
  Search,
  Filter
} from 'lucide-react'

export default function SubjectsPage() {
  const { institutionId, loading: userLoading } = useCurrentUser()
  const [subjects, setSubjects] = useState<any[]>([])
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  // Cargar datos cuando institutionId esté disponible  
  useEffect(() => {
    if (institutionId && !userLoading) {
      loadData()
    }
  }, [institutionId, userLoading])

  const loadData = async () => {
    if (!institutionId) return
    
    try {
      setLoading(true)
      const [subjectsData, careersData] = await Promise.all([
        subjectService.getAll(institutionId),
        careerService.getAll(institutionId)
      ])
      setSubjects(subjectsData)
      setCareers(careersData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const loadSubjects = async () => {
    if (!institutionId) return
    
    try {
      setLoading(true)
      const subjectsData = await subjectService.getAll(institutionId)
      setSubjects(subjectsData)
    } catch (error) {
      console.error('Error cargando materias:', error)
      toast.error('Error cargando materias')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = () => {
    loadSubjects()
    setShowCreateForm(false)
  }

  const handleEditSubject = (subject: any) => {
    setSelectedSubject(subject)
    setShowEditForm(true)
  }

  const handleDeleteSubject = (subject: any) => {
    setSelectedSubject(subject)
    setShowDeleteModal(true)
  }

  const handleSubjectUpdated = () => {
    loadSubjects()
    setShowEditForm(false)
    setSelectedSubject(null)
  }

  const handleSubjectDeleted = () => {
    loadSubjects()
    setShowDeleteModal(false)
    setSelectedSubject(null)
  }

  // Filtrar materias
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && subject.is_active) ||
                         (filterActive === 'inactive' && !subject.is_active)
    
    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona las materias académicas de tu institución
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Materia
          </Button>
        </div>

        {/* Estadísticas de materias */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Materias</p>
                  <p className="text-2xl font-semibold text-gray-900">{subjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Materias Activas</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {subjects.filter(s => s.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Horas Totales</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {subjects.reduce((sum, s) => sum + (s.hours_per_week || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Créditos Totales</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {subjects.reduce((sum, s) => sum + (s.credits || 0), 0)}
                  </p>
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
                    placeholder="Buscar por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterActive === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterActive === 'active' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('active')}
                >
                  Activas
                </Button>
                <Button
                  variant={filterActive === 'inactive' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('inactive')}
                >
                  Inactivas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de materias */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lista de Materias</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando materias...</p>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterActive !== 'all' 
                    ? 'No se encontraron materias' 
                    : 'No hay materias registradas'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterActive !== 'all'
                    ? 'Intenta con otros criterios de búsqueda'
                    : 'Comienza creando la primera materia de tu institución.'
                  }
                </p>
                {!searchTerm && filterActive === 'all' && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Materia
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubjects.map((subject, index) => (
                  <div key={subject.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            index % 4 === 0 ? 'bg-blue-100' : 
                            index % 4 === 1 ? 'bg-green-100' : 
                            index % 4 === 2 ? 'bg-purple-100' : 'bg-orange-100'
                          }`}>
                            <BookOpen className={`h-6 w-6 ${
                              index % 4 === 0 ? 'text-blue-600' : 
                              index % 4 === 1 ? 'text-green-600' : 
                              index % 4 === 2 ? 'text-purple-600' : 'text-orange-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{subject.name}</h4>
                          <p className="text-sm text-gray-500">{subject.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-400 flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              Código: {subject.code}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {subject.hours_per_week}h/semana
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {subject.credits} créditos
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Creada: {new Date(subject.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subject.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subject.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handleEditSubject(subject)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteSubject(subject)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
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
          <CreateSubjectForm
            careers={careers}
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateSubject}
          />
        )}

        {showEditForm && selectedSubject && (
          <EditSubjectForm
            subject={selectedSubject}
            careers={careers}
            onClose={() => {
              setShowEditForm(false)
              setSelectedSubject(null)
            }}
            onSave={handleSubjectUpdated}
          />
        )}

        {showDeleteModal && selectedSubject && (
          <DeleteSubjectModal
            subject={selectedSubject}
            onClose={() => {
              setShowDeleteModal(false)
              setSelectedSubject(null)
            }}
            onConfirm={handleSubjectDeleted}
          />
        )}
      </div>
    </DashboardLayout>
  )
}