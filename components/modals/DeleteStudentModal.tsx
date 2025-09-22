'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { studentService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  AlertTriangle, 
  Trash2, 
  X,
  User
} from 'lucide-react'

interface DeleteStudentModalProps {
  student: {
    id: string
    first_name: string
    last_name: string
    email: string
    student_number: string
  }
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteStudentModal({ student, onClose, onConfirm }: DeleteStudentModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await studentService.delete(student.id)
      toast.success('Estudiante eliminado exitosamente')
      onConfirm()
      onClose()
    } catch (error) {
      console.error('Error al eliminar estudiante:', error)
      toast.error('Error al eliminar el estudiante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Eliminar Estudiante</h2>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenido */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                  <p className="text-sm text-gray-500">Número: {student.student_number}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">¿Estás seguro?</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Se eliminará permanentemente toda la información del estudiante, incluyendo:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                    <li>Información personal</li>
                    <li>Inscripciones a carreras</li>
                    <li>Inscripciones a materias</li>
                    <li>Historial académico</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? 'Eliminando...' : 'Eliminar Estudiante'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
