'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { institutionService } from '@/lib/supabase-service'
import { toast } from 'react-hot-toast'
import { 
  Building, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  UserCheck,
  ArrowLeft,
  School,
  ClipboardList
} from 'lucide-react'

// Importar los componentes de pestañas
import StudentsTab from '@/components/institution-tabs/StudentsTab'
import ProfessorsTab from '@/components/institution-tabs/ProfessorsTab'
import CareersTab from '@/components/institution-tabs/CareersTab'
import SubjectsTab from '@/components/institution-tabs/SubjectsTab'
import CyclesTab from '@/components/institution-tabs/CyclesTab'
import EnrollmentsTab from '@/components/institution-tabs/EnrollmentsTab'

type TabType = 'students' | 'professors' | 'careers' | 'subjects' | 'cycles' | 'enrollments'

export default function InstitutionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const institutionId = params.id as string
  
  const [institution, setInstitution] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('students')

  // Cargar datos de la institución
  useEffect(() => {
    if (institutionId) {
      loadInstitution()
    }
  }, [institutionId])

  const loadInstitution = async () => {
    try {
      setLoading(true)
      const institutionData = await institutionService.getById(institutionId)
      setInstitution(institutionData)
    } catch (error) {
      console.error('Error cargando institución:', error)
      toast.error('Error cargando institución')
      router.push('/admin/institutions')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    {
      id: 'students' as TabType,
      name: 'Estudiantes',
      icon: Users,
      description: 'Gestión de estudiantes'
    },
    {
      id: 'professors' as TabType,
      name: 'Profesores', 
      icon: UserCheck,
      description: 'Gestión de profesores'
    },
    {
      id: 'careers' as TabType,
      name: 'Carreras',
      icon: GraduationCap,
      description: 'Gestión de carreras'
    },
    {
      id: 'subjects' as TabType,
      name: 'Materias',
      icon: BookOpen,
      description: 'Gestión de materias'
    },
    {
      id: 'cycles' as TabType,
      name: 'Ciclos',
      icon: Calendar,
      description: 'Gestión de ciclos'
    },
    {
      id: 'enrollments' as TabType,
      name: 'Inscripciones',
      icon: ClipboardList,
      description: 'Gestión de inscripciones'
    }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!institution) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Institución no encontrada</h2>
          <Button onClick={() => router.push('/admin/institutions')} className="mt-4">
            Volver a Instituciones
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentsTab institutionId={institutionId} />
      case 'professors':
        return <ProfessorsTab institutionId={institutionId} />
      case 'careers':
        return <CareersTab institutionId={institutionId} />
      case 'subjects':
        return <SubjectsTab institutionId={institutionId} />
      case 'cycles':
        return <CyclesTab institutionId={institutionId} />
      case 'enrollments':
        return <EnrollmentsTab institutionId={institutionId} />
      default:
        return <StudentsTab institutionId={institutionId} />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con información de la institución */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/institutions')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </Button>
                
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <School className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{institution.name}</h1>
                    <p className="text-gray-600">{institution.email}</p>
                    {institution.address && (
                      <p className="text-sm text-gray-500">{institution.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
