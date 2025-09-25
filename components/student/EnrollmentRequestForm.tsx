'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { enrollmentRequestService } from '@/lib/supabase-service'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { User, BookOpen, GraduationCap, Calendar, FileText, Send } from 'lucide-react'

interface EnrollmentRequestFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  studentId: string
  subjectId: string
  subjectName: string
  careerName: string
  cycleName: string
}

export default function EnrollmentRequestForm({
  isOpen,
  onClose,
  onSuccess,
  studentId,
  subjectId,
  subjectName,
  careerName,
  cycleName
}: EnrollmentRequestFormProps) {
  const [formData, setFormData] = useState({
    academic_year: new Date().getFullYear().toString(),
    semester: '1',
    student_notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.academic_year || !formData.semester) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Obtener información completa del subject para obtener career_id y cycle_id
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects_new')
        .select(`
          *,
          cycles(
            id,
            career_id,
            careers(id)
          )
        `)
        .eq('id', subjectId)
        .single()

      if (subjectError) throw subjectError

      const request = await enrollmentRequestService.create({
        student_id: studentId,
        subject_id: subjectId,
        career_id: subjectData.cycles.careers.id,
        cycle_id: subjectData.cycles.id,
        academic_year: formData.academic_year,
        semester: parseInt(formData.semester),
        student_notes: formData.student_notes || undefined
      })

      toast.success('Solicitud de inscripción enviada correctamente')
      toast.success('Tu solicitud será revisada por un administrador y recibirás una notificación del resultado')
      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        academic_year: new Date().getFullYear().toString(),
        semester: '1',
        student_notes: ''
      })
    } catch (error: any) {
      console.error('Error enviando solicitud:', error)
      toast.error(error.message || 'Error enviando solicitud de inscripción')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Solicitar Inscripción a Materia"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de la Materia */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            Información de la Materia
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Materia:</span>
              <span className="text-gray-900">{subjectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Carrera:</span>
              <span className="text-gray-900">{careerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Ciclo:</span>
              <span className="text-gray-900">{cycleName}</span>
            </div>
          </div>
        </div>

        {/* Información Académica */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Período Académico
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año Académico *
              </label>
              <Input
                type="number"
                value={formData.academic_year}
                onChange={(e) => handleInputChange('academic_year', e.target.value)}
                placeholder="2025"
                min="2020"
                max="2030"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semestre *
              </label>
              <Select
                value={formData.semester}
                onChange={(e) => handleInputChange('semester', e.target.value)}
                required
              >
                <option value="1">Primer Semestre</option>
                <option value="2">Segundo Semestre</option>
                <option value="3">Tercer Semestre</option>
                <option value="4">Cuarto Semestre</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Notas Adicionales */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            Información Adicional
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <Textarea
              value={formData.student_notes}
              onChange={(e) => handleInputChange('student_notes', e.target.value)}
              placeholder="Información adicional sobre tu solicitud de inscripción..."
              rows={3}
            />
            <p className="mt-1 text-sm text-gray-500">
              Puedes agregar cualquier información relevante que consideres importante para tu solicitud.
            </p>
          </div>
        </div>

        {/* Información del Proceso */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Proceso de Inscripción</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>1. <strong>Solicitud:</strong> Tu solicitud será enviada para revisión</p>
            <p>2. <strong>Supervisión:</strong> Un administrador revisará tu solicitud</p>
            <p>3. <strong>Aprobación:</strong> Una vez aprobada, quedarás oficialmente inscrito</p>
            <p>4. <strong>Notificación:</strong> Recibirás una notificación del resultado</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
