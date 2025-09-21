'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { institutionService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  AlertTriangle, 
  Trash2, 
  X,
  Building2
} from 'lucide-react'

interface DeleteInstitutionModalProps {
  institution: {
    id: string
    name: string
    email: string
  }
  onClose: () => void
  onDelete: () => void
}

export default function DeleteInstitutionModal({ institution, onClose, onDelete }: DeleteInstitutionModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      // Eliminar institución de Supabase
      await institutionService.delete(institution.id)
      console.log('Institución eliminada:', institution.id)
      
      toast.success('Institución eliminada exitosamente')
      onDelete()
      onClose()
    } catch (error) {
      console.error('Error al eliminar institución:', error)
      toast.error('Error al eliminar la institución')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Eliminar Institución</h2>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenido de advertencia */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Building2 className="h-8 w-8 text-gray-400 mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ¿Estás seguro de que quieres eliminar esta institución?
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800 mb-1">
                          Institución a eliminar:
                        </h4>
                        <p className="text-sm text-red-700 font-medium">{institution.name}</p>
                        <p className="text-sm text-red-600">{institution.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      ⚠️ Advertencia: Esta acción eliminará:
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Todos los datos de la institución</li>
                      <li>• Todas las carreras asociadas</li>
                      <li>• Todos los estudiantes inscritos</li>
                      <li>• Todos los profesores asignados</li>
                      <li>• Todas las materias y calificaciones</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
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
                  Eliminar Institución
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


