'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { careerService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  AlertTriangle,
  X,
  Trash2,
  GraduationCap
} from 'lucide-react'

interface DeleteCareerModalProps {
  career: {
    id: string
    name: string
    description: string
    duration_years: number
    is_active: boolean
  }
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteCareerModal({ career, onClose, onConfirm }: DeleteCareerModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== career.name) {
      toast.error('El nombre de la carrera no coincide')
      return
    }

    setLoading(true)
    try {
      await careerService.delete(career.id)
      toast.success('Carrera eliminada exitosamente')
      onConfirm()
      onClose()
    } catch (error) {
      console.error('Error eliminando carrera:', error)
      toast.error('Error al eliminar la carrera')
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
                <h2 className="text-xl font-bold text-gray-900">Eliminar Carrera</h2>
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
                    Al eliminar esta carrera, también se eliminarán todos los ciclos, materias y datos relacionados. 
                    Esta acción es irreversible.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{career.name}</h4>
                  <p className="text-sm text-gray-500">{career.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-400">
                      Duración: {career.duration_years} año{career.duration_years > 1 ? 's' : ''}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      career.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {career.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, escribe el nombre de la carrera:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={career.name}
              />
              <p className="text-xs text-gray-500 mt-1">
                Debes escribir exactamente: <strong>{career.name}</strong>
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
              disabled={loading || confirmText !== career.name}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Carrera
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
