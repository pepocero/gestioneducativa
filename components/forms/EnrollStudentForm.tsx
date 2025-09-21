'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { studentService, careerService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  GraduationCap, 
  User, 
  Save, 
  X,
  Calendar,
  BookOpen
} from 'lucide-react'

interface EnrollStudentFormProps {
  student: any
  onClose: () => void
  onSave: () => void
}

export default function EnrollStudentForm({ student, onClose, onSave }: EnrollStudentFormProps) {
  const [formData, setFormData] = useState({
    careerId: '',
    year: '1',
    enrollmentDate: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Partial<typeof formData>>({})
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {}

    if (!formData.careerId) newErrors.careerId = 'La carrera es requerida'
    if (!formData.year) newErrors.year = 'El año es requerido'

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
      // Actualizar el estudiante con la carrera asignada
      const updateData = {
        career_id: formData.careerId,
        enrollment_date: formData.enrollmentDate
      }

      await studentService.update(student.id, updateData)
      
      toast.success('Estudiante inscrito en la carrera exitosamente')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error al inscribir estudiante:', error)
      toast.error('Error al inscribir el estudiante en la carrera')
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
                <h2 className="text-2xl font-bold text-gray-900">Inscribir Estudiante</h2>
                <p className="text-sm text-gray-500">Asigna una carrera al estudiante</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Información del Estudiante */}
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Información del Estudiante
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                  <p className="text-lg text-gray-900">{student?.first_name} {student?.last_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg text-gray-900">{student?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">DNI</p>
                  <p className="text-lg text-gray-900">{student?.dni}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Número de Estudiante</p>
                  <p className="text-lg text-gray-900">{student?.student_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Académica */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                  Inscripción Académica
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carrera *
                    </label>
                    <select
                      name="careerId"
                      value={formData.careerId}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.careerId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecciona una carrera</option>
                      {careers.map((career) => (
                        <option key={career.id} value={career.id}>
                          {career.name}
                        </option>
                      ))}
                    </select>
                    {errors.careerId && (
                      <p className="text-red-500 text-xs mt-1">{errors.careerId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año de Inscripción *
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.year ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="1">1er Año</option>
                      <option value="2">2do Año</option>
                      <option value="3">3er Año</option>
                      <option value="4">4to Año</option>
                      <option value="5">5to Año</option>
                    </select>
                    {errors.year && (
                      <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inscripción
                    </label>
                    <input
                      type="date"
                      name="enrollmentDate"
                      value={formData.enrollmentDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Inscribir Estudiante
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
