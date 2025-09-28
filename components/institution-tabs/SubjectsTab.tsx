'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateSubjectForm from '@/components/forms/CreateSubjectForm'
import EditSubjectForm from '@/components/forms/EditSubjectForm'
import DeleteSubjectModal from '@/components/modals/DeleteSubjectModal'
import { subjectService, careerService } from '@/lib/supabase-service'
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
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface SubjectsTabProps {
  institutionId: string
}

export default function SubjectsTab({ institutionId }: SubjectsTabProps) {
  const [subjects, setSubjects] = useState<any[]>([])
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCareer, setFilterCareer] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Cargar datos cuando el componente se monta o cambia institutionId
  useEffect(() => {
    loadData()
  }, [institutionId])

  const loadData = async () => {
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

  // Estadísticas
  const totalSubjects = subjects.length
  const activeSubjects = subjects.filter(subject => subject.is_active !== false).length
  const inactiveSubjects = subjects.filter(subject => subject.is_active === false).length
  const thisMonth = new Date()
  thisMonth.setMonth(thisMonth.getMonth() - 1)
  const newThisMonth = subjects.filter(subject => new Date(subject.created_at) > thisMonth).length

  // Filtros
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !searchTerm || 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCareer = filterCareer === 'all' || subject.career_id === filterCareer
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && subject.is_active !== false) ||
      (filterStatus === 'inactive' && subject.is_active === false)
    
    return matchesSearch && matchesCareer && matchesStatus
  })

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject)
    setShowEditForm(true)
  }

  const handleDelete = (subject: any) => {
    setSelectedSubject(subject)
    setShowDeleteModal(true)
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
          <h2 className="text-2xl font-bold text-gray-900">Materias</h2>
          <p className="text-gray-600">Gestiona las materias de esta institución</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Materia
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalSubjects}</p>
                <p className="text-sm text-gray-600">Total Materias</p>
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
                <p className="text-2xl font-bold text-gray-900">{activeSubjects}</p>
                <p className="text-sm text-gray-600">Activas</p>
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
                <p className="text-2xl font-bold text-gray-900">{inactiveSubjects}</p>
                <p className="text-sm text-gray-600">Inactivas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{newThisMonth}</p>
                <p className="text-sm text-gray-600">Nuevas (mes)</p>
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
                  placeholder="Buscar materia..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterCareer}
                onChange={(e) => setFilterCareer(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las carreras</option>
                {careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de materias */}
      <div className="grid gap-4">
        {filteredSubjects.map((subject) => {
          const career = careers.find(c => c.id === subject.career_id)
          
          return (
            <Card key={subject.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {subject.name}
                        </h3>
                        {subject.code && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            {subject.code}
                          </span>
                        )}
                      </div>
                      
                      {subject.description && (
                        <p className="text-gray-600 mb-3">{subject.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {career && (
                          <div className="flex items-center text-sm text-gray-600">
                            <GraduationCap className="h-4 w-4 mr-2 text-purple-500" />
                            <span>{career.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-green-500" />
                          <span>{subject.credits || 0} créditos</span>
                        </div>
                        
                        {subject.hours_per_week && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{subject.hours_per_week}h/semana</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subject.is_active !== false 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subject.is_active !== false ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(subject)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(subject)}
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

        {filteredSubjects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materias</h3>
              <p className="text-gray-500">
                {searchTerm || filterCareer !== 'all' || filterStatus !== 'all'
                  ? 'No se encontraron materias con los filtros aplicados.'
                  : 'Comienza creando tu primera materia.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modales */}
      {showCreateForm && (
        <CreateSubjectForm
          careers={careers}
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            loadData()
            setShowCreateForm(false)
          }}
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
          onSave={() => {
            loadData()
            setShowEditForm(false)
            setSelectedSubject(null)
          }}
        />
      )}

      {showDeleteModal && selectedSubject && (
        <DeleteSubjectModal
          subject={selectedSubject}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedSubject(null)
          }}
          onDelete={() => {
            loadData()
            setShowDeleteModal(false)
            setSelectedSubject(null)
          }}
        />
      )}
    </div>
  )
}
