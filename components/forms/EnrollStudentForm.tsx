'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { careerService, subjectService, careerEnrollmentService, subjectEnrollmentService } from '@/lib/supabase-service'
import { useBasicSecurityForm } from '@/lib/security'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  GraduationCap, 
  BookOpen, 
  Save, 
  X,
  Calendar,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface EnrollmentFormData {
  careerId: string
  academicYear: string
  semester: string
  selectedSubjects: string[]
}

interface EnrollStudentFormProps {
  student: {
    id: string
    first_name: string
    last_name: string
    student_number: string
  }
  onClose: () => void
  onSave: () => void
}

export default function EnrollStudentForm({ student, onClose, onSave }: EnrollStudentFormProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    careerId: '',
    academicYear: new Date().getFullYear().toString(),
    semester: '1',
    selectedSubjects: []
  })

  const [careers, setCareers] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<EnrollmentFormData>>({})

  // Hook de seguridad para el formulario
  const { processFormData, isProcessing } = useBasicSecurityForm<EnrollmentFormData>('forms')

  // Cargar carreras al montar el componente
  useEffect(() => {
    loadCareers()
  }, [])

  // Cargar materias cuando se selecciona una carrera
  useEffect(() => {
    if (formData.careerId) {
      loadSubjects()
    }
  }, [formData.careerId])

    const loadCareers = async () => {
      try {
        const careersData = await careerService.getAll()
        setCareers(careersData)
      } catch (error) {
        console.error('Error cargando carreras:', error)
        toast.error('Error cargando carreras')
      }
    }

  const loadSubjects = async () => {
    try {
      const subjectsData = await subjectService.getAll()
      // Filtrar materias por carrera seleccionada
      const careerSubjects = subjectsData.filter(subject => subject.career_id === formData.careerId)
      setSubjects(careerSubjects)
    } catch (error) {
      console.error('Error cargando materias:', error)
      toast.error('Error cargando materias')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof EnrollmentFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Procesar datos con seguridad
      const fieldMappings = {
        careerId: 'uuid',
        academicYear: 'text',
        semester: 'text',
        selectedSubjects: 'array'
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

      // Validar campos requeridos
      const newErrors: Partial<EnrollmentFormData> = {}
      if (!formData.careerId) newErrors.careerId = 'Debes seleccionar una carrera'
      if (!formData.academicYear) newErrors.academicYear = 'El año académico es requerido'
      if (!formData.semester) newErrors.semester = 'El semestre es requerido'
      if (formData.selectedSubjects.length === 0) {
        toast.error('Debes seleccionar al menos una materia')
        return
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // Obtener el usuario actual y su institución
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        toast.error('Usuario no autenticado')
      return
    }

      // Obtener la institución del usuario usando auth_user_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('institution_id')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData) {
        console.error('Error obteniendo institución del usuario:', userError)
        toast.error('Error obteniendo información del usuario')
        return
      }

      // Usar datos sanitizados
      const { sanitizedData } = securityResult

      // 1. Crear inscripción a carrera
      const careerEnrollment = await careerEnrollmentService.create({
        student_id: student.id,
        career_id: sanitizedData.careerId,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        academic_year: sanitizedData.academicYear,
        semester: sanitizedData.semester,
        notes: `Inscripción automática para ${student.first_name} ${student.last_name}`
      })

      // 2. Crear inscripciones a materias
      const subjectEnrollments = await Promise.all(
        formData.selectedSubjects.map(subjectId =>
          subjectEnrollmentService.create({
            student_id: student.id,
            subject_id: subjectId,
            career_enrollment_id: careerEnrollment.id,
            enrollment_date: new Date().toISOString().split('T')[0],
            status: 'enrolled',
            academic_year: sanitizedData.academicYear,
            semester: sanitizedData.semester,
            notes: `Inscripción automática para ${student.first_name} ${student.last_name}`
          })
        )
      )

      console.log('Inscripciones creadas:', { careerEnrollment, subjectEnrollments })
      
      toast.success(`Estudiante inscrito exitosamente en ${formData.selectedSubjects.length} materia(s)`)
      onSave()
      onClose()
    } catch (error) {
      console.error('Error al inscribir estudiante:', error)
      toast.error('Error al inscribir el estudiante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Inscribir Estudiante</h2>
                <p className="text-sm text-gray-500">
                  Inscribir a {student.first_name} {student.last_name} ({student.student_number})
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de Inscripción */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Información de Inscripción
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
                      Año Académico *
                    </label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.academicYear ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="2024"
                    />
                    {errors.academicYear && (
                      <p className="text-red-500 text-xs mt-1">{errors.academicYear}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semestre *
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.semester ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="1">Semestre 1</option>
                      <option value="2">Semestre 2</option>
                    </select>
                    {errors.semester && (
                      <p className="text-red-500 text-xs mt-1">{errors.semester}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selección de Materias */}
            {formData.careerId && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                    Seleccionar Materias
                  </h3>
                  <p className="text-sm text-gray-500">
                    Selecciona las materias en las que quieres inscribir al estudiante
                  </p>
                </CardHeader>
                <CardContent>
                  {subjects.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materias disponibles</h3>
                      <p className="text-gray-500">No se encontraron materias para la carrera seleccionada.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.selectedSubjects.includes(subject.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSubjectToggle(subject.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{subject.name}</h4>
                              <p className="text-sm text-gray-500">{subject.code}</p>
                              <p className="text-xs text-gray-400">{subject.credits} créditos</p>
                            </div>
                            <div className="flex-shrink-0">
                              {formData.selectedSubjects.includes(subject.id) ? (
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              ) : (
                                <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resumen */}
            {formData.selectedSubjects.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-600" />
                    Resumen de Inscripción
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-800">Inscripción Lista</h4>
                        <p className="text-sm text-green-700">
                          El estudiante será inscrito en {formData.selectedSubjects.length} materia(s) 
                          del {formData.semester}° semestre del año {formData.academicYear}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || isProcessing || formData.selectedSubjects.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                    <Save className="h-4 w-4 mr-2" />
                {loading ? 'Inscribiendo...' : 'Inscribir Estudiante'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}