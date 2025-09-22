'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { subjectService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  AlertTriangle,
  X,
  Trash2,
  BookOpen
} from 'lucide-react'

interface DeleteSubjectModalProps {
  subject: {
    id: string
    name: string
    code: string
    description: string
    credits: number
    hours_per_week: number
    is_active: boolean
  }
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteSubjectModal({ subject, onClose, onConfirm }: DeleteSubjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== subject.name) {
      toast.error('El nombre de la materia no coincide')
      return
    }

    setLoading(true)
    try {
      await subjectService.delete(subject.id)
      toast.success('Materia eliminada exitosamente')
      onConfirm()
      onClose()
    } catch (error) {
      console.error('Error eliminando materia:', error)
      toast.error('Error al eliminar la materia')
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
                <h2 className="text-xl font-bold text-gray-900">Eliminar Materia</h2>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Advertencia</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Al eliminar esta materia, también se eliminarán todas las asignaciones 
                    a ciclos y datos relacionados. Esta acción es irreversible.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{subject.name}</h4>
                  <p className="text-sm text-gray-500">{subject.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-400">
                      Código: {subject.code}
                    </span>
                    <span className="text-xs text-gray-400">
                      {subject.credits} créditos
                    </span>
                    <span className="text-xs text-gray-400">
                      {subject.hours_per_week}h/semana
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      subject.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subject.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, escribe el nombre de la materia:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={subject.name}
              />
              <p className="text-xs text-gray-500 mt-1">
                Debes escribir exactamente: <strong>{subject.name}</strong>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              disabled={loading || confirmText !== subject.name}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Materia
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
