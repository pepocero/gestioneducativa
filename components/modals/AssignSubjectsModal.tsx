'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Link, 
  X,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  Check,
  Clock,
  GraduationCap,
  Search,
  Filter
} from 'lucide-react'

interface Subject {
  id: string
  name: string
  code: string
  description: string
  credits: number
  hours_per_week: number
  is_active: boolean
}

interface AssignedSubject extends Subject {
  is_required: boolean
  semester: number
  order_in_cycle: number
}

interface AssignSubjectsModalProps {
  cycle: {
    id: string
    name: string
    year: number
    career_id: string
    is_active: boolean
  }
  onClose: () => void
  onSave: () => void
}

export default function AssignSubjectsModal({ cycle, onClose, onSave }: AssignSubjectsModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [assignFormData, setAssignFormData] = useState({
    is_required: true,
    semester: 1,
    order_in_cycle: 1
  })

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar todas las materias de la institución
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects_new')
        .select('*')
        .order('name')

      if (subjectsError) throw subjectsError

      // Cargar materias asignadas al ciclo
      const { data: assignedData, error: assignedError } = await supabase
        .from('cycle_subjects')
        .select(`
          *,
          subjects_new(*)
        `)
        .eq('cycle_id', cycle.id)

      if (assignedError) throw assignedError

      setSubjects(subjectsData || [])
      
      // Procesar materias asignadas
      const processedAssigned = (assignedData || []).map(item => ({
        ...item.subjects_new,
        is_required: item.is_required,
        semester: item.semester,
        order_in_cycle: item.order_in_cycle
      }))
      
      setAssignedSubjects(processedAssigned)
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar materias disponibles
  const filteredSubjects = subjects.filter(subject => {
    const isAssigned = assignedSubjects.some(assigned => assigned.id === subject.id)
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && subject.is_active) ||
                         (filterActive === 'inactive' && !subject.is_active)
    
    return !isAssigned && matchesSearch && matchesFilter
  })

  const handleAssignSubject = (subject: Subject) => {
    setSelectedSubject(subject)
    setShowAssignForm(true)
  }

  const handleConfirmAssign = async () => {
    if (!selectedSubject) return

    try {
      const { error } = await supabase
        .from('cycle_subjects')
        .insert({
          cycle_id: cycle.id,
          subject_id: selectedSubject.id,
          is_required: assignFormData.is_required,
          semester: assignFormData.semester,
          order_in_cycle: assignFormData.order_in_cycle
        })

      if (error) throw error

      toast.success('Materia asignada exitosamente')
      setShowAssignForm(false)
      setSelectedSubject(null)
      loadData() // Recargar datos
    } catch (error) {
      console.error('Error asignando materia:', error)
      toast.error('Error al asignar la materia')
    }
  }

  const handleUnassignSubject = async (subjectId: string) => {
    if (!confirm('¿Estás seguro de que quieres desasignar esta materia del ciclo?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('cycle_subjects')
        .delete()
        .eq('cycle_id', cycle.id)
        .eq('subject_id', subjectId)

      if (error) throw error

      toast.success('Materia desasignada exitosamente')
      loadData() // Recargar datos
    } catch (error) {
      console.error('Error desasignando materia:', error)
      toast.error('Error al desasignar la materia')
    }
  }

  const handleUpdateAssignment = async (subjectId: string, updates: Partial<AssignedSubject>) => {
    try {
      const { error } = await supabase
        .from('cycle_subjects')
        .update(updates)
        .eq('cycle_id', cycle.id)
        .eq('subject_id', subjectId)

      if (error) throw error

      toast.success('Asignación actualizada exitosamente')
      loadData() // Recargar datos
    } catch (error) {
      console.error('Error actualizando asignación:', error)
      toast.error('Error al actualizar la asignación')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Link className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Asignar Materias</h2>
                <p className="text-sm text-gray-500">{cycle.name} - Año {cycle.year}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Materias Asignadas */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-600" />
                  Materias Asignadas ({assignedSubjects.length})
                </h3>
              </CardHeader>
              <CardContent>
                {assignedSubjects.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materias asignadas</h3>
                    <p className="text-gray-500">Asigna materias desde el panel de la derecha</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedSubjects
                      .sort((a, b) => a.semester - b.semester || a.order_in_cycle - b.order_in_cycle)
                      .map((subject) => (
                      <div key={subject.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{subject.name}</h4>
                            <p className="text-sm text-gray-500">{subject.code}</p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs text-gray-400 flex items-center">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                {subject.credits} créditos
                              </span>
                              <span className="text-xs text-gray-400 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {subject.hours_per_week}h/semana
                              </span>
                              <span className="text-xs text-gray-400 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Semestre {subject.semester}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              subject.is_required 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {subject.is_required ? 'Obligatoria' : 'Opcional'}
                            </span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUnassignSubject(subject.id)}
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

            {/* Materias Disponibles */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Materias Disponibles ({filteredSubjects.length})
                </h3>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar materias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterActive === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterActive('all')}
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filterActive === 'active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterActive('active')}
                    >
                      Activas
                    </Button>
                    <Button
                      variant={filterActive === 'inactive' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterActive('inactive')}
                    >
                      Inactivas
                    </Button>
                  </div>
                </div>

                {/* Lista de materias */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Cargando materias...</p>
                  </div>
                ) : filteredSubjects.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materias disponibles</h3>
                    <p className="text-gray-500">
                      {searchTerm || filterActive !== 'all'
                        ? 'Intenta con otros criterios de búsqueda'
                        : 'Todas las materias ya están asignadas o no hay materias creadas'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredSubjects.map((subject) => (
                      <div key={subject.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{subject.name}</h4>
                            <p className="text-sm text-gray-500">{subject.code}</p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs text-gray-400 flex items-center">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                {subject.credits} créditos
                              </span>
                              <span className="text-xs text-gray-400 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {subject.hours_per_week}h/semana
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                subject.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {subject.is_active ? 'Activa' : 'Inactiva'}
                              </span>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleAssignSubject(subject)}
                            disabled={!subject.is_active}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Asignar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modal de asignación */}
          {showAssignForm && selectedSubject && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Asignar Materia</h3>
                    <Button variant="outline" onClick={() => setShowAssignForm(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="font-medium text-gray-900">{selectedSubject.name}</h4>
                      <p className="text-sm text-gray-500">{selectedSubject.code}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Semestre
                        </label>
                        <select
                          value={assignFormData.semester}
                          onChange={(e) => setAssignFormData(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>Primer Semestre</option>
                          <option value={2}>Segundo Semestre</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Orden en el Ciclo
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={assignFormData.order_in_cycle}
                          onChange={(e) => setAssignFormData(prev => ({ ...prev, order_in_cycle: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Tipo de Materia</h4>
                          <p className="text-sm text-gray-500">
                            {assignFormData.is_required ? 'Obligatoria para el ciclo' : 'Opcional para el ciclo'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAssignFormData(prev => ({ ...prev, is_required: !prev.is_required }))}
                          className="flex items-center space-x-2"
                        >
                          <span className={`text-sm font-medium ${assignFormData.is_required ? 'text-blue-600' : 'text-gray-400'}`}>
                            {assignFormData.is_required ? 'Obligatoria' : 'Opcional'}
                          </span>
                          <div className={`w-12 h-6 rounded-full transition-colors ${
                            assignFormData.is_required ? 'bg-blue-500' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                              assignFormData.is_required ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setShowAssignForm(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleConfirmAssign}>
                      <Check className="h-4 w-4 mr-2" />
                      Asignar Materia
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={onSave}>
              <Check className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
