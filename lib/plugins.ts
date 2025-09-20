// Sistema modular de plugins para el Sistema de Gestión Educativa

import { useState, useEffect } from 'react'

export interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  enabled: boolean
  dependencies?: string[]
  routes?: PluginRoute[]
  components?: PluginComponent[]
  hooks?: PluginHook[]
  permissions?: PluginPermission[]
}

export interface PluginRoute {
  path: string
  component: React.ComponentType
  title: string
  icon?: React.ComponentType
  roles?: string[]
}

export interface PluginComponent {
  id: string
  component: React.ComponentType
  placement: 'dashboard' | 'sidebar' | 'header' | 'footer'
  order?: number
  roles?: string[]
}

export interface PluginHook {
  name: string
  hook: Function
  dependencies?: string[]
}

export interface PluginPermission {
  resource: string
  actions: string[]
  roles?: string[]
}

// Registry de plugins
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()
  private routes: Map<string, PluginRoute> = new Map()
  private components: Map<string, PluginComponent> = new Map()
  private hooks: Map<string, PluginHook> = new Map()

  register(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin)
    
    // Registrar rutas
    if (plugin.routes) {
      plugin.routes.forEach(route => {
        this.routes.set(route.path, route)
      })
    }
    
    // Registrar componentes
    if (plugin.components) {
      plugin.components.forEach(component => {
        this.components.set(component.id, component)
      })
    }
    
    // Registrar hooks
    if (plugin.hooks) {
      plugin.hooks.forEach(hook => {
        this.hooks.set(hook.name, hook)
      })
    }
  }

  unregister(pluginId: string) {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return

    // Remover rutas
    if (plugin.routes) {
      plugin.routes.forEach(route => {
        this.routes.delete(route.path)
      })
    }
    
    // Remover componentes
    if (plugin.components) {
      plugin.components.forEach(component => {
        this.components.delete(component.id)
      })
    }
    
    // Remover hooks
    if (plugin.hooks) {
      plugin.hooks.forEach(hook => {
        this.hooks.delete(hook.name)
      })
    }

    this.plugins.delete(pluginId)
  }

  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id)
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(plugin => plugin.enabled)
  }

  getRoutes(): PluginRoute[] {
    return Array.from(this.routes.values())
  }

  getComponents(placement?: string): PluginComponent[] {
    const components = Array.from(this.components.values())
    if (placement) {
      return components.filter(component => component.placement === placement)
    }
    return components.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  getHook(name: string): PluginHook | undefined {
    return this.hooks.get(name)
  }

  enablePlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.enabled = true
    }
  }

  disablePlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.enabled = false
    }
  }

  checkDependencies(plugin: Plugin): boolean {
    if (!plugin.dependencies) return true
    
    return plugin.dependencies.every(depId => {
      const depPlugin = this.plugins.get(depId)
      return depPlugin && depPlugin.enabled
    })
  }
}

// Instancia global del registry
export const pluginRegistry = new PluginRegistry()

// Hook para usar plugins
export function usePlugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPlugins(pluginRegistry.getAllPlugins())
    setLoading(false)
  }, [])

  const enablePlugin = (pluginId: string) => {
    pluginRegistry.enablePlugin(pluginId)
    setPlugins(pluginRegistry.getAllPlugins())
  }

  const disablePlugin = (pluginId: string) => {
    pluginRegistry.disablePlugin(pluginId)
    setPlugins(pluginRegistry.getAllPlugins())
  }

  const registerPlugin = (plugin: Plugin) => {
    pluginRegistry.register(plugin)
    setPlugins(pluginRegistry.getAllPlugins())
  }

  const unregisterPlugin = (pluginId: string) => {
    pluginRegistry.unregister(pluginId)
    setPlugins(pluginRegistry.getAllPlugins())
  }

  return {
    plugins,
    loading,
    enablePlugin,
    disablePlugin,
    registerPlugin,
    unregisterPlugin,
    getRoutes: () => pluginRegistry.getRoutes(),
    getComponents: (placement?: string) => pluginRegistry.getComponents(placement),
    getHook: (name: string) => pluginRegistry.getHook(name),
  }
}

