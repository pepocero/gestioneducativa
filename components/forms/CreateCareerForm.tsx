'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { careerService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  GraduationCap, 
  Save, 
  X,
  BookOpen,
  Clock,
  FileText
} from 'lucide-react'

interface CareerFormData {
  name: string
  description: string
  duration_years: number
}

interface CreateCareerFormProps {
  onClose: () => void
  onSave: () => void
}

export default function CreateCareerForm({ onClose, onSave }: CreateCareerFormProps) {
  const [formData, setFormData] = useState<CareerFormData>({
    name: '',
    description: '',
    duration_years: 4
  })

  const [errors, setErrors] = useState<Partial<CareerFormData>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_years' ? parseInt(value) : value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof CareerFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CareerFormData> = {}

    if (!formData.name.trim()) newErrors.name = 'El nombre de la carrera es requerido'
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida'
    if (formData.duration_years < 1 || formData.duration_years > 10) {
      newErrors.duration_years = 'La duración debe estar entre 1 y 10 años'
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
      // Crear carrera en Supabase
      const careerData = {
        institution_id: '7de7ceb2-fe97-4d1a-8479-0b90e0144e7d', // ID de la institución por defecto
        name: formData.name,
        description: formData.description,
        duration_years: formData.duration_years,
        is_active: true
      }

      const newCareer = await careerService.create(careerData)
      console.log('Carrera creada:', newCareer)
      
      toast.success('Carrera creada exitosamente')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error al crear carrera:', error)
      toast.error('Error al crear la carrera')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Nueva Carrera</h2>
                <p className="text-sm text-gray-500">Crea una nueva carrera académica</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la Carrera */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Información de la Carrera
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Carrera *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Ingeniería en Sistemas"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe los objetivos y características de la carrera..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración en Años *
                    </label>
                    <select
                      name="duration_years"
                      value={formData.duration_years}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.duration_years ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value={1}>1 año</option>
                      <option value={2}>2 años</option>
                      <option value={3}>3 años</option>
                      <option value={4}>4 años</option>
                      <option value={5}>5 años</option>
                      <option value={6}>6 años</option>
                    </select>
                    {errors.duration_years && (
                      <p className="text-red-500 text-xs mt-1">{errors.duration_years}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Información Adicional
                </h3>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Próximos Pasos
                      </h4>
                      <p className="text-sm text-blue-700">
                        Después de crear la carrera, podrás:
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Agregar materias a cada año de la carrera</li>
                        <li>• Configurar correlatividades entre materias</li>
                        <li>• Asignar profesores a las materias</li>
                        <li>• Inscribir estudiantes en la carrera</li>
                      </ul>
                    </div>
                  </div>
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
                    Crear Carrera
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
