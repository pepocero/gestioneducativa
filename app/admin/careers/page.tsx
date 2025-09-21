'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import CreateCareerForm from '@/components/forms/CreateCareerForm'
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
  Calendar
} from 'lucide-react'

export default function CareersPage() {
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Cargar carreras al montar el componente
  useEffect(() => {
    loadCareers()
  }, [])

  const loadCareers = async () => {
    try {
      setLoading(true)
      const careersData = await careerService.getAll()
      setCareers(careersData)
    } catch (error) {
      console.error('Error cargando carreras:', error)
      toast.error('Error cargando carreras')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCareer = () => {
    loadCareers()
    setShowCreateForm(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Carreras</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona las carreras académicas disponibles
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Carrera
          </Button>
        </div>

        {/* Estadísticas de carreras */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Carreras</p>
                  <p className="text-2xl font-semibold text-gray-900">{careers.length}</p>
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
                  <p className="text-sm font-medium text-gray-500">Carreras Activas</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {careers.filter(c => c.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Materias Totales</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Duración Promedio</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {careers.length > 0 
                      ? Math.round(careers.reduce((sum, c) => sum + c.duration_years, 0) / careers.length)
                      : 0
                    } años
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de carreras */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lista de Carreras</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando carreras...</p>
              </div>
            ) : careers.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay carreras registradas</h3>
                <p className="text-gray-500 mb-4">Comienza creando la primera carrera de tu institución.</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Carrera
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {careers.map((career, index) => (
                  <div key={career.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            index % 3 === 0 ? 'bg-blue-100' : 
                            index % 3 === 1 ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            <GraduationCap className={`h-6 w-6 ${
                              index % 3 === 0 ? 'text-blue-600' : 
                              index % 3 === 1 ? 'text-green-600' : 'text-purple-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{career.name}</h4>
                          <p className="text-sm text-gray-500">{career.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {career.duration_years} años
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Creada: {new Date(career.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              0 materias
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          career.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {career.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configurar
                        </Button>
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

        {/* Modal de crear carrera */}
        {showCreateForm && (
          <CreateCareerForm
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateCareer}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

