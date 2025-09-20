'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  UserPlus,
  UserMinus,
  GraduationCap,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Filter,
  Download
} from 'lucide-react'

export default function SubjectStudentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/institutions/1/careers/sistemas/subjects'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Materias
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Estudiantes de Programación I</h1>
              <p className="mt-1 text-sm text-gray-500">
                Ingeniería en Sistemas - 1er Año - Universidad Tecnológica Nacional
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Inscribir Estudiante
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Lista
            </Button>
          </div>
        </div>

        {/* Estadísticas de la materia */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Estudiantes Inscritos</p>
                  <p className="text-2xl font-semibold text-gray-900">45</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Aprobados</p>
                  <p className="text-2xl font-semibold text-gray-900">38</p>
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
                  <p className="text-sm font-medium text-gray-500">Promedio General</p>
                  <p className="text-2xl font-semibold text-gray-900">8.2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserMinus className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Desaprobados</p>
                  <p className="text-2xl font-semibold text-gray-900">7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Filtros y Búsqueda</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar estudiante por nombre o email..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                  />
                </div>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>Todos los estados</option>
                <option>Activos</option>
                <option>Aprobados</option>
                <option>Desaprobados</option>
                <option>En proceso</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>Ordenar por</option>
                <option>Nombre A-Z</option>
                <option>Nombre Z-A</option>
                <option>Promedio</option>
                <option>Fecha de inscripción</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de estudiantes */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Lista de Estudiantes</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Estudiante 1 */}
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-600">AL</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Ana López</h4>
                      <p className="text-sm text-gray-500">ana.lopez@utn.edu.ar</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">📅 Inscrito: 15/03/2024</span>
                        <span className="text-xs text-gray-400">📊 Promedio: 8.7</span>
                        <span className="text-xs text-gray-400">📚 Asistencia: 95%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aprobado
                    </span>
                    <Button variant="outline" size="sm">
                      Ver Calificaciones
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Dar de Baja
                    </Button>
                  </div>
                </div>
              </div>

              {/* Estudiante 2 */}
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-green-600">RM</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Roberto Martínez</h4>
                      <p className="text-sm text-gray-500">roberto.martinez@utn.edu.ar</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">📅 Inscrito: 18/03/2024</span>
                        <span className="text-xs text-gray-400">📊 Promedio: 7.9</span>
                        <span className="text-xs text-gray-400">📚 Asistencia: 88%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aprobado
                    </span>
                    <Button variant="outline" size="sm">
                      Ver Calificaciones
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Dar de Baja
                    </Button>
                  </div>
                </div>
              </div>

              {/* Estudiante 3 */}
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-purple-600">SF</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Sofia Fernández</h4>
                      <p className="text-sm text-gray-500">sofia.fernandez@utn.edu.ar</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">📅 Inscrito: 20/03/2024</span>
                        <span className="text-xs text-gray-400">📊 Promedio: 9.2</span>
                        <span className="text-xs text-gray-400">📚 Asistencia: 98%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aprobado
                    </span>
                    <Button variant="outline" size="sm">
                      Ver Calificaciones
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Dar de Baja
                    </Button>
                  </div>
                </div>
              </div>

              {/* Estudiante 4 */}
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-red-600">JG</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Juan García</h4>
                      <p className="text-sm text-gray-500">juan.garcia@utn.edu.ar</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">📅 Inscrito: 22/03/2024</span>
                        <span className="text-xs text-gray-400">📊 Promedio: 4.5</span>
                        <span className="text-xs text-gray-400">📚 Asistencia: 65%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Desaprobado
                    </span>
                    <Button variant="outline" size="sm">
                      Ver Calificaciones
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Dar de Baja
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
