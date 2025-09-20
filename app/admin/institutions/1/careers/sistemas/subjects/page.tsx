'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BookOpen, 
  Clock, 
  Users, 
  UserCheck,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Settings,
  Calendar
} from 'lucide-react'

export default function CareerSubjectsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Carreras
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Materias de Ingeniería en Sistemas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Universidad Tecnológica Nacional - Facultad Regional Buenos Aires
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Materia
          </Button>
        </div>

        {/* Estadísticas de materias */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Materias</p>
                  <p className="text-2xl font-semibold text-gray-900">32</p>
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
                  <p className="text-2xl font-semibold text-gray-900">456</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Profesores Asignados</p>
                  <p className="text-2xl font-semibold text-gray-900">18</p>
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
                  <p className="text-sm font-medium text-gray-500">Horas Totales</p>
                  <p className="text-2xl font-semibold text-gray-900">192</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros por año */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Filtrar por Año</h3>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Todos</Button>
              <Button variant="outline" size="sm">1er Año</Button>
              <Button variant="outline" size="sm">2do Año</Button>
              <Button variant="outline" size="sm">3er Año</Button>
              <Button variant="outline" size="sm">4to Año</Button>
              <Button variant="outline" size="sm">5to Año</Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de materias por año */}
        <div className="space-y-6">
          {/* 1er Año */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">1er Año</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Materia 1 */}
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Programación I</h4>
                        <p className="text-sm text-gray-500">Fundamentos de programación</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">⏱️ 6 horas/semana</span>
                          <span className="text-xs text-gray-400">👥 45 estudiantes</span>
                          <span className="text-xs text-gray-400">👨‍🏫 Prof. María González</span>
                          <span className="text-xs text-gray-400">📅 Cuatrimestral</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activa
                      </span>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers/sistemas/subjects/programacion-1'}>
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

                {/* Materia 2 */}
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Análisis Matemático I</h4>
                        <p className="text-sm text-gray-500">Cálculo diferencial e integral</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">⏱️ 8 horas/semana</span>
                          <span className="text-xs text-gray-400">👥 52 estudiantes</span>
                          <span className="text-xs text-gray-400">👨‍🏫 Prof. Carlos López</span>
                          <span className="text-xs text-gray-400">📅 Anual</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activa
                      </span>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers/sistemas/subjects/matematicas-1'}>
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

          {/* 2do Año */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">2do Año</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Materia 1 */}
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Programación II</h4>
                        <p className="text-sm text-gray-500">Programación orientada a objetos</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">⏱️ 6 horas/semana</span>
                          <span className="text-xs text-gray-400">👥 42 estudiantes</span>
                          <span className="text-xs text-gray-400">👨‍🏫 Prof. Ana Rodríguez</span>
                          <span className="text-xs text-gray-400">📅 Cuatrimestral</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activa
                      </span>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers/sistemas/subjects/programacion-2'}>
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

                {/* Materia 2 */}
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Base de Datos I</h4>
                        <p className="text-sm text-gray-500">Fundamentos de bases de datos</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">⏱️ 4 horas/semana</span>
                          <span className="text-xs text-gray-400">👥 38 estudiantes</span>
                          <span className="text-xs text-gray-400">👨‍🏫 Prof. Roberto Silva</span>
                          <span className="text-xs text-gray-400">📅 Cuatrimestral</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activa
                      </span>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers/sistemas/subjects/bd-1'}>
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
      </div>
    </DashboardLayout>
  )
}
