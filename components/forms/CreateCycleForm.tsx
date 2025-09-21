'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { cycleService } from '@/lib/supabase-service'
import { useBasicSecurityForm } from '@/lib/security'
import { toast } from 'react-hot-toast'
import { 
  Calendar, 
  Save, 
  X,
  GraduationCap,
  FileText,
  Hash
} from 'lucide-react'

interface CycleFormData {
  name: string
  year: number
  career_id: string
  is_active: boolean
}

interface CreateCycleFormProps {
  careers: any[]
  onClose: () => void
  onSave: () => void
}

export default function CreateCycleForm({ careers, onClose, onSave }: CreateCycleFormProps) {
  const [formData, setFormData] = useState<CycleFormData>({
    name: '',
    year: 1,
    career_id: careers.length > 0 ? careers[0].id : '',
    is_active: true
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  // Hook de seguridad para el formulario
  const { processFormData, isProcessing } = useBasicSecurityForm<CycleFormData>('forms')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'year' ? parseInt(value) || 1 : value
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
        year: 'number',
        career_id: 'code'
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
      
      // Crear ciclo en Supabase
      await cycleService.create(sanitizedData)
      console.log('Ciclo creado:', sanitizedData)
      
      toast.success('Ciclo creado exitosamente')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error al crear ciclo:', error)
      toast.error('Error al crear el ciclo')
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
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Nuevo Ciclo</h2>
                <p className="text-sm text-gray-500">Crea un nuevo ciclo académico</p>
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
                      Nombre del Ciclo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Primer Año"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año del Ciclo *
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.year ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                        <option key={year} value={year}>{year}° Año</option>
                      ))}
                    </select>
                    {errors.year && (
                      <p className="text-red-500 text-xs mt-1">{errors.year[0]}</p>
                    )}
                  </div>

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
                      {careers.map(career => (
                        <option key={career.id} value={career.id}>
                          {career.name}
                        </option>
                      ))}
                    </select>
                    {errors.career_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.career_id[0]}</p>
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
                    <h4 className="text-sm font-medium text-gray-900">Estado del Ciclo</h4>
                    <p className="text-sm text-gray-500">
                      {formData.is_active 
                        ? 'El ciclo está activo y disponible para asignación de materias'
                        : 'El ciclo está inactivo y no se puede asignar materias'
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className="flex items-center space-x-2"
                  >
                    <span className={`text-sm font-medium ${formData.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.is_active ? 'Activo' : 'Inactivo'}
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

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || isProcessing}>
                {loading || isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Ciclo
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
