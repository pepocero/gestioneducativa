'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cycleService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  AlertTriangle,
  X,
  Trash2,
  Calendar
} from 'lucide-react'

interface DeleteCycleModalProps {
  cycle: {
    id: string
    name: string
    year: number
    career_id: string
    is_active: boolean
  }
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteCycleModal({ cycle, onClose, onConfirm }: DeleteCycleModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== cycle.name) {
      toast.error('El nombre del ciclo no coincide')
      return
    }

    setLoading(true)
    try {
      await cycleService.delete(cycle.id)
      toast.success('Ciclo eliminado exitosamente')
      onConfirm()
      onClose()
    } catch (error) {
      console.error('Error eliminando ciclo:', error)
      toast.error('Error al eliminar el ciclo')
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
                <h2 className="text-xl font-bold text-gray-900">Eliminar Ciclo</h2>
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
                    Al eliminar este ciclo, también se eliminarán todas las asignaciones 
                    de materias y datos relacionados. Esta acción es irreversible.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{cycle.name}</h4>
                  <p className="text-sm text-gray-500">Año {cycle.year}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cycle.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cycle.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, escribe el nombre del ciclo:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={cycle.name}
              />
              <p className="text-xs text-gray-500 mt-1">
                Debes escribir exactamente: <strong>{cycle.name}</strong>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading || confirmText !== cycle.name}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Ciclo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
