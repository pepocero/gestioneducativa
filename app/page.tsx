'use client'

import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Shield, 
  BarChart3, 
  Smartphone, 
  Zap,
  GraduationCap,
  Award,
  Globe,
  Lock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Globe,
      title: "Multi-tenant",
      description: "Cada institución educativa tiene sus datos completamente aislados y seguros"
    },
    {
      icon: Users,
      title: "Sistema de Roles",
      description: "Administrador, Profesor y Estudiante con permisos específicos"
    },
    {
      icon: BookOpen,
      title: "Gestión Académica",
      description: "Carreras, materias, calificaciones y correlativas completas"
    },
    {
      icon: Zap,
      title: "Arquitectura Modular",
      description: "Sistema de plugins para extender funcionalidades"
    },
    {
      icon: BarChart3,
      title: "Dashboard Inteligente",
      description: "Estadísticas en tiempo real y reportes personalizados"
    },
    {
      icon: Smartphone,
      title: "Responsive",
      description: "Diseño optimizado para todos los dispositivos"
    }
  ]

  const benefits = [
    "Gestión completa de instituciones educativas",
    "Sistema de inscripciones automatizado",
    "Seguimiento de progreso académico",
    "Generación de reportes y certificados",
    "Comunicación interna integrada",
    "Seguridad robusta con RLS"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema Educativo</h1>
                <p className="text-sm text-gray-600">Gestión Académica Integral</p>
              </div>
            </div>
            <Link 
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Plataforma de <span className="text-blue-600">Gestión Educativa</span> Moderna
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Sistema integral multi-tenant diseñado para instituciones educativas que necesitan 
              gestionar eficientemente sus procesos académicos con tecnología de vanguardia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Comenzar Ahora</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="#features"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200"
              >
                Ver Características
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Características Principales
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para gestionar una institución educativa moderna
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir nuestro sistema?
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  Tecnología Avanzada
                </h4>
                <p className="text-gray-600 mb-6">
                  Construido con Next.js 14, Supabase y las mejores prácticas de desarrollo
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Seguro</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Lock className="h-4 w-4" />
                    <span>Privado</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4" />
                    <span>Rápido</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-4">
              🚀 Prueba el Sistema Ahora
            </h3>
            <p className="text-xl text-green-100 mb-6">
              Accede con el usuario demo y explora todas las funcionalidades
            </p>
            <div className="bg-white/20 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Credenciales de Demo</h4>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-green-100 text-sm mb-1">Email:</p>
                  <p className="text-white font-mono bg-black/20 px-3 py-2 rounded">demo@educacion.com</p>
                </div>
                <div>
                  <p className="text-green-100 text-sm mb-1">Contraseña:</p>
                  <p className="text-white font-mono bg-black/20 px-3 py-2 rounded">demo123456</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/login"
                className="bg-white hover:bg-gray-100 text-green-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200 inline-flex items-center justify-center space-x-2"
              >
                <span>Probar Demo</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/auth/register"
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            ¿Listo para transformar tu institución educativa?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Únete a las instituciones que ya están usando nuestro sistema
          </p>
          <Link 
            href="/auth/login"
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <span>Acceder al Sistema</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Sistema Educativo</span>
              </div>
              <p className="text-gray-400">
                Plataforma moderna para gestión educativa multi-tenant
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Características</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Multi-tenant</li>
                <li>Sistema de Roles</li>
                <li>Dashboard Inteligente</li>
                <li>Responsive Design</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Acceso</h4>
              <div className="space-y-2">
                <Link 
                  href="/auth/login" 
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Sistema de Gestión Educativa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