// Plugin base para crear nuevos plugins
export abstract class BasePlugin implements Plugin {
  abstract id: string
  abstract name: string
  abstract version: string
  abstract description: string
  abstract author: string
  enabled: boolean = true
  dependencies?: string[]
  routes?: PluginRoute[]
  components?: PluginComponent[]
  hooks?: PluginHook[]
  permissions?: PluginPermission[]

  abstract initialize(): void
  abstract destroy(): void
}

// Ejemplo de plugin: Gestión de Asistencias
export class AttendancePlugin extends BasePlugin {
  id = 'attendance'
  name = 'Gestión de Asistencias'
  version = '1.0.0'
  description = 'Plugin para gestionar asistencias de estudiantes'
  author = 'Sistema Educativo'

  routes = [
    // TODO: Implement attendance module
    // {
    //   path: '/attendance',
    //   component: () => import('@/modules/attendance/AttendancePage'),
    //   title: 'Asistencias',
    //   icon: () => import('@/components/icons/CalendarIcon'),
    //   roles: ['admin', 'professor']
    // }
  ]

  components = [
    // TODO: Implement attendance widget
    // {
    //   id: 'attendance-dashboard-widget',
    //   component: () => import('@/modules/attendance/AttendanceWidget'),
    //   placement: 'dashboard',
    //   order: 1,
    //   roles: ['admin', 'professor']
    // }
  ]

  initialize() {
    console.log('Attendance plugin initialized')
  }

  destroy() {
    console.log('Attendance plugin destroyed')
  }
}

// Ejemplo de plugin: Generación de Certificados
export class CertificatesPlugin extends BasePlugin {
  id = 'certificates'
  name = 'Generación de Certificados'
  version = '1.0.0'
  description = 'Plugin para generar certificados y analíticos en PDF'
  author = 'Sistema Educativo'

  routes = [
    // TODO: Implement certificates module
    // {
    //   path: '/certificates',
    //   component: () => import('@/modules/certificates/CertificatesPage'),
    //   title: 'Certificados',
    //   icon: () => import('@/components/icons/DocumentIcon'),
    //   roles: ['admin', 'student']
    // }
  ]

  components = [
    // TODO: Implement certificates menu
    // {
    //   id: 'certificates-student-menu',
    //   component: () => import('@/modules/certificates/CertificateMenu'),
    //   placement: 'sidebar',
    //   order: 2,
    //   roles: ['student']
    // }
  ]

  initialize() {
    console.log('Certificates plugin initialized')
  }

  destroy() {
    console.log('Certificates plugin destroyed')
  }
}

// Ejemplo de plugin: Comunicación Interna
export class MessagingPlugin extends BasePlugin {
  id = 'messaging'
  name = 'Comunicación Interna'
  version = '1.0.0'
  description = 'Sistema de mensajería entre alumnos, profesores y administración'
  author = 'Sistema Educativo'

  routes = [
    // TODO: Implement messaging module
    // {
    //   path: '/messages',
    //   component: () => import('@/modules/messaging/MessagesPage'),
    //   title: 'Mensajes',
    //   icon: () => import('@/components/icons/MessageIcon'),
    //   roles: ['admin', 'professor', 'student']
    // }
  ]

  components = [
    // TODO: Implement messaging notification
    // {
    //   id: 'messaging-notification',
    //   component: () => import('@/modules/messaging/MessageNotification'),
    //   placement: 'header',
    //   order: 1,
    //   roles: ['admin', 'professor', 'student']
    // }
  ]

  initialize() {
    console.log('Messaging plugin initialized')
  }

  destroy() {
    console.log('Messaging plugin destroyed')
  }
}

// Función para inicializar plugins por defecto
export function initializeDefaultPlugins() {
  const defaultPlugins = [
    new AttendancePlugin(),
    new CertificatesPlugin(),
    new MessagingPlugin(),
  ]

  defaultPlugins.forEach(plugin => {
    pluginRegistry.register(plugin)
    plugin.initialize()
  })
}
