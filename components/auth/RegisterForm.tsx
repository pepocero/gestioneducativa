'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { institutionService } from '@/lib/supabase-service'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    institutionName: '',
    institutionEmail: '',
    institutionPhone: '',
    institutionAddress: '',
    role: 'admin' as 'admin' | 'professor' | 'student'
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      // PASO 1: Crear institución PRIMERO usando función SQL
      console.log('🏫 Creando institución...')
      const { data: institutionResult, error: institutionError } = await supabase.rpc('complete_institution_registration', {
        p_institution_name: formData.institutionName,
        p_institution_email: formData.institutionEmail,
        p_institution_phone: formData.institutionPhone,
        p_institution_address: formData.institutionAddress,
        p_user_email: formData.email,
        p_user_first_name: formData.firstName,
        p_user_last_name: formData.lastName,
        p_user_phone: formData.phone,
        p_user_password: formData.password
      })

      if (institutionError) {
        console.error('❌ Error creando institución:', institutionError)
        toast.error('Error al crear institución: ' + institutionError.message)
        setLoading(false)
        return
      }

      if (!institutionResult.success) {
        toast.error(institutionResult.error)
        setLoading(false)
        return
      }

      console.log('✅ Institución creada:', institutionResult.institution_id)

      // PASO 2: Registrar usuario en Supabase Auth
      console.log('👤 Registrando usuario en Auth...')
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        role: 'admin',
        institution_id: institutionResult.institution_id
      }

      const { error: authError } = await signUp(formData.email, formData.password, userData)
      
      if (authError) {
        console.error('❌ Error registrando usuario:', authError)
        
        // Si falla el registro del usuario, eliminar la institución creada
        try {
          console.log('🧹 Eliminando institución huérfana...')
          await supabase
            .from('institutions')
            .delete()
            .eq('id', institutionResult.institution_id)
          console.log('✅ Institución eliminada')
        } catch (cleanupError) {
          console.error('❌ Error eliminando institución:', cleanupError)
        }
        
        toast.error('Error al registrar usuario: ' + authError.message)
        setLoading(false)
        return
      }

      console.log('✅ Usuario registrado en Auth')

      // PASO 3: Vincular usuario a institución
      setTimeout(async () => {
        try {
          console.log('🔗 Vinculando usuario a institución...')
          const { data: linkResult, error: linkError } = await supabase.rpc('link_user_after_auth_registration', {
            p_user_email: formData.email,
            p_institution_id: institutionResult.institution_id
          })

          if (linkError) {
            console.error('❌ Error vinculando usuario:', linkError)
            toast.error('Usuario registrado pero error al vincular con institución')
          } else if (linkResult.success) {
            console.log('✅ Usuario vinculado exitosamente')
            toast.success('Institución y usuario creados exitosamente')
          } else {
            console.error('❌ Error en vinculación:', linkResult.error)
            toast.error('Usuario registrado pero error al vincular: ' + linkResult.error)
          }
          
          // Redirigir al dashboard
          router.push('/dashboard')
        } catch (linkError) {
          console.error('❌ Error inesperado en vinculación:', linkError)
          toast.error('Error inesperado al vincular usuario')
          router.push('/dashboard')
        }
      }, 2000)

    } catch (error) {
      console.error('❌ Error inesperado:', error)
      toast.error('Error inesperado durante el registro')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro de Institución
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestión Educativa
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos de la Institución */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Datos de la Institución</h3>
              
              <div>
                <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700">
                  Nombre de la Institución
                </label>
                <input
                  id="institutionName"
                  name="institutionName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Ej: Universidad Tecnológica Nacional"
                  value={formData.institutionName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="institutionEmail" className="block text-sm font-medium text-gray-700">
                  Email de la Institución
                </label>
                <input
                  id="institutionEmail"
                  name="institutionEmail"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="info@institucion.edu"
                  value={formData.institutionEmail}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="institutionPhone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  id="institutionPhone"
                  name="institutionPhone"
                  type="tel"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="+54-11-1234-5678"
                  value={formData.institutionPhone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="institutionAddress" className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <textarea
                  id="institutionAddress"
                  name="institutionAddress"
                  rows={3}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Dirección completa de la institución"
                  value={formData.institutionAddress}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Datos del Usuario Administrador */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Datos del Administrador</h3>
              
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Nombre"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="admin@institucion.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="+54-11-1234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Repetir contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar Institución'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
