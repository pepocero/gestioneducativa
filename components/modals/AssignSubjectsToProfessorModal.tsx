'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { professorSubjectService, subjectService } from '@/lib/supabase-service'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { toast } from 'react-hot-toast'
import { 
  BookOpen, 
  GraduationCap, 
  X, 
  Plus,
  Trash2,
  Search,
  Check,
  AlertCircle
} from 'lucide-react'

interface AssignSubjectsToProfessorModalProps {
  professor: any
  onClose: () => void
  onSave: () => void
}

export default function AssignSubjectsToProfessorModal({ 
  professor, 
  onClose, 
  onSave 
}: AssignSubjectsToProfessorModalProps) {
  const { institutionId } = useCurrentUser()
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([])
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [assigningSubject, setAssigningSubject] = useState<string | null>(null)
  const [unassigningSubject, setUnassigningSubject] = useState<string | null>(null)

  useEffect(() => {
    if (professor && institutionId) {
      loadData()
    }
  }, [professor, institutionId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar todas las materias de la institución
      const allSubjects = await subjectService.getAll(institutionId)
      
      // Cargar materias ya asignadas al profesor
      const professorAssignments = await professorSubjectService.getByProfessor(professor.id)
      
      // Filtrar materias disponibles (no asignadas)
      const assignedSubjectIds = professorAssignments.map((assignment: any) => assignment.subject_id)
      const available = allSubjects.filter((subject: any) => !assignedSubjectIds.includes(subject.id))
      
      setAvailableSubjects(available)
      setAssignedSubjects(professorAssignments)
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando materias')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignSubject = async (subjectId: string) => {
    try {
      setAssigningSubject(subjectId)
      
      await professorSubjectService.assign({
        professor_id: professor.id,
        subject_id: subjectId
      })
      
      toast.success('Materia asignada correctamente')
      await loadData() // Recargar datos
    } catch (error) {
      console.error('Error asignando materia:', error)
      toast.error('Error al asignar la materia')
    } finally {
      setAssigningSubject(null)
    }
  }

  const handleUnassignSubject = async (subjectId: string) => {
    try {
      setUnassigningSubject(subjectId)
      
      await professorSubjectService.unassign(professor.id, subjectId)
      
      toast.success('Materia desasignada correctamente')
      await loadData() // Recargar datos
    } catch (error) {
      console.error('Error desasignando materia:', error)
      toast.error('Error al desasignar la materia')
    } finally {
      setUnassigningSubject(null)
    }
  }

  const filteredAvailableSubjects = availableSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Asignar Materias</h2>
                <p className="text-sm text-gray-500">
                  Profesor: {professor.first_name} {professor.last_name}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando materias...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Materias Asignadas */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-600" />
                    Materias Asignadas ({assignedSubjects.length})
                  </h3>
                </CardHeader>
                <CardContent>
                  {assignedSubjects.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No tiene materias asignadas</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedSubjects.map((assignment: any) => (
                        <div 
                          key={assignment.id} 
                          className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <BookOpen className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {assignment.subjects_new?.name || assignment.subjects?.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Código: {assignment.subjects_new?.code || assignment.subjects?.code} • 
                                Créditos: {assignment.subjects_new?.credits || assignment.subjects?.credits}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassignSubject(assignment.subject_id)}
                            disabled={unassigningSubject === assignment.subject_id}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            {unassigningSubject === assignment.subject_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Materias Disponibles */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-blue-600" />
                    Materias Disponibles ({filteredAvailableSubjects.length})
                  </h3>
                  {/* Búsqueda */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar materias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredAvailableSubjects.length === 0 ? (
                    <div className="text-center py-8">
                      {searchTerm ? (
                        <>
                          <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No se encontraron materias</p>
                          <p className="text-sm text-gray-400">Intenta con otros términos de búsqueda</p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No hay materias disponibles</p>
                          <p className="text-sm text-gray-400">
                            Todas las materias ya están asignadas a este profesor
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredAvailableSubjects.map((subject: any) => (
                        <div 
                          key={subject.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{subject.name}</h4>
                              <p className="text-sm text-gray-500">
                                Código: {subject.code} • Créditos: {subject.credits} • 
                                Horas/sem: {subject.hours_per_week}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignSubject(subject.id)}
                            disabled={assigningSubject === subject.id}
                            className="text-green-600 hover:text-green-700 hover:border-green-300"
                          >
                            {assigningSubject === subject.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={() => { onSave(); onClose(); }}>
              <Check className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
