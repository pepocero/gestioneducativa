'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { professorService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { Trash2, AlertTriangle, GraduationCap } from 'lucide-react'

interface DeleteProfessorModalProps {
  professor: any
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteProfessorModal({ professor, onClose, onConfirm }: DeleteProfessorModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await professorService.delete(professor.id)
      toast.success('Profesor eliminado exitosamente')
      onConfirm()
      onClose()
    } catch (error) {
      console.error('Error eliminando profesor:', error)
      toast.error('Error al eliminar el profesor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Eliminar Profesor</h3>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Al eliminar este profesor se perderán todos los datos asociados.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">
              ¿Estás seguro de que quieres eliminar este profesor?
            </p>

            {/* Professor Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {professor.first_name} {professor.last_name}
                    </p>
                    <p className="text-gray-500">{professor.email}</p>
                    <p className="text-gray-500">
                      Teléfono: {professor.phone || 'No especificado'}
                    </p>
                    <p className="text-gray-500">
                      Registrado: {new Date(professor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
