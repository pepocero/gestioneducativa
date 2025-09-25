'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { studentService, subjectService, careerService, cycleService } from '@/lib/supabase-service'
import { supabase } from '@/lib/supabase'
import { useCareers } from '@/hooks/useData'
import { useCycles } from '@/hooks/useAcademic'
import { toast } from 'react-hot-toast'
import { User, BookOpen, GraduationCap, Calendar, FileText } from 'lucide-react'

interface EnrollmentRequestFormProps {
  onClose: () => void
  onSave: () => void
}

interface EnrollmentRequestData {
  student_id: string
  subject_id: string
  career_id: string
  cycle_id: string
  academic_year: string
  semester: string
  notes: string
}

export default function EnrollmentRequestForm({ onClose, onSave }: EnrollmentRequestFormProps) {
  // Force recompilation
  const [students, setStudents] = useState<any[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Usar hooks para carreras
  const { careers, loading: careersLoading } = useCareers()
  
  // Estado para ciclos - los cargaremos dinámicamente
  const [cycles, setCycles] = useState<any[]>([])
  const [cyclesLoading, setCyclesLoading] = useState(false)

  const [formData, setFormData] = useState<EnrollmentRequestData>({
    student_id: '',
    subject_id: '',
    career_id: '',
    cycle_id: '',
    academic_year: new Date().getFullYear().toString(),
    semester: '1',
    notes: ''
  })
  const [errors, setErrors] = useState<Partial<EnrollmentRequestData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadCyclesForCareer = async (careerId: string) => {
    try {
      setCyclesLoading(true)
      console.log('Cargando ciclos para carrera:', careerId)
      
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('career_id', careerId)
        .order('year', { ascending: true })
      
      if (error) {
        console.error('Error en consulta SQL de ciclos:', error)
        throw error
      }
      
      console.log('Ciclos encontrados:', data)
      if (!data || data.length === 0) {
        console.log('No se encontraron ciclos para la carrera:', careerId)
        toast.error('No se encontraron ciclos para esta carrera')
      }
      setCycles(data || [])
    } catch (error) {
      console.error('Error cargando ciclos:', error)
      toast.error('Error cargando ciclos')
    } finally {
      setCyclesLoading(false)
    }
  }

  const loadSubjectsForCycle = async (cycleId: string) => {
    try {
      setLoading(true)
      console.log('Cargando materias para carrera:', formData.career_id, 'y ciclo:', cycleId)
      
      const { data, error } = await supabase
        .from('subjects_new')
        .select('*')
        .eq('career_id', formData.career_id)
        .order('code', { ascending: true })
      
      if (error) {
        console.error('Error en consulta SQL:', error)
        throw error
      }
      
      console.log('Materias encontradas:', data)
      if (!data || data.length === 0) {
        console.log('No se encontraron materias para la carrera:', formData.career_id)
        toast.error('No se encontraron materias para esta carrera')
      }
      setFilteredSubjects(data || [])
    } catch (error) {
      console.error('Error cargando materias:', error)
      toast.error('Error cargando materias')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof EnrollmentRequestData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar campos dependientes
    if (field === 'career_id') {
      setFormData(prev => ({
        ...prev,
        career_id: value,
        cycle_id: '',
        subject_id: ''
      }))
      
      // Cargar ciclos para la carrera seleccionada
      if (value) {
        loadCyclesForCareer(value)
      } else {
        setCycles([])
      }
    } else if (field === 'cycle_id') {
      console.log('Cambiando ciclo a:', value)
      setFormData(prev => ({
        ...prev,
        cycle_id: value,
        subject_id: ''
      }))
      
      // Cargar materias para el ciclo seleccionado
      if (value) {
        console.log('Ejecutando loadSubjectsForCycle con:', value)
        loadSubjectsForCycle(value)
      } else {
        console.log('Limpiando materias')
        setFilteredSubjects([])
      }
    }
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<EnrollmentRequestData> = {}
    
    if (!formData.student_id) {
      newErrors.student_id = 'Selecciona un estudiante'
    }
    if (!formData.career_id) {
      newErrors.career_id = 'Selecciona una carrera'
    }
    if (!formData.cycle_id) {
      newErrors.cycle_id = 'Selecciona un ciclo'
    }
    if (!formData.subject_id) {
      newErrors.subject_id = 'Selecciona una materia'
    }
    if (!formData.academic_year) {
      newErrors.academic_year = 'Ingresa el año académico'
    }
    if (!formData.semester) {
      newErrors.semester = 'Ingresa el semestre'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar estudiantes
      const studentsData = await studentService.getAll('') // TODO: Pasar institutionId real
      setStudents(studentsData)
      
      // Las materias se cargarán dinámicamente cuando se seleccione un ciclo
      setFilteredSubjects([])
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }
    
    try {
      setIsSubmitting(true)
      
      console.log('Datos de la solicitud:', formData)
      
      // Crear la inscripción en la base de datos
      const enrollmentData = {
        student_id: formData.student_id,
        subject_id: formData.subject_id,
        enrollment_date: new Date().toISOString(),
        status: 'enrolled' as const
      }
      
      console.log('Creando inscripción con datos:', enrollmentData)
      
      const { data, error } = await supabase
        .from('enrollments')
        .insert([enrollmentData])
        .select()
      
      if (error) {
        console.error('Error creando inscripción:', error)
        throw error
      }
      
      console.log('Inscripción creada exitosamente:', data)
      
      toast.success('Inscripción creada correctamente')
      onSave()
    } catch (error) {
      console.error('Error enviando solicitud:', error)
      toast.error('Error creando inscripción')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    return student ? `${student.first_name} ${student.last_name} (${student.student_number})` : ''
  }

  const getSubjectName = (subjectId: string) => {
    const subject = filteredSubjects.find((s: any) => s.id === subjectId)
    return subject ? `${subject.name} (${subject.code})` : ''
  }

  const getCareerName = (careerId: string) => {
    const career = careers.find((c: any) => c.id === careerId)
    return career ? career.name : ''
  }

  const getCycleName = (cycleId: string) => {
    const cycle = cycles.find((c: any) => c.id === cycleId)
    return cycle ? cycle.name : ''
  }

  const getFilteredCycles = () => {
    return cycles
  }

  const getFilteredSubjects = () => {
    return filteredSubjects
  }

  return (
    <Modal
      isOpen={true}
      title="Nueva Solicitud de Inscripción"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Estudiante */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Información del Estudiante</h3>
          </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estudiante *
                </label>
                  <Select
                    value={formData.student_id}
                    onChange={(e) => handleInputChange('student_id', e.target.value)}
                    placeholder="Seleccionar estudiante"
                  >
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.student_number})
                    </option>
                  ))}
                </Select>
                {errors.student_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                )}
              </div>
            </div>

            {/* Información Académica */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Información Académica</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrera *
                  </label>
                  <Select
                    value={formData.career_id}
                    onChange={(e) => handleInputChange('career_id', e.target.value)}
                    placeholder="Seleccionar carrera"
                  >
                    {careers.map((career: any) => (
                      <option key={career.id} value={career.id}>
                        {career.name}
                      </option>
                    ))}
                  </Select>
                  {errors.career_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.career_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciclo *
                  </label>
                  <Select
                    value={formData.cycle_id}
                    onChange={(e) => handleInputChange('cycle_id', e.target.value)}
                    placeholder="Seleccionar ciclo"
                    disabled={!formData.career_id}
                  >
                    {getFilteredCycles().map((cycle: any) => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.name} - Año {cycle.year}
                      </option>
                    ))}
                  </Select>
                  {errors.cycle_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.cycle_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materia *
                  </label>
                  <Select
                    value={formData.subject_id}
                    onChange={(e) => handleInputChange('subject_id', e.target.value)}
                    placeholder={
                      loading ? "Cargando materias..." : 
                      getFilteredSubjects().length === 0 && formData.cycle_id ? "No hay materias disponibles" :
                      "Seleccionar materia"
                    }
                    disabled={!formData.cycle_id || loading}
                  >
                    {getFilteredSubjects().map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </Select>
                  {errors.subject_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año Académico *
                  </label>
                  <Input
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) => handleInputChange('academic_year', e.target.value)}
                    placeholder="2025"
                  />
                  {errors.academic_year && (
                    <p className="mt-1 text-sm text-red-600">{errors.academic_year}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semestre *
                  </label>
                  <Select
                    value={formData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    placeholder="Seleccionar semestre"
                  >
                    <option value="1">Primer Semestre</option>
                    <option value="2">Segundo Semestre</option>
                    <option value="3">Tercer Semestre</option>
                    <option value="4">Cuarto Semestre</option>
                  </Select>
                  {errors.semester && (
                    <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notas Adicionales */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">Información Adicional</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (Opcional)
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Información adicional sobre la solicitud..."
                  rows={3}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                )}
              </div>
            </div>

            {/* Resumen de la Solicitud */}
            {formData.student_id && formData.subject_id && formData.career_id && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Resumen de la Solicitud</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Estudiante:</strong> {getStudentName(formData.student_id)}</p>
                  <p><strong>Carrera:</strong> {getCareerName(formData.career_id)}</p>
                  <p><strong>Materia:</strong> {getSubjectName(formData.subject_id)}</p>
                  <p><strong>Período:</strong> {formData.academic_year} - Semestre {formData.semester}</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || loading || careersLoading || cyclesLoading}>
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </div>
          </form>
        </Modal>
      )
    }
