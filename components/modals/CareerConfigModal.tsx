'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { careerService } from '@/lib/supabase-service'
import { useBasicSecurityForm } from '@/lib/security'
import { toast } from 'react-hot-toast'
import { 
  GraduationCap, 
  Save, 
  X,
  Clock,
  FileText,
  Hash
} from 'lucide-react'

interface CareerConfigData {
  name: string
  description: string
  duration_years: number
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

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  // Hook de seguridad para el formulario
  const { processFormData, isProcessing } = useBasicSecurityForm<CareerConfigData>('forms')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'duration_years' ? parseInt(value) || 1 : value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Procesar datos con seguridad
      const fieldMappings = {
        name: 'name',
        description: 'description',
        duration_years: 'number',
        is_active: 'boolean'
      }

      const securityResult = await processFormData(formData, fieldMappings)

      // Verificar si hay errores de seguridad
      if (!securityResult.isValid) {
        setErrors(securityResult.errors)
        
        // Mostrar errores específicos
        if (securityResult.errors._rateLimit) {
          toast.error(securityResult.errors._rateLimit[0])
        } else if (securityResult.errors._system) {
          toast.error(securityResult.errors._system[0])
        } else {
          // Mostrar errores de campos específicos
          const firstError = Object.values(securityResult.errors)[0]?.[0]
          if (firstError) {
            toast.error(firstError)
          }
        }
        return
      }

      // Usar datos sanitizados
      const { sanitizedData } = securityResult
      
      // Actualizar carrera en Supabase
      await careerService.update(career.id, sanitizedData)
      console.log('Carrera actualizada:', sanitizedData)
      
      toast.success('Carrera actualizada exitosamente')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error al actualizar carrera:', error)
      toast.error('Error al actualizar la carrera')
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
                <h2 className="text-2xl font-bold text-gray-900">Configurar Carrera</h2>
                <p className="text-sm text-gray-500">Modifica la información de la carrera</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                      <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
                    )}
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
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe los objetivos y perfil de la carrera..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>
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
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                        <option key={year} value={year}>{year} año{year > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    {errors.duration_years && (
                      <p className="text-red-500 text-xs mt-1">{errors.duration_years[0]}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Hash className="h-5 w-5 mr-2 text-purple-600" />
                  Estado
                </h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Estado de la Carrera</h4>
                    <p className="text-sm text-gray-500">
                      {formData.is_active 
                        ? 'La carrera está activa y disponible para inscripciones'
                        : 'La carrera está inactiva y no acepta nuevas inscripciones'
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className="flex items-center space-x-2"
                  >
                    <span className={`text-sm font-medium ${formData.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        formData.is_active ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Gestión Académica
                </h3>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Gestión Separada</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Con el nuevo sistema, las materias y ciclos se gestionan de forma independiente:
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• <strong>Materias:</strong> Ve a la sección "Materias" para crear y gestionar materias</li>
                        <li>• <strong>Ciclos:</strong> Ve a la sección "Ciclos" para crear años académicos</li>
                        <li>• <strong>Asignación:</strong> Asigna materias a ciclos desde la gestión de ciclos</li>
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
              <Button type="submit" disabled={loading || isProcessing}>
                {loading || isProcessing ? (
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
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}