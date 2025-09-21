'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { careerService, cycleService, subjectService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  GraduationCap, 
  Save, 
  X,
  BookOpen,
  Clock,
  FileText,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  Settings
} from 'lucide-react'

interface CareerConfigData {
  name: string
  description: string
  duration_years: number
  is_active: boolean
}

interface Cycle {
  id: string
  name: string
  year: number
  is_active: boolean
}

interface Subject {
  id: string
  name: string
  code: string
  credits: number
  is_active: boolean
}

interface CareerConfigModalProps {
  career: {
    id: string
    name: string
    description: string
    duration_years: number
    is_active: boolean
  }
  onClose: () => void
  onSave: () => void
}

export default function CareerConfigModal({ career, onClose, onSave }: CareerConfigModalProps) {
  const [formData, setFormData] = useState<CareerConfigData>({
    name: career.name,
    description: career.description,
    duration_years: career.duration_years,
    is_active: career.is_active
  })

  const [cycles, setCycles] = useState<Cycle[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [cyclesLoading, setCyclesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'cycles' | 'subjects'>('info')

  // Cargar ciclos y materias al montar el componente
  useEffect(() => {
    loadCycles()
  }, [])

  const loadCycles = async () => {
    try {
      setCyclesLoading(true)
      const cyclesData = await cycleService.getAll(career.id)
      setCycles(cyclesData)
      
      // Cargar materias para cada ciclo
      const allSubjects: Subject[] = []
      for (const cycle of cyclesData) {
        const cycleSubjects = await subjectService.getAll(cycle.id)
        allSubjects.push(...cycleSubjects)
      }
      setSubjects(allSubjects)
    } catch (error) {
      console.error('Error cargando ciclos:', error)
      toast.error('Error cargando información de la carrera')
    } finally {
      setCyclesLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'duration_years' ? parseInt(value) : value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await careerService.update(career.id, formData)
      toast.success('Configuración guardada exitosamente')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error guardando configuración:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const toggleCareerStatus = async () => {
    const newStatus = !formData.is_active
    setFormData(prev => ({ ...prev, is_active: newStatus }))
    
    try {
      await careerService.update(career.id, { is_active: newStatus })
      toast.success(`Carrera ${newStatus ? 'activada' : 'desactivada'} exitosamente`)
      onSave()
    } catch (error) {
      console.error('Error cambiando estado:', error)
      toast.error('Error al cambiar el estado de la carrera')
      // Revertir cambio
      setFormData(prev => ({ ...prev, is_active: !newStatus }))
    }
  }

  const deleteCycle = async (cycleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ciclo? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await cycleService.delete(cycleId)
      toast.success('Ciclo eliminado exitosamente')
      loadCycles() // Recargar datos
    } catch (error) {
      console.error('Error eliminando ciclo:', error)
      toast.error('Error al eliminar el ciclo')
    }
  }

  const deleteSubject = async (subjectId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta materia? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await subjectService.delete(subjectId)
      toast.success('Materia eliminada exitosamente')
      loadCycles() // Recargar datos
    } catch (error) {
      console.error('Error eliminando materia:', error)
      toast.error('Error al eliminar la materia')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurar Carrera</h2>
                <p className="text-sm text-gray-500">{career.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Información
              </button>
              <button
                onClick={() => setActiveTab('cycles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cycles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Ciclos ({cycles.length})
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subjects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Materias ({subjects.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Información Básica */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Información Básica
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la Carrera
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Ingeniería en Sistemas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe los objetivos y características de la carrera..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duración en Años
                      </label>
                      <select
                        name="duration_years"
                        value={formData.duration_years}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                          <option key={year} value={year}>{year} año{year > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estado de la Carrera */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ToggleRight className="h-5 w-5 mr-2 text-green-600" />
                    Estado de la Carrera
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Estado Actual</h4>
                      <p className="text-sm text-gray-500">
                        {formData.is_active 
                          ? 'La carrera está activa y disponible para inscripciones'
                          : 'La carrera está inactiva y no acepta nuevas inscripciones'
                        }
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleCareerStatus}
                      className="flex items-center space-x-2"
                    >
                      {formData.is_active ? (
                        <ToggleRight className="h-8 w-8 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'cycles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Ciclos Académicos</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Ciclo
                </Button>
              </div>

              {cyclesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Cargando ciclos...</p>
                </div>
              ) : cycles.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ciclos registrados</h3>
                  <p className="text-gray-500 mb-4">Comienza creando el primer ciclo de esta carrera.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Ciclo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cycles.map((cycle, index) => (
                    <div key={cycle.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{cycle.year}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{cycle.name}</h4>
                            <p className="text-sm text-gray-500">Año {cycle.year}</p>
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
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteCycle(cycle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Materias</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Materia
                </Button>
              </div>

              {cyclesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Cargando materias...</p>
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materias registradas</h3>
                  <p className="text-gray-500 mb-4">Comienza creando la primera materia de esta carrera.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Materia
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{subject.name}</h4>
                            <p className="text-sm text-gray-500">
                              Código: {subject.code} • {subject.credits} créditos
                            </p>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteSubject(subject.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {activeTab === 'info' && (
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
