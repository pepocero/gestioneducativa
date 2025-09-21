'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateSubjectForm from '@/components/forms/CreateSubjectForm'
import { subjectService, careerService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Hash,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar materias y carreras al montar el componente
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [subjectsData, careersData] = await Promise.all([
        subjectService.getAll(),
        careerService.getAll()
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

  const handleCreateSubject = () => {
    loadData()
    setShowCreateForm(false)
  }

  const filteredSubjects = subjects.filter(subject => {
    const matchesCareer = !selectedCareer || subject.career_id === selectedCareer
    const matchesSearch = !searchTerm || 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCareer && matchesSearch
  })

  const getCareerName = (careerId: string) => {
    const career = careers.find(c => c.id === careerId)
    return career ? career.name : 'Carrera no encontrada'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona todas las materias de las carreras
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Materia
          </Button>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar materias por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <select
                  value={selectedCareer}
                  onChange={(e) => setSelectedCareer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las carreras</option>
                  {careers.map((career) => (
                    <option key={career.id} value={career.id}>
                      {career.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
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
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Carreras Activas</p>
                  <p className="text-2xl font-semibold text-gray-900">{careers.length}</p>
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
                  <Hash className="h-8 w-8 text-orange-600" />
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

        {/* Lista de materias */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              Lista de Materias 
              {selectedCareer && (
                <span className="text-sm text-gray-500 ml-2">
                  - {getCareerName(selectedCareer)}
                </span>
              )}
            </h3>
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
                  {searchTerm || selectedCareer ? 'No se encontraron materias' : 'No hay materias registradas'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCareer 
                    ? 'Intenta con otros filtros de búsqueda.'
                    : 'Comienza agregando la primera materia.'
                  }
                </p>
                {!searchTerm && !selectedCareer && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primera Materia
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
                              <Hash className="h-3 w-3 mr-1" />
                              {subject.code}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {getCareerName(subject.career_id)}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {subject.credits} créditos
                            </span>
                            <span className="text-xs text-gray-400">
                              {subject.hours_per_week} hs/semana
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
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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

        {/* Modal de crear materia */}
        {showCreateForm && (
          <CreateSubjectForm
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateSubject}
          />
        )}
      </div>
    </DashboardLayout>
  )
}