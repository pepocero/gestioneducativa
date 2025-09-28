'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Building2, Plus, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface NoInstitutionAssignedProps {
  userRole: string
}

export default function NoInstitutionAssigned({ userRole }: NoInstitutionAssignedProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateInstitution = async (institutionData: any) => {
    console.log('✅ Institución creada desde NoInstitutionAssigned:', institutionData)
    setShowCreateForm(false)
    // Recargar la página para mostrar el dashboard
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Sin Institución Asignada
          </h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {userRole === 'admin' ? (
              <>
                Como administrador, necesitas crear una institución para comenzar a usar el sistema.
              </>
            ) : (
              <>
                Tu cuenta no está asociada a ninguna institución. Contacta a tu administrador.
              </>
            )}
          </p>
          
          {userRole === 'admin' && (
            <div className="space-y-3">
              <Button 
                className="w-full flex items-center justify-center"
                onClick={() => {
                  console.log('🎯 Abriendo modal de creación de institución')
                  setShowCreateForm(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Institución
              </Button>
              
              <div className="text-sm text-gray-500 text-center">
                <p>Una vez creada la institución, podrás:</p>
                <ul className="mt-2 space-y-1 text-left">
                  <li>• Gestionar estudiantes y profesores</li>
                  <li>• Crear carreras y materias</li>
                  <li>• Administrar inscripciones</li>
                  <li>• Configurar el sistema completo</li>
                </ul>
              </div>
            </div>
          )}
          
          {userRole !== 'admin' && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Si crees que esto es un error, contacta al administrador del sistema.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reintentar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de creación de institución */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateForm(false)
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Crear Primera Institución</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const institutionData = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                address: formData.get('address') as string
              }
              
              console.log('🏗️ Creando institución:', institutionData)
              
              try {
                // Importar el servicio dinámicamente
                const { institutionService } = await import('@/lib/supabase-service')
                const newInstitution = await institutionService.create(institutionData)
                console.log('✅ Institución creada:', newInstitution)
                
                // Mostrar mensaje de éxito
                const { toast } = await import('react-hot-toast')
                toast.success('Institución creada exitosamente')
                
                // Cerrar modal y recargar
                setShowCreateForm(false)
                window.location.reload()
              } catch (error: any) {
                console.error('❌ Error:', error)
                const { toast } = await import('react-hot-toast')
                toast.error(`Error: ${error.message}`)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Institución *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa el nombre de la institución"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="institucion@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Calle 123, Ciudad, Provincia, País"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear Institución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

