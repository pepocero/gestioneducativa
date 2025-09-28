'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateCareerForm from '@/components/forms/CreateCareerForm'
import EditCareerForm from '@/components/forms/EditCareerForm'
import CareerConfigModal from '@/components/modals/CareerConfigModal'
import DeleteCareerModal from '@/components/modals/DeleteCareerModal'
import { careerService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  GraduationCap, 
  Clock, 
  Users, 
  BookOpen,
  Edit,
  Trash2,
  Settings,
  Calendar,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react'

interface CareersTabProps {
  institutionId: string
}

export default function CareersTab({ institutionId }: CareersTabProps) {
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Cargar carreras cuando el componente se monta o cambia institutionId
  useEffect(() => {
    loadCareers()
  }, [institutionId])

  const loadCareers = async () => {
    try {
      setLoading(true)
      const careersData = await careerService.getAll(institutionId)
      setCareers(careersData)
    } catch (error) {
      console.error('Error cargando carreras:', error)
      toast.error('Error cargando carreras')
    } finally {
      setLoading(false)
    }
  }

  // Estadísticas
  const totalCareers = careers.length
  const activeCareers = careers.filter(career => career.is_active).length
  const inactiveCareers = careers.filter(career => !career.is_active).length
  const thisMonth = new Date()
  thisMonth.setMonth(thisMonth.getMonth() - 1)
  const newThisMonth = careers.filter(career => new Date(career.created_at) > thisMonth).length

  // Filtros
  const filteredCareers = careers.filter(career => {
    const matchesSearch = !searchTerm || 
      career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      career.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && career.is_active) ||
      (filterStatus === 'inactive' && !career.is_active)
    
    return matchesSearch && matchesStatus
  })

  const handleEdit = (career: any) => {
    setSelectedCareer(career)
    setShowEditForm(true)
  }

  const handleDelete = (career: any) => {
    setSelectedCareer(career)
    setShowDeleteModal(true)
  }

  const handleConfig = (career: any) => {
    setSelectedCareer(career)
    setShowConfigModal(true)
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
          <h2 className="text-2xl font-bold text-gray-900">Carreras</h2>
          <p className="text-gray-600">Gestiona las carreras académicas de esta institución</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Carrera
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCareers}</p>
                <p className="text-sm text-gray-600">Total Carreras</p>
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
                <p className="text-2xl font-bold text-gray-900">{activeCareers}</p>
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
                <p className="text-2xl font-bold text-gray-900">{inactiveCareers}</p>
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
                  placeholder="Buscar carrera..."
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
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de carreras */}
      <div className="grid gap-4">
        {filteredCareers.map((career) => (
          <Card key={career.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {career.name}
                    </h3>
                    <p className="text-gray-600 mb-3">{career.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{career.duration_years} años</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          career.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {career.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Creada: {new Date(career.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleConfig(career)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Config
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(career)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(career)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCareers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay carreras</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'No se encontraron carreras con los filtros aplicados.'
                  : 'Comienza creando tu primera carrera académica.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modales */}
      {showCreateForm && (
        <CreateCareerForm
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            loadCareers()
            setShowCreateForm(false)
          }}
        />
      )}

      {showEditForm && selectedCareer && (
        <EditCareerForm
          career={selectedCareer}
          onClose={() => {
            setShowEditForm(false)
            setSelectedCareer(null)
          }}
          onSave={() => {
            loadCareers()
            setShowEditForm(false)
            setSelectedCareer(null)
          }}
        />
      )}

      {showConfigModal && selectedCareer && (
        <CareerConfigModal
          career={selectedCareer}
          onClose={() => {
            setShowConfigModal(false)
            setSelectedCareer(null)
          }}
          onSave={() => {
            loadCareers()
            setShowConfigModal(false)
            setSelectedCareer(null)
          }}
        />
      )}

      {showDeleteModal && selectedCareer && (
        <DeleteCareerModal
          career={selectedCareer}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedCareer(null)
          }}
          onDelete={() => {
            loadCareers()
            setShowDeleteModal(false)
            setSelectedCareer(null)
          }}
        />
      )}
    </div>
  )
}
