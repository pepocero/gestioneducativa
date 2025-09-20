# 📚 Documentación Completa - Sistema de Gestión Educativa

## 📋 Índice
1. [Introducción](#introducción)
2. [Instalación en Producción](#instalación-en-producción)
3. [Configuración de Supabase](#configuración-de-supabase)
4. [Configuración del Sistema](#configuración-del-sistema)
5. [Funcionalidades por Módulo](#funcionalidades-por-módulo)
6. [Guía de Usuario](#guía-de-usuario)
7. [Administración del Sistema](#administración-del-sistema)
8. [Desarrollo y Personalización](#desarrollo-y-personalización)
9. [Solución de Problemas](#solución-de-problemas)
10. [FAQ](#faq)

---

## 🎯 Introducción

El **Sistema de Gestión Educativa** es una plataforma web moderna y escalable diseñada para instituciones educativas que necesitan gestionar de manera eficiente sus procesos académicos. El sistema está construido con tecnologías modernas y ofrece una arquitectura modular que permite personalización y extensión según las necesidades específicas de cada institución.

### Características Principales:
- **Multi-tenant**: Cada institución tiene sus datos completamente aislados
- **Roles diferenciados**: Administrador, Profesor y Estudiante con permisos específicos
- **Gestión académica completa**: Carreras, materias, calificaciones, correlativas
- **Arquitectura modular**: Sistema de plugins para funcionalidades adicionales
- **Interfaz moderna**: Diseño responsive y fácil de usar
- **Seguridad robusta**: Autenticación y autorización con Supabase

---

## 🚀 Instalación en Producción

### Requisitos Previos

#### Servidor de Producción:
- **Sistema Operativo**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **RAM**: Mínimo 4GB, recomendado 8GB+
- **Almacenamiento**: Mínimo 20GB de espacio libre
- **CPU**: Mínimo 2 cores, recomendado 4+ cores
- **Red**: Conexión estable a internet

#### Software Requerido:
- **Node.js**: Versión 18.0 o superior
- **npm**: Versión 8.0 o superior (incluido con Node.js)
- **Git**: Para clonar el repositorio
- **Nginx**: Para servir la aplicación (opcional pero recomendado)

### Paso 1: Preparación del Servidor

#### Instalar Node.js:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verificar instalación
node --version
npm --version
```

#### Instalar Git:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install git

# CentOS/RHEL
sudo yum install git

# Verificar instalación
git --version
```

### Paso 2: Clonar y Configurar el Proyecto

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/educacion
sudo chown $USER:$USER /var/www/educacion
cd /var/www/educacion

# Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-gestion-educativa.git .

# Instalar dependencias
npm install

# Construir la aplicación para producción
npm run build
```

### Paso 3: Configurar Variables de Entorno

Crear archivo de configuración de producción:
```bash
sudo nano /var/www/educacion/.env.production
```

Contenido del archivo:
```env
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=Tu Institución Educativa
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Configuración de producción
NODE_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Paso 4: Configurar Nginx (Recomendado)

Instalar Nginx:
```bash
# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

Crear configuración de sitio:
```bash
sudo nano /etc/nginx/sites-available/educacion
```

Contenido de la configuración:
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar el sitio:
```bash
sudo ln -s /etc/nginx/sites-available/educacion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Paso 5: Configurar SSL con Let's Encrypt

Instalar Certbot:
```bash
# Ubuntu/Debian
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

Obtener certificado SSL:
```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### Paso 6: Configurar Servicio del Sistema

Crear archivo de servicio:
```bash
sudo nano /etc/systemd/system/educacion.service
```

Contenido del servicio:
```ini
[Unit]
Description=Sistema de Gestión Educativa
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/educacion
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activar y iniciar el servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable educacion
sudo systemctl start educacion
sudo systemctl status educacion
```

---

## 🗄️ Configuración de Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear cuenta o iniciar sesión
3. Hacer clic en "New Project"
4. Elegir organización y completar datos del proyecto
5. Esperar a que se complete la configuración

### Paso 2: Configurar Base de Datos

#### Ejecutar Scripts SQL:

1. **Ir al SQL Editor** en el dashboard de Supabase
2. **Ejecutar en orden**:
   - `database/schema.sql` - Crear estructura de tablas
   - `database/rls-policies.sql` - Configurar políticas de seguridad
   - `database/sample-data.sql` - Datos de ejemplo (opcional)

#### Verificar Configuración:

```sql
-- Verificar que las tablas se crearon correctamente
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Paso 3: Configurar Autenticación

1. **Ir a Authentication > Settings**
2. **Configurar URL del sitio**:
   - Site URL: `https://tu-dominio.com`
   - Redirect URLs: `https://tu-dominio.com/auth/callback`

3. **Configurar proveedores** (opcional):
   - Email: Habilitado por defecto
   - Google, GitHub, etc.: Configurar según necesidades

### Paso 4: Configurar Storage (Opcional)

1. **Ir a Storage**
2. **Crear bucket** para archivos de la institución
3. **Configurar políticas** de acceso según roles

---

## ⚙️ Configuración del Sistema

### Variables de Entorno Principales

```env
# Supabase (Obligatorio)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima

# Aplicación (Obligatorio)
NEXT_PUBLIC_APP_NAME=Nombre de tu Institución
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Opcional
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Descripción de la institución
```

### Configuración de Roles

El sistema maneja tres roles principales:

#### Administrador:
- Acceso completo al sistema
- Gestión de usuarios, carreras, materias
- Configuración de la institución
- Reportes y estadísticas

#### Profesor:
- Ver materias asignadas
- Gestionar calificaciones
- Ver lista de estudiantes
- Subir recursos educativos

#### Estudiante:
- Ver calificaciones propias
- Consultar estado académico
- Acceder a recursos
- Realizar solicitudes

---

## 🎯 Funcionalidades por Módulo

### 📊 Dashboard Principal

**Acceso**: Todos los usuarios autenticados

**Funcionalidades**:
- Resumen de estadísticas generales
- Actividad reciente del sistema
- Próximos eventos y fechas importantes
- Acceso rápido a funciones principales
- Notificaciones del sistema

**Para Administradores**:
- Estadísticas completas de la institución
- Número de estudiantes, profesores, carreras
- Rendimiento académico general
- Alertas del sistema

**Para Profesores**:
- Materias asignadas
- Estudiantes por materia
- Calificaciones pendientes
- Próximas evaluaciones

**Para Estudiantes**:
- Calificaciones recientes
- Estado académico actual
- Materias disponibles para cursar
- Próximas fechas importantes

### 👥 Gestión de Usuarios

**Acceso**: Solo Administradores

**Funcionalidades**:
- **Crear usuarios**: Registrar nuevos profesores y estudiantes
- **Editar perfiles**: Modificar información personal
- **Asignar roles**: Cambiar roles de usuarios
- **Activar/Desactivar**: Controlar acceso al sistema
- **Búsqueda y filtros**: Encontrar usuarios rápidamente

**Proceso de Registro**:
1. Administrador crea usuario con email y datos básicos
2. Sistema envía email de invitación
3. Usuario completa registro con contraseña
4. Usuario accede al sistema según su rol

### 🎓 Gestión Académica

#### Carreras
**Funcionalidades**:
- Crear nuevas carreras
- Definir duración en años
- Agregar descripción y objetivos
- Activar/desactivar carreras
- Ver estadísticas por carrera

#### Ciclos Académicos
**Funcionalidades**:
- Crear años/ciclos dentro de carreras
- Definir orden y secuencia
- Asociar materias a ciclos
- Configurar requisitos de aprobación

#### Materias
**Funcionalidades**:
- Crear materias con código único
- Definir créditos y horas semanales
- Establecer correlatividades
- Asignar profesores
- Configurar tipos de evaluación

#### Correlatividades
**Funcionalidades**:
- Definir qué materias son requisito
- Configurar orden de cursado
- Validar inscripciones automáticamente
- Mostrar materias disponibles por estudiante

### 📝 Sistema de Calificaciones

**Acceso**: Profesores (para sus materias) y Administradores (todas)

**Funcionalidades**:
- **Registrar calificaciones**: Por tipo (examen, trabajo práctico, proyecto)
- **Calcular promedios**: Automático por materia
- **Historial completo**: Todas las calificaciones del estudiante
- **Exportar reportes**: En formato PDF o Excel
- **Notificaciones**: A estudiantes sobre nuevas calificaciones

**Tipos de Evaluación**:
- Exámenes parciales y finales
- Trabajos prácticos
- Proyectos
- Evaluaciones continuas

### 👨‍🎓 Gestión de Estudiantes

**Funcionalidades**:
- **Inscripción**: Registrar estudiantes en carreras
- **Número de estudiante**: Generación automática
- **Estado académico**: Activo, inactivo, egresado
- **Historial académico**: Materias cursadas y aprobadas
- **Certificados**: Generación de analíticos

### 📚 Portal del Profesor

**Funcionalidades Específicas**:
- **Mis Materias**: Lista de materias asignadas
- **Lista de Estudiantes**: Por cada materia
- **Registro de Calificaciones**: Interface simplificada
- **Recursos**: Subir materiales de estudio
- **Comunicación**: Mensajes a estudiantes

### 🎒 Portal del Estudiante

**Funcionalidades Específicas**:
- **Mis Calificaciones**: Ver todas las calificaciones
- **Estado Académico**: Materias aprobadas y pendientes
- **Materias Disponibles**: Según correlativas cumplidas
- **Recursos**: Acceso a materiales de estudio
- **Solicitudes**: Pedidos a administración

---

## 👤 Guía de Usuario

### Primer Acceso al Sistema

#### Para Administradores:
1. **Registro inicial**: Crear cuenta de administrador
2. **Configurar institución**: Completar datos básicos
3. **Crear carreras**: Definir programas académicos
4. **Configurar ciclos**: Establecer años académicos
5. **Crear materias**: Definir asignaturas
6. **Registrar profesores**: Invitar docentes
7. **Inscribir estudiantes**: Registrar alumnos

#### Para Profesores:
1. **Recibir invitación**: Email del administrador
2. **Completar registro**: Crear contraseña
3. **Ver materias asignadas**: Lista de asignaturas
4. **Gestionar estudiantes**: Ver lista por materia
5. **Registrar calificaciones**: Evaluar estudiantes

#### Para Estudiantes:
1. **Recibir invitación**: Email del administrador
2. **Completar registro**: Crear contraseña
3. **Ver calificaciones**: Consultar notas
4. **Consultar estado**: Materias aprobadas/pendientes
5. **Acceder recursos**: Materiales de estudio

### Navegación del Sistema

#### Barra Superior:
- **Logo**: Regresa al dashboard
- **Menú**: Acceso a funciones principales
- **Perfil**: Información del usuario
- **Notificaciones**: Alertas del sistema
- **Cerrar sesión**: Salir del sistema

#### Sidebar (Panel Lateral):
- **Dashboard**: Página principal
- **Funciones específicas**: Según rol del usuario
- **Configuración**: Ajustes personales
- **Ayuda**: Documentación y soporte

### Gestión de Datos

#### Crear Nuevos Registros:
1. Ir a la sección correspondiente
2. Hacer clic en "Nuevo" o "+"
3. Completar formulario
4. Guardar cambios
5. Verificar creación exitosa

#### Editar Registros Existentes:
1. Buscar el registro a modificar
2. Hacer clic en "Editar"
3. Modificar campos necesarios
4. Guardar cambios
5. Confirmar actualización

#### Eliminar Registros:
1. Localizar el registro
2. Hacer clic en "Eliminar"
3. Confirmar acción
4. Verificar eliminación

---

## 🔧 Administración del Sistema

### Gestión de Usuarios

#### Crear Usuario Administrador:
```sql
-- Ejecutar en Supabase SQL Editor
INSERT INTO users (
    id, 
    institution_id, 
    email, 
    role, 
    first_name, 
    last_name
) VALUES (
    'ID-DEL-USUARIO-SUPABASE-AUTH',
    'ID-DE-LA-INSTITUCION',
    'admin@tu-institucion.com',
    'admin',
    'Nombre',
    'Apellido'
);
```

#### Cambiar Rol de Usuario:
1. Ir a Gestión de Usuarios
2. Buscar el usuario
3. Hacer clic en "Editar"
4. Cambiar rol en el dropdown
5. Guardar cambios

### Configuración de la Institución

#### Datos Básicos:
- Nombre de la institución
- Email de contacto
- Teléfono
- Dirección física
- Logo (opcional)

#### Configuración Académica:
- Período académico
- Fechas importantes
- Políticas de evaluación
- Requisitos de graduación

### Respaldo y Seguridad

#### Respaldo de Base de Datos:
```bash
# Crear respaldo completo
pg_dump -h db.tu-proyecto.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Restaurar desde respaldo
psql -h db.tu-proyecto.supabase.co -U postgres -d postgres < backup_20241201.sql
```

#### Respaldo de Archivos:
```bash
# Respaldo de la aplicación
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/educacion

# Respaldo de configuración
cp /var/www/educacion/.env.production /backups/env_backup_$(date +%Y%m%d)
```

### Monitoreo del Sistema

#### Logs de la Aplicación:
```bash
# Ver logs en tiempo real
sudo journalctl -u educacion -f

# Ver logs de errores
sudo journalctl -u educacion --since "1 hour ago" | grep ERROR
```

#### Monitoreo de Recursos:
```bash
# Uso de CPU y memoria
htop

# Espacio en disco
df -h

# Estado de servicios
sudo systemctl status educacion nginx
```

---

## 🛠️ Desarrollo y Personalización

### Estructura del Proyecto

```
sistema-gestion-educativa/
├── app/                    # Páginas de la aplicación
│   ├── auth/              # Autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── admin/             # Funciones de administrador
│   ├── professor/         # Portal del profesor
│   └── student/           # Portal del estudiante
├── components/            # Componentes reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── ui/               # Componentes UI base
│   └── layout/           # Componentes de layout
├── contexts/             # Context providers
├── hooks/               # Custom hooks
├── lib/                 # Utilidades y configuraciones
├── modules/             # Módulos del sistema (plugins)
├── database/            # Scripts SQL
└── public/              # Archivos estáticos
```

### Crear un Plugin Personalizado

#### Estructura del Plugin:
```typescript
// modules/mi-plugin/MiPlugin.ts
export class MiPlugin extends BasePlugin {
  id = 'mi-plugin'
  name = 'Mi Plugin Personalizado'
  version = '1.0.0'
  description = 'Descripción del plugin'
  author = 'Tu Nombre'

  routes = [
    {
      path: '/mi-plugin',
      component: MiComponente,
      title: 'Mi Plugin',
      roles: ['admin']
    }
  ]

  components = [
    {
      id: 'mi-plugin-widget',
      component: MiWidget,
      placement: 'dashboard',
      order: 1,
      roles: ['admin']
    }
  ]

  initialize() {
    console.log('Mi plugin se ha inicializado')
  }

  destroy() {
    console.log('Mi plugin se ha destruido')
  }
}
```

#### Registrar el Plugin:
```typescript
// lib/plugins.ts
import { MiPlugin } from '@/modules/mi-plugin/MiPlugin'

export function initializeDefaultPlugins() {
  const defaultPlugins = [
    new AttendancePlugin(),
    new CertificatesPlugin(),
    new MessagingPlugin(),
    new MiPlugin(), // Agregar tu plugin aquí
  ]

  defaultPlugins.forEach(plugin => {
    pluginRegistry.register(plugin)
    plugin.initialize()
  })
}
```

### Personalizar Estilos

#### Modificar Colores:
```css
/* app/globals.css */
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
}
```

#### Agregar Componentes Personalizados:
```typescript
// components/ui/MiComponente.tsx
import { ReactNode } from 'react'

interface MiComponenteProps {
  children: ReactNode
  variant?: 'default' | 'custom'
}

export function MiComponente({ children, variant = 'default' }: MiComponenteProps) {
  return (
    <div className={`mi-componente ${variant}`}>
      {children}
    </div>
  )
}
```

### Integración con APIs Externas

#### Configurar Variables de Entorno:
```env
# .env.local
NEXT_PUBLIC_EXTERNAL_API_URL=https://api.externa.com
EXTERNAL_API_KEY=tu-clave-secreta
```

#### Crear Hook para API Externa:
```typescript
// hooks/useExternalAPI.ts
import { useState, useEffect } from 'react'

export function useExternalAPI() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/external')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching external data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading }
}
```

---

## 🔍 Solución de Problemas

### Problemas Comunes

#### Error: "Cannot connect to Supabase"
**Causa**: Variables de entorno incorrectas
**Solución**:
1. Verificar archivo `.env.local`
2. Confirmar URL y clave de Supabase
3. Verificar conexión a internet
4. Revisar configuración de firewall

#### Error: "User not found"
**Causa**: Usuario no existe en la tabla `users`
**Solución**:
1. Verificar que el usuario esté registrado en Supabase Auth
2. Confirmar que existe registro en tabla `users`
3. Verificar que `institution_id` sea correcto

#### Error: "Permission denied"
**Causa**: Políticas RLS bloqueando acceso
**Solución**:
1. Verificar políticas RLS en Supabase
2. Confirmar que el usuario tenga el rol correcto
3. Verificar que `institution_id` coincida

#### Error: "Module not found"
**Causa**: Dependencias no instaladas
**Solución**:
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar instalación
npm list
```

### Logs y Debugging

#### Habilitar Logs Detallados:
```typescript
// lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: process.env.NODE_ENV === 'development'
  }
})
```

#### Ver Logs de Supabase:
1. Ir a Supabase Dashboard
2. Navegar a Logs
3. Seleccionar tipo de log
4. Filtrar por fecha y nivel

#### Debug en Navegador:
```javascript
// Abrir DevTools (F12)
// En Console, ejecutar:
localStorage.setItem('supabase.auth.token', 'tu-token')
// Recargar página
```

### Optimización de Rendimiento

#### Optimizar Consultas:
```sql
-- Crear índices para consultas frecuentes
CREATE INDEX idx_users_institution_role ON users(institution_id, role);
CREATE INDEX idx_grades_enrollment_date ON grades(enrollment_id, created_at);
```

#### Optimizar Frontend:
```typescript
// Usar React.memo para componentes pesados
const MiComponente = React.memo(({ data }) => {
  return <div>{data}</div>
})

// Usar useMemo para cálculos costosos
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

---

## ❓ FAQ

### Preguntas Frecuentes

#### ¿Puedo usar el sistema sin conocimientos técnicos?
**Respuesta**: Sí, el sistema está diseñado para ser fácil de usar. Los administradores pueden gestionar todo desde la interfaz web sin necesidad de conocimientos técnicos.

#### ¿Cuántos usuarios puede manejar el sistema?
**Respuesta**: El sistema puede manejar miles de usuarios simultáneos. La limitación principal es el plan de Supabase que elijas.

#### ¿Puedo personalizar el sistema para mi institución?
**Respuesta**: Sí, el sistema es altamente personalizable. Puedes modificar colores, logos, agregar campos personalizados y crear plugins específicos.

#### ¿Es seguro el sistema?
**Respuesta**: Sí, utiliza las mejores prácticas de seguridad:
- Autenticación robusta con Supabase
- Políticas RLS para aislamiento de datos
- HTTPS obligatorio en producción
- Validación de datos en frontend y backend

#### ¿Puedo migrar datos de otro sistema?
**Respuesta**: Sí, puedes importar datos desde otros sistemas usando scripts SQL o la API de Supabase.

#### ¿Qué pasa si necesito soporte técnico?
**Respuesta**: Puedes:
- Revisar esta documentación
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo
- Contratar soporte personalizado

#### ¿Puedo usar el sistema offline?
**Respuesta**: No, el sistema requiere conexión a internet para funcionar, ya que utiliza Supabase como backend.

#### ¿Es compatible con dispositivos móviles?
**Respuesta**: Sí, el sistema es completamente responsive y funciona en smartphones, tablets y computadoras.

#### ¿Puedo integrar el sistema con otros servicios?
**Respuesta**: Sí, puedes integrar con:
- Sistemas de pago
- Servicios de email
- APIs externas
- Sistemas de videoconferencia

#### ¿Cómo actualizo el sistema?
**Respuesta**: 
1. Hacer backup de datos
2. Actualizar código desde Git
3. Instalar nuevas dependencias
4. Ejecutar migraciones de base de datos
5. Reiniciar servicios

---

## 📞 Soporte y Contacto

### Recursos de Ayuda:
- **Documentación**: Esta guía completa
- **GitHub Issues**: Para reportar bugs
- **Email**: soporte@sistema-educativo.com
- **Discord**: Servidor de la comunidad

### Información del Sistema:
- **Versión**: 1.0.0
- **Última actualización**: Diciembre 2024
- **Licencia**: MIT
- **Desarrollado por**: Equipo de Desarrollo Educativo

---

*Esta documentación se actualiza regularmente. Para la versión más reciente, consulta el repositorio oficial en GitHub.*

