'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { subjectService } from '@/lib/supabase-service'
import { useBasicSecurityForm } from '@/lib/security'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { 
  BookOpen, 
  Save, 
  X,
  Clock,
  GraduationCap,
  FileText,
  Hash
} from 'lucide-react'

interface SubjectFormData {
  name: string
  code: string
  description: string
  credits: number
  hours_per_week: number
  career_id: string
  is_active: boolean
}

interface EditSubjectFormProps {
  subject: {
    id: string
    name: string
    code: string
    description: string
    credits: number
    hours_per_week: number
    career_id: string
    is_active: boolean
  }
  careers: any[]
  onClose: () => void
  onSave: () => void
}

export default function EditSubjectForm({ subject, careers, onClose, onSave }: EditSubjectFormProps) {
  const [formData, setFormData] = useState<SubjectFormData>({
    name: subject.name,
    code: subject.code,
    description: subject.description,
    credits: subject.credits,
    hours_per_week: subject.hours_per_week,
    career_id: subject.career_id,
    is_active: subject.is_active
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Hook de seguridad para el formulario
  const { processFormData, isProcessing } = useBasicSecurityForm<SubjectFormData>('forms')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'credits' || name === 'hours_per_week' ? parseInt(value) || 0 : value
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
        code: 'code',
        description: 'description',
        credits: 'number',
        hours_per_week: 'number',
        career_id: 'uuid',
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
      
      // Actualizar materia en Supabase
      await subjectService.update(subject.id, sanitizedData)
      console.log('Materia actualizada:', sanitizedData)
      
      toast.success('Materia actualizada exitosamente')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error al actualizar materia:', error)
      toast.error('Error al actualizar la materia')
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
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Materia</h2>
                <p className="text-sm text-gray-500">Modifica la información de la materia</p>
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
                      <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
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
                      placeholder="Ej: PROG101"
                    />
                    {errors.code && (
                      <p className="text-red-500 text-xs mt-1">{errors.code[0]}</p>
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
                      placeholder="Describe los objetivos y contenido de la materia..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>
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
                      {careers.map((career) => (
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

            {/* Configuración Académica */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                  Configuración Académica
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      max="10"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.credits ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.credits && (
                      <p className="text-red-500 text-xs mt-1">{errors.credits[0]}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Número de créditos académicos</p>
                  </div>

                  <div>
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
                      <p className="text-red-500 text-xs mt-1">{errors.hours_per_week[0]}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Horas de clase por semana</p>
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
                    <h4 className="text-sm font-medium text-gray-900">Estado de la Materia</h4>
                    <p className="text-sm text-gray-500">
                      {formData.is_active 
                        ? 'La materia está activa y disponible para asignación'
                        : 'La materia está inactiva y no se puede asignar'
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
