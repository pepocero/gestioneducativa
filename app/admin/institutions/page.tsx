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

  useEffect(() => {
    loadInstitutions()
  }, [])

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
    console.log('Nueva institución creada')
    toast.success('Institución creada exitosamente')
    loadInstitutions() // Recargar la lista
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
          <Button onClick={() => setShowCreateForm(true)}>
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
                <Button onClick={() => setShowCreateForm(true)}>
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
        {/* Formulario de creación de institución */}
        {showCreateForm && (
          <CreateInstitutionForm
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateInstitution}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
