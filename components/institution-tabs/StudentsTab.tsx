'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateStudentForm from '@/components/forms/CreateStudentForm'
import EditStudentForm from '@/components/forms/EditStudentForm'
import DeleteStudentModal from '@/components/modals/DeleteStudentModal'
import EnrollStudentForm from '@/components/forms/EnrollStudentForm'
import { studentService, careerService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Users, 
  GraduationCap, 
  Calendar, 
  Edit,
  Trash2,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen
} from 'lucide-react'

interface StudentsTabProps {
  institutionId: string
}

export default function StudentsTab({ institutionId }: StudentsTabProps) {
  const [students, setStudents] = useState<any[]>([])
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
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
      const [studentsData, careersData] = await Promise.all([
        studentService.getAll(institutionId),
        careerService.getAll(institutionId)
      ])
      setStudents(studentsData)
      setCareers(careersData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  // Estadísticas
  const totalStudents = students.length
  const activeStudents = students.filter(student => student.is_active).length
  const inactiveStudents = students.filter(student => !student.is_active).length
  const thisMonth = new Date()
  thisMonth.setMonth(thisMonth.getMonth() - 1)
  const newThisMonth = students.filter(student => new Date(student.created_at) > thisMonth).length

  // Filtros
  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCareer = filterCareer === 'all' || student.career_id === filterCareer
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && student.is_active) ||
      (filterStatus === 'inactive' && !student.is_active)
    
    return matchesSearch && matchesCareer && matchesStatus
  })

  const handleEdit = (student: any) => {
    setSelectedStudent(student)
    setShowEditForm(true)
  }

  const handleDelete = (student: any) => {
    setSelectedStudent(student)
    setShowDeleteModal(true)
  }

  const handleEnroll = (student: any) => {
    setSelectedStudent(student)
    setShowEnrollForm(true)
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
          <h2 className="text-2xl font-bold text-gray-900">Estudiantes</h2>
          <p className="text-gray-600">Gestiona los estudiantes de esta institución</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Estudiante
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                <p className="text-sm text-gray-600">Total Estudiantes</p>
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
                <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
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
                <p className="text-2xl font-bold text-gray-900">{inactiveStudents}</p>
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
                  placeholder="Buscar estudiante..."
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
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de estudiantes */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-gray-600">{student.email}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">#{student.student_number}</span>
                      {student.career_name && (
                        <span className="text-sm text-gray-500 flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {student.career_name}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEnroll(student)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Inscribir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(student)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(student)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes</h3>
              <p className="text-gray-500">
                {searchTerm || filterCareer !== 'all' || filterStatus !== 'all'
                  ? 'No se encontraron estudiantes con los filtros aplicados.'
                  : 'Comienza agregando tu primer estudiante.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modales */}
      {showCreateForm && (
        <CreateStudentForm
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            loadData()
            setShowCreateForm(false)
          }}
        />
      )}

      {showEditForm && selectedStudent && (
        <EditStudentForm
          student={selectedStudent}
          onClose={() => {
            setShowEditForm(false)
            setSelectedStudent(null)
          }}
          onSave={() => {
            loadData()
            setShowEditForm(false)
            setSelectedStudent(null)
          }}
        />
      )}

      {showDeleteModal && selectedStudent && (
        <DeleteStudentModal
          student={selectedStudent}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedStudent(null)
          }}
          onDelete={() => {
            loadData()
            setShowDeleteModal(false)
            setSelectedStudent(null)
          }}
        />
      )}

      {showEnrollForm && selectedStudent && (
        <EnrollStudentForm
          student={selectedStudent}
          onClose={() => {
            setShowEnrollForm(false)
            setSelectedStudent(null)
          }}
          onSave={() => {
            loadData()
            setShowEnrollForm(false)
            setSelectedStudent(null)
          }}
        />
      )}
    </div>
  )
}
