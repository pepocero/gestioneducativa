'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { subjectService, careerService, cycleService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  BookOpen, 
  Save, 
  X,
  Clock,
  Hash,
  GraduationCap,
  FileText
} from 'lucide-react'

interface SubjectFormData {
  name: string
  code: string
  description: string
  credits: number
  hours_per_week: number
  cycle_id: string
  career_id: string
  year: number
}

interface CreateSubjectFormProps {
  onClose: () => void
  onSave: () => void
}

export default function CreateSubjectForm({ onClose, onSave }: CreateSubjectFormProps) {
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    description: '',
    credits: 3,
    hours_per_week: 4,
    cycle_id: '',
    career_id: '',
    year: 1
  })

  const [errors, setErrors] = useState<Partial<SubjectFormData>>({})
  const [loading, setLoading] = useState(false)
  const [careers, setCareers] = useState<any[]>([])

  // Cargar carreras al montar el componente
  useEffect(() => {
    const loadCareers = async () => {
      try {
        const careersData = await careerService.getAll()
        setCareers(careersData)
      } catch (error) {
        console.error('Error cargando carreras:', error)
        toast.error('Error cargando carreras')
      }
    }
    loadCareers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' || name === 'hours_per_week' || name === 'year' ? parseInt(value) : value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof SubjectFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SubjectFormData> = {}

    if (!formData.name.trim()) newErrors.name = 'El nombre de la materia es requerido'
    if (!formData.code.trim()) newErrors.code = 'El código de la materia es requerido'
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida'
    if (!formData.career_id) newErrors.career_id = 'La carrera es requerida'
    if (formData.credits < 1 || formData.credits > 20) {
      newErrors.credits = 'Los créditos deben estar entre 1 y 20'
    }
    if (formData.hours_per_week < 1 || formData.hours_per_week > 20) {
      newErrors.hours_per_week = 'Las horas por semana deben estar entre 1 y 20'
    }
    if (formData.year < 1 || formData.year > 10) {
      newErrors.year = 'El año debe estar entre 1 y 10'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Primero crear o encontrar el ciclo
      let cycle_id = formData.cycle_id
      
      if (!cycle_id) {
        // Crear el ciclo si no existe
        const cycleData = {
          career_id: formData.career_id,
          name: `${formData.year}° Año`,
          year: formData.year,
          is_active: true
        }
        
        const newCycle = await cycleService.create(cycleData)
        cycle_id = newCycle.id
      }

      // Crear materia en Supabase
      const subjectData = {
        cycle_id: cycle_id,
        name: formData.name,
        code: formData.code,
        description: formData.description,
        credits: formData.credits,
        hours_per_week: formData.hours_per_week,
        is_active: true
      }

      const newSubject = await subjectService.create(subjectData)
      console.log('Materia creada:', newSubject)
      
      toast.success('Materia creada exitosamente')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error al crear materia:', error)
      toast.error('Error al crear la materia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Nueva Materia</h2>
                <p className="text-sm text-gray-500">Agrega una nueva materia a una carrera</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la Materia */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Información de la Materia
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Materia *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Programación I"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código de la Materia *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.code ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: PROG-101"
                    />
                    {errors.code && (
                      <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe los objetivos y contenido de la materia..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuración Académica */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
                  Configuración Académica
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carrera *
                    </label>
                    <select
                      name="career_id"
                      value={formData.career_id}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.career_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecciona una carrera</option>
                      {careers.map((career) => (
                        <option key={career.id} value={career.id}>
                          {career.name}
                        </option>
                      ))}
                    </select>
                    {errors.career_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.career_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año *
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.year ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value={1}>1er Año</option>
                      <option value={2}>2do Año</option>
                      <option value={3}>3er Año</option>
                      <option value={4}>4to Año</option>
                      <option value={5}>5to Año</option>
                      <option value={6}>6to Año</option>
                    </select>
                    {errors.year && (
                      <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Créditos *
                    </label>
                    <input
                      type="number"
                      name="credits"
                      value={formData.credits}
                      onChange={handleChange}
                      min="1"
                      max="20"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.credits ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.credits && (
                      <p className="text-red-500 text-xs mt-1">{errors.credits}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas por Semana *
                  </label>
                  <input
                    type="number"
                    name="hours_per_week"
                    value={formData.hours_per_week}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.hours_per_week ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.hours_per_week && (
                    <p className="text-red-500 text-xs mt-1">{errors.hours_per_week}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Materia
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
