'use client'

import { useState, useEffect } from 'react'
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
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface CyclesTabProps {
  institutionId: string
}

export default function CyclesTab({ institutionId }: CyclesTabProps) {
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
  const [expandedCareers, setExpandedCareers] = useState<Set<string>>(new Set())

  // Cargar datos cuando el componente se monta o cambia institutionId
  useEffect(() => {
    loadData()
  }, [institutionId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [cyclesData, careersData] = await Promise.all([
        cycleService.getAll(undefined, institutionId),
        careerService.getAll(institutionId)
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

  // Estadísticas
  const totalCycles = cycles.length
  const activeCycles = cycles.filter(cycle => cycle.is_active !== false).length
  const inactiveCycles = cycles.filter(cycle => cycle.is_active === false).length
  const thisMonth = new Date()
  thisMonth.setMonth(thisMonth.getMonth() - 1)
  const newThisMonth = cycles.filter(cycle => new Date(cycle.created_at) > thisMonth).length

  // Filtros
  const filteredCycles = cycles.filter(cycle => {
    const matchesSearch = !searchTerm || 
      cycle.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCareer = filterCareer === 'all' || cycle.career_id === filterCareer
    const matchesStatus = filterActive === 'all' || 
      (filterActive === 'active' && cycle.is_active !== false) ||
      (filterActive === 'inactive' && cycle.is_active === false)
    
    return matchesSearch && matchesCareer && matchesStatus
  })

  // Agrupar ciclos por carrera
  const cyclesByCareer = careers.reduce((acc, career) => {
    const careerCycles = filteredCycles.filter(cycle => cycle.career_id === career.id)
    if (careerCycles.length > 0) {
      acc[career.id] = {
        career,
        cycles: careerCycles.sort((a, b) => a.year - b.year)
      }
    }
    return acc
  }, {} as Record<string, { career: any; cycles: any[] }>)

  const toggleCareerExpansion = (careerId: string) => {
    const newExpanded = new Set(expandedCareers)
    if (newExpanded.has(careerId)) {
      newExpanded.delete(careerId)
    } else {
      newExpanded.add(careerId)
    }
    setExpandedCareers(newExpanded)
  }

  const expandAllCareers = () => {
    setExpandedCareers(new Set(Object.keys(cyclesByCareer)))
  }

  const collapseAllCareers = () => {
    setExpandedCareers(new Set())
  }

  const handleEdit = (cycle: any) => {
    setSelectedCycle(cycle)
    setShowEditForm(true)
  }

  const handleDelete = (cycle: any) => {
    setSelectedCycle(cycle)
    setShowDeleteModal(true)
  }

  const handleAssignSubjects = (cycle: any) => {
    setSelectedCycle(cycle)
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
          <h2 className="text-2xl font-bold text-gray-900">Ciclos</h2>
          <p className="text-gray-600">Gestiona los ciclos académicos de esta institución</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ciclo
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCycles}</p>
                <p className="text-sm text-gray-600">Total Ciclos</p>
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
                <p className="text-2xl font-bold text-gray-900">{activeCycles}</p>
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
                <p className="text-2xl font-bold text-gray-900">{inactiveCycles}</p>
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

      {/* Filtros y controles */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar ciclo..."
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
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
              
              <Button variant="outline" onClick={expandAllCareers}>
                Expandir Todo
              </Button>
              
              <Button variant="outline" onClick={collapseAllCareers}>
                Colapsar Todo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ciclos agrupados por carrera */}
      <div className="space-y-4">
        {Object.entries(cyclesByCareer).map(([careerId, { career, cycles }]) => {
          const isExpanded = expandedCareers.has(careerId)
          
          return (
            <Card key={careerId}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCareerExpansion(careerId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{career.name}</h3>
                      <p className="text-sm text-gray-600">{cycles.length} ciclos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {isExpanded ? 'Colapsar' : 'Expandir'}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="space-y-3">
                    {cycles.map((cycle) => (
                      <div 
                        key={cycle.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{cycle.name}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-500">Año {cycle.year}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  cycle.is_active !== false 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {cycle.is_active !== false ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => handleAssignSubjects(cycle)}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <BookOpen className="h-4 w-4 mr-1" />
                              Materias
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleEdit(cycle)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDelete(cycle)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        {Object.keys(cyclesByCareer).length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ciclos</h3>
              <p className="text-gray-500">
                {searchTerm || filterCareer !== 'all' || filterActive !== 'all'
                  ? 'No se encontraron ciclos con los filtros aplicados.'
                  : 'Comienza creando tu primer ciclo académico.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modales */}
      {showCreateForm && (
        <CreateCycleForm
          careers={careers}
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            loadData()
            setShowCreateForm(false)
          }}
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
          onSave={() => {
            loadData()
            setShowEditForm(false)
            setSelectedCycle(null)
          }}
        />
      )}

      {showDeleteModal && selectedCycle && (
        <DeleteCycleModal
          cycle={selectedCycle}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedCycle(null)
          }}
          onDelete={() => {
            loadData()
            setShowDeleteModal(false)
            setSelectedCycle(null)
          }}
        />
      )}

      {showAssignModal && selectedCycle && (
        <AssignSubjectsModal
          cycle={selectedCycle}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedCycle(null)
          }}
          onSave={() => {
            loadData()
            setShowAssignModal(false)
            setSelectedCycle(null)
          }}
        />
      )}
    </div>
  )
}
