'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useBasicSecurityForm } from '@/lib/security/use-security-form'
import { SecurityEventType } from '@/lib/security/security-logger'

// Componente Modal para confirmación de email
function EmailConfirmationModal({ isOpen, onClose, email }: { isOpen: boolean, onClose: () => void, email: string }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Email no confirmado
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Tu cuenta <strong>{email}</strong> aún no ha sido confirmada. 
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación 
            que te enviamos por email.
          </p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Si no recibiste el email, puedes:
          </p>
          <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
            <li>Revisar tu carpeta de spam</li>
            <li>Esperar unos minutos y volver a intentar</li>
            <li>Registrarte nuevamente si es necesario</li>
          </ul>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const { signIn } = useAuth()
  const router = useRouter()
  
  // Hook de seguridad para el formulario de login
  const { processFormData, isProcessing, getRateLimitInfo } = useBasicSecurityForm<{
    email: string
    password: string
  }>('login')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormErrors({})

    try {
      // Procesar datos con seguridad
      const formData = { email, password }
      const fieldMappings = {
        email: 'email',
        password: 'password'
      }

      const securityResult = await processFormData(formData, fieldMappings)

      // Verificar si hay errores de seguridad
      if (!securityResult.isValid) {
        setFormErrors(securityResult.errors)
        
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

      // Usar datos sanitizados
      const { sanitizedData } = securityResult
      console.log('🔐 Intentando hacer login con datos sanitizados...')
      
      const { error } = await signIn(sanitizedData.email, sanitizedData.password)
      
      if (error) {
        console.error('❌ Error en login:', error)
        
        // Verificar si es error de email no confirmado
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          setShowEmailModal(true)
        } else {
          toast.error(error.message)
        }
      } else {
        console.log('✅ Login exitoso, redirigiendo...')
        toast.success('Inicio de sesión exitoso')
        
        // Redirección directa sin verificar middleware
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error)
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sistema de Gestión Educativa
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dirección de email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password[0]}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || isProcessing}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || isProcessing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>

            <div className="text-center space-y-3">
              <Link
                href="/auth/register"
                className="font-medium text-primary-600 hover:text-primary-500 block"
              >
                ¿No tienes cuenta? Regístrate aquí
              </Link>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-1"
              >
                <span>←</span>
                <span>Volver al inicio</span>
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de email */}
      <EmailConfirmationModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        email={email}
      />
    </>
  )
}