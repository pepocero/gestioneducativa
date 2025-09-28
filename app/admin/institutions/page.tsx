'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { institutionService } from '@/lib/supabase-service'
import CreateInstitutionForm from '@/components/forms/CreateInstitutionForm'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Building2, ArrowRight } from 'lucide-react'

export default function InstitutionsPage() {
  const router = useRouter()
  const [institutions, setInstitutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Debug: Log cuando el componente se monta
  useEffect(() => {
    console.log('🏢 InstitutionsPage montado, showCreateForm:', showCreateForm)
  }, [showCreateForm])

  useEffect(() => {
    loadInstitutions()
  }, [])

  // Auto-abrir modal si no hay instituciones
  useEffect(() => {
    if (!loading && institutions.length === 0) {
      console.log('🚀 Auto-abriendo modal porque no hay instituciones')
      setShowCreateForm(true)
    }
  }, [loading, institutions.length])

  const loadInstitutions = async () => {
    try {
      const data = await institutionService.getAll()
      setInstitutions(data)
    } catch (error) {
      console.error('Error cargando instituciones:', error)
      toast.error('Error cargando instituciones')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInstitution = () => {
    console.log('✅ Nueva institución creada')
    toast.success('Institución creada exitosamente')
    loadInstitutions() // Recargar la lista
  }

  const handleOpenCreateForm = () => {
    console.log('🔧 Abriendo formulario de creación de institución')
    setShowCreateForm(true)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instituciones</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona las instituciones educativas del sistema
            </p>
          </div>
          <Button onClick={handleOpenCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Institución
          </Button>
        </div>

        {/* Estadísticas de instituciones */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Instituciones</p>
                  <p className="text-2xl font-semibold text-gray-900">{institutions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de instituciones */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lista de Instituciones</h3>
          </CardHeader>
          <CardContent>
            {institutions.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay instituciones</h3>
                <p className="text-gray-500 mb-4">Comienza creando tu primera institución</p>
                <Button onClick={handleOpenCreateForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Institución
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {institutions.map((institution) => (
                  <div key={institution.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{institution.name}</h4>
                          <p className="text-sm text-gray-500">{institution.email}</p>
                          <p className="text-sm text-gray-500">{institution.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          Activa
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/institutions/${institution.id}`)}
                          className="flex items-center space-x-2"
                        >
                          <span>Administrar</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Modal de creación de institución - Versión Simple */}
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
                <h2 className="text-2xl font-bold text-gray-900">Nueva Institución</h2>
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
                
                console.log('🏗️ Creando institución con datos:', institutionData)
                
                try {
                  const newInstitution = await institutionService.create(institutionData)
                  console.log('✅ Institución creada:', newInstitution)
                  toast.success('Institución creada exitosamente')
                  setShowCreateForm(false)
                  loadInstitutions()
                } catch (error: any) {
                  console.error('❌ Error:', error)
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
        
        {/* Debug info */}
        {console.log('🔍 Debug - showCreateForm:', showCreateForm, 'institutions.length:', institutions.length)}
      </div>
    </DashboardLayout>
  )
}
