'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { studentService, careerService } from '@/lib/supabase-service'
import { useBasicSecurityForm } from '@/lib/security'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Save, 
  X,
  Upload,
  CreditCard
} from 'lucide-react'

interface StudentFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  birthDate: string
  dni: string
  emergencyContact: string
  emergencyPhone: string
  notes: string
}

interface EditStudentFormProps {
  student: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    address: string
    birth_date: string
    dni: string
    emergency_contact: string
    emergency_phone: string
    notes: string
    career_id: string
  }
  careers: any[]
  onClose: () => void
  onSave: () => void
}

export default function EditStudentForm({ student, careers, onClose, onSave }: EditStudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: student.first_name,
    lastName: student.last_name,
    email: student.email,
    phone: student.phone,
    address: student.address,
    birthDate: student.birth_date,
    dni: student.dni,
    emergencyContact: student.emergency_contact,
    emergencyPhone: student.emergency_phone,
    notes: student.notes
  })

  const [errors, setErrors] = useState<Partial<StudentFormData>>({})
  const [loading, setLoading] = useState(false)

  // Hook de seguridad para el formulario
  const { processFormData, isProcessing } = useBasicSecurityForm<StudentFormData>('forms')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof StudentFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Procesar datos con seguridad
      const fieldMappings = {
        firstName: 'name',
        lastName: 'name',
        email: 'email',
        phone: 'phone',
        address: 'text',
        birthDate: 'date',
        dni: 'text',
        emergencyContact: 'name',
        emergencyPhone: 'phone',
        notes: 'text'
      }

      const securityResult = await processFormData(formData, fieldMappings)

      // Verificar si hay errores de seguridad
      if (!securityResult.isValid) {
        setErrors(securityResult.errors)
        
        // Mostrar errores específicos
        if (securityResult.errors._rateLimit) {
          toast.error(securityResult.errors._rateLimit[0])
        } else if (securityResult.errors._system) {
          toast.error(securityResult.errors._system[0])
        } else {
          // Mostrar errores de campos específicos
          const firstError = Object.values(securityResult.errors)[0]?.[0]
          if (firstError) {
            toast.error(firstError)
          }
        }
        return
      }

      // Validar campos requeridos
      const newErrors: Partial<StudentFormData> = {}
      if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido'
      if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido'
      if (!formData.email.trim()) newErrors.email = 'El email es requerido'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El email no es válido'
      if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido'
      if (!formData.dni.trim()) newErrors.dni = 'El DNI es requerido'
      if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // Usar datos sanitizados
      const { sanitizedData } = securityResult

      // Actualizar estudiante
      const studentData = {
        first_name: sanitizedData.firstName,
        last_name: sanitizedData.lastName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        dni: sanitizedData.dni,
        birth_date: sanitizedData.birthDate,
        address: sanitizedData.address,
        emergency_contact: sanitizedData.emergencyContact,
        emergency_phone: sanitizedData.emergencyPhone,
        notes: sanitizedData.notes
      }

      await studentService.update(student.id, studentData)
      console.log('Estudiante actualizado:', studentData)
      
      toast.success('Estudiante actualizado exitosamente')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error al actualizar estudiante:', error)
      toast.error('Error al actualizar el estudiante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Estudiante</h2>
                <p className="text-sm text-gray-500">Actualiza la información del estudiante</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Información Personal
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingresa el nombre"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingresa el apellido"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="correo@ejemplo.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123456789"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DNI *
                    </label>
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.dni ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12345678"
                    />
                    {errors.dni && (
                      <p className="text-red-500 text-xs mt-1">{errors.dni}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.birthDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.birthDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  Información de Contacto
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingresa la dirección completa"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contacto de Emergencia
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nombre del contacto"
                      />
                      {errors.emergencyContact && (
                        <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono de Emergencia
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="987654321"
                      />
                      {errors.emergencyPhone && (
                        <p className="text-red-500 text-xs mt-1">{errors.emergencyPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-purple-600" />
                  Notas Adicionales
                </h3>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.notes ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Información adicional sobre el estudiante..."
                  />
                  {errors.notes && (
                    <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Actualizando...' : 'Actualizar Estudiante'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
