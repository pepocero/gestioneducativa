'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  GraduationCap, 
  Clock, 
  Users, 
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Settings
} from 'lucide-react'

export default function InstitutionCareersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Institución
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carreras de la Institución</h1>
              <p className="mt-1 text-sm text-gray-500">
                Universidad Tecnológica Nacional - Facultad Regional Buenos Aires
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Carrera
          </Button>
        </div>

        {/* Estadísticas de carreras */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Carreras</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Estudiantes Inscritos</p>
                  <p className="text-2xl font-semibold text-gray-900">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Materias Totales</p>
                  <p className="text-2xl font-semibold text-gray-900">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Duración Promedio</p>
                  <p className="text-2xl font-semibold text-gray-900">5 años</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de carreras */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Carreras de la Institución</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Carrera 1 */}
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Ingeniería en Sistemas</h4>
                      <p className="text-sm text-gray-500">Facultad de Ingeniería</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">⏱️ 5 años</span>
                        <span className="text-xs text-gray-400">👥 456 estudiantes</span>
                        <span className="text-xs text-gray-400">📚 32 materias</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activa
                    </span>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers/sistemas'}>
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Carrera 2 */}
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Ingeniería Industrial</h4>
                      <p className="text-sm text-gray-500">Facultad de Ingeniería</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">⏱️ 5 años</span>
                        <span className="text-xs text-gray-400">👥 234 estudiantes</span>
                        <span className="text-xs text-gray-400">📚 28 materias</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activa
                    </span>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers/industrial'}>
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Carrera 3 */}
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Ingeniería Química</h4>
                      <p className="text-sm text-gray-500">Facultad de Ingeniería</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">⏱️ 5 años</span>
                        <span className="text-xs text-gray-400">👥 189 estudiantes</span>
                        <span className="text-xs text-gray-400">📚 30 materias</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activa
                    </span>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers/quimica'}>
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Carrera 4 */}
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Tecnicatura en Programación</h4>
                      <p className="text-sm text-gray-500">Facultad de Tecnología</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">⏱️ 3 años</span>
                        <span className="text-xs text-gray-400">👥 156 estudiantes</span>
                        <span className="text-xs text-gray-400">📚 24 materias</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      En Desarrollo
                    </span>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers/programacion'}>
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
