'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateCycleForm from '@/components/forms/CreateCycleForm'
import EditCycleForm from '@/components/forms/EditCycleForm'
import DeleteCycleModal from '@/components/modals/DeleteCycleModal'
import AssignSubjectsModal from '@/components/modals/AssignSubjectsModal'
import { cycleService, careerService, subjectService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Edit,
  Trash2,
  Settings,
  BookOpen,
  GraduationCap,
  Search,
  Filter,
  Link
} from 'lucide-react'

export default function CyclesPage() {
  const [cycles, setCycles] = useState<any[]>([])
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCareer, setFilterCareer] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [cyclesData, careersData] = await Promise.all([
        cycleService.getAll(),
        careerService.getAll()
      ])
      setCycles(cyclesData)
      setCareers(careersData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCycle = () => {
    loadData()
    setShowCreateForm(false)
  }

  const handleEditCycle = (cycle: any) => {
    setSelectedCycle(cycle)
    setShowEditForm(true)
  }

  const handleDeleteCycle = (cycle: any) => {
    setSelectedCycle(cycle)
    setShowDeleteModal(true)
  }

  const handleAssignSubjects = (cycle: any) => {
    setSelectedCycle(cycle)
    setShowAssignModal(true)
  }

  const handleCycleUpdated = () => {
    loadData()
    setShowEditForm(false)
    setSelectedCycle(null)
  }

  const handleCycleDeleted = () => {
    loadData()
    setShowDeleteModal(false)
    setSelectedCycle(null)
  }

  const handleSubjectsAssigned = () => {
    loadData()
    setShowAssignModal(false)
    setSelectedCycle(null)
  }

  // Filtrar ciclos
  const filteredCycles = cycles.filter(cycle => {
    const career = careers.find(c => c.id === cycle.career_id)
    const matchesSearch = cycle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (career && career.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCareer = filterCareer === 'all' || cycle.career_id === filterCareer
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && cycle.is_active) ||
                         (filterActive === 'inactive' && !cycle.is_active)
    
    return matchesSearch && matchesCareer && matchesFilter
  })

  // Agrupar ciclos por carrera
  const cyclesByCareer = filteredCycles.reduce((acc, cycle) => {
    const career = careers.find(c => c.id === cycle.career_id)
    if (!career) return acc
    
    if (!acc[career.id]) {
      acc[career.id] = {
        career,
        cycles: []
      }
    }
    acc[career.id].cycles.push(cycle)
    return acc
  }, {} as Record<string, { career: any; cycles: any[] }>)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ciclos Académicos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona los ciclos académicos y asigna materias a cada año
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Ciclo
          </Button>
        </div>

        {/* Estadísticas de ciclos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Ciclos</p>
                  <p className="text-2xl font-semibold text-gray-900">{cycles.length}</p>
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
                  <p className="text-sm font-medium text-gray-500">Ciclos Activos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {cycles.filter(c => c.is_active).length}
                  </p>
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
                  <p className="text-2xl font-semibold text-gray-900">{careers.length}</p>
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
                  <p className="text-sm font-medium text-gray-500">Años Promedio</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {careers.length > 0 
                      ? Math.round(careers.reduce((sum, c) => sum + c.duration_years, 0) / careers.length)
                      : 0
                    }
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
                    placeholder="Buscar por nombre de ciclo o carrera..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCareer}
                  onChange={(e) => setFilterCareer(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas las carreras</option>
                  {careers.map(career => (
                    <option key={career.id} value={career.id}>{career.name}</option>
                  ))}
                </select>
                <Button
                  variant={filterActive === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={filterActive === 'active' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('active')}
                >
                  Activos
                </Button>
                <Button
                  variant={filterActive === 'inactive' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('inactive')}
                >
                  Inactivos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de ciclos agrupados por carrera */}
        <div className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Cargando ciclos...</p>
                </div>
              </CardContent>
            </Card>
          ) : Object.keys(cyclesByCareer).length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterCareer !== 'all' || filterActive !== 'all'
                      ? 'No se encontraron ciclos' 
                      : 'No hay ciclos registrados'
                    }
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterCareer !== 'all' || filterActive !== 'all'
                      ? 'Intenta con otros criterios de búsqueda'
                      : 'Comienza creando el primer ciclo académico.'
                    }
                  </p>
                  {!searchTerm && filterCareer === 'all' && filterActive === 'all' && (
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Ciclo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(cyclesByCareer).map(([careerId, data]) => {
              const career = (data as any).career
              const careerCycles = (data as any).cycles
              return (
              <Card key={career.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{career.name}</h3>
                        <p className="text-sm text-gray-500">
                          {careerCycles.length} ciclo{careerCycles.length !== 1 ? 's' : ''} • {career.duration_years} año{career.duration_years > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      career.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {career.is_active ? 'Carrera Activa' : 'Carrera Inactiva'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {careerCycles
                      .sort((a: any, b: any) => a.year - b.year)
                      .map((cycle: any, index: number) => (
                      <div key={cycle.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">{cycle.year}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{cycle.name}</h4>
                              <p className="text-sm text-gray-500">Año {cycle.year} de {career.name}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-400 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Creado: {new Date(cycle.created_at).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  0 materias asignadas
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              cycle.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {cycle.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAssignSubjects(cycle)}
                              className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                            >
                              <Link className="h-4 w-4 mr-1" />
                              Asignar Materias
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditCycle(cycle)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteCycle(cycle)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              )
            })
          )}
        </div>

        {/* Modales */}
        {showCreateForm && (
          <CreateCycleForm
            careers={careers}
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateCycle}
          />
        )}

        {showEditForm && selectedCycle && (
          <EditCycleForm
            cycle={selectedCycle}
            careers={careers}
            onClose={() => {
              setShowEditForm(false)
              setSelectedCycle(null)
            }}
            onSave={handleCycleUpdated}
          />
        )}

        {showDeleteModal && selectedCycle && (
          <DeleteCycleModal
            cycle={selectedCycle}
            onClose={() => {
              setShowDeleteModal(false)
              setSelectedCycle(null)
            }}
            onConfirm={handleCycleDeleted}
          />
        )}

        {showAssignModal && selectedCycle && (
          <AssignSubjectsModal
            cycle={selectedCycle}
            onClose={() => {
              setShowAssignModal(false)
              setSelectedCycle(null)
            }}
            onSave={handleSubjectsAssigned}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
