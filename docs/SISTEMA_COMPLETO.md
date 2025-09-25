# 📚 Sistema de Gestión Educativa - Documentación Completa

## 📋 Índice
1. [Introducción General](#-introducción-general)
2. [Arquitectura Multi-tenant](#-arquitectura-multi-tenant)
3. [Sistema de Roles y Usuarios](#-sistema-de-roles-y-usuarios)
4. [Gestión Académica](#-gestión-académica)
5. [Sistema de Inscripciones](#-sistema-de-inscripciones)
6. [Sistema de Calificaciones](#-sistema-de-calificaciones)
7. [Sistema de Plugins](#-sistema-de-plugins)
8. [Seguridad y Autenticación](#-seguridad-y-autenticación)
9. [Dashboard y Reportes](#-dashboard-y-reportes)
10. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
11. [Flujos de Trabajo](#-flujos-de-trabajo)
12. [Funcionalidades por Rol](#-funcionalidades-por-rol)

---

## 🎯 Introducción General

El **Sistema de Gestión Educativa** es una plataforma web moderna y escalable diseñada para instituciones educativas que necesitan gestionar de manera eficiente sus procesos académicos. El sistema está construido con tecnologías modernas (Next.js 14, React 18, TypeScript) y utiliza Supabase como backend.

### 🌟 Características Principales:
- **Multi-tenant**: Cada institución tiene sus datos completamente aislados
- **Sistema de roles**: Administrador, Profesor y Estudiante con permisos específicos  
- **Gestión académica completa**: Carreras, materias, calificaciones, correlativas
- **Arquitectura modular**: Sistema de plugins para funcionalidades adicionales
- **Interfaz moderna**: Diseño responsive y fácil de usar
- **Seguridad robusta**: Autenticación y autorización con Row Level Security (RLS)
- **Notificaciones en tiempo real**: Sistema de notificaciones en vivo
- **Dashboard inteligente**: Estadísticas y métricas en tiempo real

---

## 🏢 Arquitectura Multi-tenant

### ¿Qué es Multi-tenancy?
El sistema multi-tenant permite que múltiples instituciones educativas utilicen la misma plataforma de forma completamente aislada. Cada institución tiene:

- **Datos separados**: No puede ver ni acceder a información de otras instituciones
- **Usuarios independientes**: Cada institución gestiona sus propios usuarios
- **Configuración propia**: Personalización específica por institución
- **Seguridad garantizada**: Políticas RLS aseguran el aislamiento total

### Estructura de la Base de Datos

#### Tabla Principal: `institutions`
```sql
CREATE TABLE institutions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Todas las tablas están vinculadas a instituciones:
- `users` → `institution_id`
- `careers` → `institution_id` 
- `students` → `institution_id`
- Y todas las demás tablas heredan esta relación

### Implementación de RLS (Row Level Security)
```sql
-- Función para obtener la institución del usuario actual
CREATE FUNCTION get_user_institution_id() RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT institution_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política ejemplo para carreras
CREATE POLICY "Users can only access their institution careers" 
ON careers FOR ALL 
USING (institution_id = get_user_institution_id());
```

---

## 👥 Sistema de Roles y Usuarios

### Roles Disponibles

#### 🔑 Administrador (`admin`)
**Acceso completo al sistema de su institución**

**Funcionalidades**:
- Gestión completa de usuarios (crear, editar, eliminar)
- Configuración de carreras y ciclos académicos
- Gestión de materias y correlatividades
- Asignación de profesores a materias
- Gestión de estudiantes e inscripciones
- Acceso a todas las calificaciones y reportes
- Configuración general del sistema
- Gestión de plugins y módulos

#### 👨‍🏫 Profesor (`professor`)
**Acceso limitado a sus materias asignadas**

**Funcionalidades**:
- Ver materias asignadas
- Gestionar lista de estudiantes por materia
- Registrar y modificar calificaciones de sus materias
- Generar reportes de sus materias
- Acceso a recursos educativos
- Comunicación con estudiantes

#### 🎓 Estudiante (`student`)
**Acceso a sus datos académicos**

**Funcionalidades**:
- Ver calificaciones propias
- Consultar estado académico (materias aprobadas/pendientes)
- Ver materias disponibles según correlativas cumplidas
- Acceder a recursos educativos
- Realizar solicitudes a administración
- Consultar horarios y calendario académico

### Gestión de Usuarios

#### Proceso de Registro:
1. **Administrador** crea usuario con email y datos básicos
2. Sistema envía email de invitación a través de Supabase Auth
3. Usuario completa registro creando contraseña
4. Usuario accede al sistema según su rol asignado

#### Estructura de Usuario:
```typescript
interface User {
  id: string
  institution_id: string
  email: string
  role: 'admin' | 'professor' | 'student'
  first_name: string
  last_name: string
  phone?: string
  created_at: string
  updated_at: string
}
```

---

## 🎓 Gestión Académica

### Carreras
Las carreras son los programas académicos principales de cada institución.

#### Estructura:
```sql
CREATE TABLE careers (
    id UUID PRIMARY KEY,
    institution_id UUID REFERENCES institutions(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_years INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Funcionalidades:
- **Crear carreras**: Definir nombre, descripción y duración
- **Configurar duración**: Establecer años de duración
- **Estado activo/inactivo**: Controlar disponibilidad
- **Estadísticas**: Ver cantidad de estudiantes por carrera

### Ciclos Académicos
Los ciclos representan los años o períodos dentro de una carrera.

#### Estructura:
```sql
CREATE TABLE cycles (
    id UUID PRIMARY KEY,
    career_id UUID REFERENCES careers(id),
    name VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(career_id, year)
);
```

#### Funcionalidades:
- **Organización secuencial**: Primer año, segundo año, etc.
- **Restricción única**: Un solo ciclo por año en cada carrera
- **Vinculación con materias**: Las materias se asignan a ciclos

### Materias/Asignaturas
Las materias son las asignaturas específicas de cada ciclo.

#### Estructura:
```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY,
    cycle_id UUID REFERENCES cycles(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    hours_per_week INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(cycle_id, code)
);
```

#### Funcionalidades:
- **Código único**: Identificador único por ciclo
- **Créditos**: Sistema de créditos académicos
- **Carga horaria**: Horas semanales
- **Asignación de profesores**: Relación many-to-many con profesores

### Sistema de Correlatividades
Las correlatividades definen qué materias son prerequisito para cursar otras.

#### Estructura:
```sql
CREATE TABLE correlatives (
    id UUID PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id),
    required_subject_id UUID REFERENCES subjects(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(subject_id, required_subject_id),
    CHECK (subject_id != required_subject_id)
);
```

#### Funcionalidades:
- **Requisitos automáticos**: Validación automática de correlativas
- **Prevención de loops**: Una materia no puede ser correlativa de sí misma
- **Validación de inscripciones**: Solo permite inscribirse si cumple correlativas

---

## 📝 Sistema de Inscripciones

### Estudiantes
Cada usuario con rol `student` tiene un registro en la tabla `students`.

#### Estructura:
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    institution_id UUID REFERENCES institutions(id),
    career_id UUID REFERENCES careers(id),
    student_number VARCHAR(50) UNIQUE NOT NULL,
    enrollment_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Funcionalidades:
- **Número de estudiante**: Identificador único generado automáticamente
- **Vinculación a carrera**: Cada estudiante pertenece a una carrera
- **Estado activo**: Control de estudiantes activos/inactivos
- **Fecha de inscripción**: Registro histórico

### Inscripciones a Materias
Las inscripciones conectan estudiantes con materias específicas.

#### Estructura:
```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    subject_id UUID REFERENCES subjects(id),
    enrollment_date DATE NOT NULL,
    status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, subject_id)
);
```

#### Estados de Inscripción:
- **`enrolled`**: Cursando actualmente
- **`completed`**: Materia aprobada
- **`dropped`**: Abandonada o dada de baja

#### Proceso de Inscripción:
1. **Verificación de correlativas**: Sistema valida requisitos
2. **Creación de inscripción**: Registro con estado `enrolled`
3. **Notificación**: Alerta al estudiante y profesor
4. **Seguimiento**: Monitoreo del progreso

---

## 📊 Sistema de Calificaciones

### Estructura de Calificaciones
```sql
CREATE TABLE grades (
    id UUID PRIMARY KEY,
    enrollment_id UUID REFERENCES enrollments(id),
    professor_id UUID REFERENCES users(id),
    grade DECIMAL(5,2) NOT NULL,
    max_grade DECIMAL(5,2) DEFAULT 100,
    grade_type ENUM('exam', 'assignment', 'project', 'final') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tipos de Evaluación
- **`exam`**: Exámenes parciales y finales
- **`assignment`**: Trabajos prácticos y tareas
- **`project`**: Proyectos y trabajos integradores
- **`final`**: Evaluación final de la materia

### Funcionalidades del Sistema
- **Registro por profesores**: Solo profesores asignados pueden calificar
- **Múltiples evaluaciones**: Varias calificaciones por materia
- **Cálculo de promedios**: Automático por materia
- **Historial completo**: Todas las calificaciones del estudiante
- **Notificaciones**: Alertas automáticas a estudiantes

### Permisos de Calificaciones
- **Profesores**: Solo sus materias asignadas
- **Administradores**: Todas las calificaciones de su institución
- **Estudiantes**: Solo sus propias calificaciones

---

## 🔌 Sistema de Plugins

### Arquitectura de Plugins
El sistema incluye una arquitectura modular que permite agregar funcionalidades a través de plugins.

#### Estructura de Plugin:
```typescript
interface Plugin {
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
```

### Plugins Incluidos

#### 📅 Plugin de Asistencias (`AttendancePlugin`)
- **Propósito**: Gestionar asistencias de estudiantes
- **Funcionalidades**: Registro de asistencias, reportes, estadísticas
- **Roles**: Administradores y Profesores

#### 📄 Plugin de Certificados (`CertificatesPlugin`)
- **Propósito**: Generar certificados y analíticos en PDF
- **Funcionalidades**: Generación automática, plantillas personalizables
- **Roles**: Administradores y Estudiantes

#### 💬 Plugin de Mensajería (`MessagingPlugin`)
- **Propósito**: Sistema de comunicación interna
- **Funcionalidades**: Mensajes entre usuarios, notificaciones
- **Roles**: Todos los roles

### Gestión de Plugins
- **Registry de plugins**: Sistema centralizado de registro
- **Habilitación/Deshabilitación**: Control dinámico
- **Dependencias**: Manejo de dependencias entre plugins
- **Rutas dinámicas**: Agregado automático al enrutamiento
- **Componentes**: Inserción en diferentes partes de la UI

---

## 🔒 Seguridad y Autenticación

### Autenticación con Supabase
- **Supabase Auth**: Sistema robusto de autenticación
- **JWT Tokens**: Tokens seguros con renovación automática
- **Sesiones persistentes**: Mantiene sesión activa
- **Recuperación de contraseña**: Flujo seguro de recuperación

### Row Level Security (RLS)
Todas las tablas tienen RLS habilitado para garantizar aislamiento multi-tenant.

#### Funciones Helper de Seguridad:
```sql
-- Obtener institución del usuario
CREATE FUNCTION get_user_institution_id() RETURNS UUID;

-- Verificar si es admin
CREATE FUNCTION is_institution_admin() RETURNS BOOLEAN;

-- Verificar si es profesor
CREATE FUNCTION is_professor() RETURNS BOOLEAN;

-- Verificar si es estudiante  
CREATE FUNCTION is_student() RETURNS BOOLEAN;
```

#### Políticas de Ejemplo:
```sql
-- Solo admin puede gestionar usuarios
CREATE POLICY "Admins can manage users" ON users
FOR ALL USING (
    institution_id = get_user_institution_id() 
    AND is_institution_admin()
);

-- Estudiantes ven solo sus calificaciones
CREATE POLICY "Students can view their grades" ON grades
FOR SELECT USING (
    enrollment_id IN (
        SELECT id FROM enrollments 
        WHERE student_id IN (
            SELECT id FROM students 
            WHERE user_id = auth.uid()
        )
    )
);
```

### Logging de Seguridad
- **Eventos de autenticación**: Login exitoso/fallido
- **Accesos a datos**: Registro de consultas sensibles
- **Cambios de permisos**: Modificaciones de roles
- **Errores del sistema**: Logging de excepciones

---

## 📊 Dashboard y Reportes

### Dashboard Principal
El dashboard presenta información contextual según el rol del usuario.

#### Para Administradores:
```typescript
interface AdminStats {
  students: number        // Total de estudiantes
  professors: number      // Total de profesores  
  careers: number        // Total de carreras
  subjects: number       // Total de materias
  recentActivity: Activity[]
  upcomingEvents: Event[]
}
```

#### Para Profesores:
- Materias asignadas
- Estudiantes por materia
- Calificaciones pendientes
- Próximas evaluaciones

#### Para Estudiantes:
- Calificaciones recientes
- Estado académico actual
- Materias disponibles para cursar
- Próximas fechas importantes

### Sistema de Notificaciones
```typescript
interface Notification {
  id: string
  type: 'enrollment_approved' | 'enrollment_rejected' | 'enrollment_pending'
  title: string
  message: string
  user_id: string
  enrollment_request_id?: string
  is_read: boolean
  created_at: string
}
```

#### Notificaciones en Tiempo Real:
- **Supabase Realtime**: Conexión websocket para actualizaciones instantáneas
- **Toast notifications**: Alertas en pantalla
- **Contador de no leídas**: Badge en la UI
- **Persistencia**: Almacenamiento en base de datos

---

## 💻 Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework React con App Router
- **React 18**: Biblioteca de UI con hooks modernos
- **TypeScript**: Tipado estático para mejor desarrollo
- **TailwindCSS**: Framework CSS utilitario
- **Lucide React**: Iconos modernos y consistentes

### Backend
- **Supabase**: BaaS completo (Base de datos, Auth, Storage)
- **PostgreSQL**: Base de datos relacional robusta
- **Row Level Security**: Seguridad a nivel de fila
- **Real-time subscriptions**: Actualizaciones en vivo

### Herramientas de Desarrollo
- **Custom Hooks**: Lógica reutilizable (`useData`, `useGrades`, etc.)
- **Context API**: Gestión de estado global
- **React Hot Toast**: Sistema de notificaciones
- **Middleware**: Protección de rutas

---

## 🔄 Flujos de Trabajo

### Flujo de Registro de Institución
1. **Solicitud inicial**: Institución contacta para registro
2. **Creación de institución**: Admin del sistema crea registro
3. **Creación de admin**: Se crea usuario administrador de la institución
4. **Configuración inicial**: Admin completa datos de la institución
5. **Configuración académica**: Creación de carreras y ciclos

### Flujo de Inscripción de Estudiante
1. **Registro de usuario**: Admin crea usuario estudiante
2. **Creación de estudiante**: Se genera registro en tabla `students`
3. **Asignación de número**: Sistema genera número de estudiante único
4. **Selección de materias**: Estudiante ve materias disponibles
5. **Validación de correlativas**: Sistema verifica requisitos
6. **Confirmación**: Inscripción confirmada si cumple requisitos

### Flujo de Calificación
1. **Asignación profesor-materia**: Admin asigna profesor a materia
2. **Inscripciones activas**: Profesor ve estudiantes inscriptos
3. **Registro de calificación**: Profesor ingresa calificación
4. **Notificación**: Sistema notifica al estudiante
5. **Cálculo de promedio**: Actualización automática del promedio

### Flujo de Aprobación de Materia
1. **Calificación final**: Profesor registra nota final
2. **Evaluación de aprobación**: Sistema evalúa si aprueba
3. **Cambio de estado**: Inscripción cambia a `completed`
4. **Actualización de correlativas**: Se habilitan nuevas materias
5. **Notificación**: Estudiante es notificado del resultado

---

## 🎭 Funcionalidades por Rol

### 🔑 Administrador

#### Gestión de Usuarios
- ✅ Crear, editar y eliminar usuarios
- ✅ Asignar y cambiar roles
- ✅ Activar/desactivar usuarios
- ✅ Búsqueda y filtros avanzados
- ✅ Exportar listados de usuarios

#### Gestión Académica
- ✅ Crear y gestionar carreras
- ✅ Configurar ciclos académicos
- ✅ Crear materias con correlatividades
- ✅ Asignar profesores a materias
- ✅ Gestionar inscripciones de estudiantes

#### Reportes y Estadísticas
- ✅ Dashboard completo con métricas
- ✅ Reportes de rendimiento académico
- ✅ Estadísticas por carrera y materia
- ✅ Exportación de datos
- ✅ Seguimiento de estudiantes

#### Configuración del Sistema
- ✅ Configurar datos de la institución
- ✅ Gestionar plugins y módulos
- ✅ Configurar notificaciones
- ✅ Administrar permisos

### 👨‍🏫 Profesor

#### Gestión de Materias
- ✅ Ver materias asignadas
- ✅ Lista de estudiantes por materia
- ✅ Recursos y materiales de la materia
- ✅ Horarios y cronogramas

#### Sistema de Calificaciones
- ✅ Registrar calificaciones por tipo
- ✅ Modificar calificaciones existentes
- ✅ Calcular promedios por estudiante
- ✅ Generar reportes de materia
- ✅ Exportar listas de calificaciones

#### Comunicación
- ✅ Mensajería con estudiantes
- ✅ Notificaciones automáticas
- ✅ Anuncios a la clase
- ✅ Recursos compartidos

### 🎓 Estudiante

#### Consulta Académica
- ✅ Ver todas las calificaciones
- ✅ Estado académico detallado
- ✅ Materias aprobadas y pendientes
- ✅ Promedio general y por materia
- ✅ Historial académico completo

#### Inscripciones
- ✅ Ver materias disponibles
- ✅ Verificar correlatividades
- ✅ Solicitar inscripciones
- ✅ Seguimiento de solicitudes

#### Recursos y Comunicación
- ✅ Acceso a materiales de estudio
- ✅ Comunicación con profesores
- ✅ Notificaciones académicas
- ✅ Calendario académico

#### Certificados y Documentos
- ✅ Solicitar certificados de estudios
- ✅ Descargar analíticos
- ✅ Estado de documentación
- ✅ Historial de solicitudes

---

## 📈 Métricas y Estadísticas

### Métricas del Sistema
- **Instituciones activas**: Cantidad de instituciones registradas
- **Usuarios totales**: Por institución y por rol
- **Actividad diaria**: Logins, accesos, operaciones
- **Rendimiento**: Tiempos de respuesta, consultas

### Métricas Académicas
- **Estudiantes por carrera**: Distribución y tendencias
- **Aprobación por materia**: Tasas de éxito académico
- **Calificaciones promedio**: Por materia, carrera, período
- **Correlatividades**: Impacto en el flujo académico

### Reportes Disponibles
- **Listados de estudiantes**: Por carrera, año, estado
- **Calificaciones**: Por estudiante, materia, período
- **Estadísticas académicas**: Rendimiento y tendencias
- **Uso del sistema**: Actividad y adopción

---

## 🚀 Funcionalidades Futuras

### En Desarrollo (Roadmap)
- ✅ **Sistema de notificaciones en tiempo real** (Implementado)
- ⏳ **Integración con pasarelas de pago**
- ⏳ **Módulo de horarios y calendario académico**
- ⏳ **Sistema de evaluaciones online**
- ⏳ **Reporting avanzado con gráficos interactivos**
- ⏳ **API pública para integraciones**
- ⏳ **Soporte multi-idioma**

### Plugins Planificados
- **Biblioteca Digital**: Gestión de recursos digitales
- **Sistema de Asistencias**: Control de asistencia avanzado
- **Videoconferencias**: Integración con plataformas de video
- **Foros Académicos**: Espacios de discusión
- **Sistema de Encuestas**: Evaluación de satisfacción

---

## 📞 Soporte y Contacto

### Documentación
- 📚 **Documentación Técnica**: Guías detalladas de implementación
- 🎥 **Videos Tutoriales**: Tutoriales paso a paso
- 📖 **Guías de Usuario**: Manuales por rol
- ❓ **FAQ**: Preguntas frecuentes

### Contacto
- 📧 **Email**: soporte@sistema-educativo.com
- 💬 **Discord**: Comunidad de desarrolladores
- 🐛 **GitHub Issues**: Reportes de bugs y features
- 🤝 **Contribuciones**: Guía para colaboradores

---

## 📝 Conclusión

El Sistema de Gestión Educativa es una solución integral que combina:

- **🏢 Arquitectura robusta**: Multi-tenant y escalable
- **🔒 Seguridad avanzada**: RLS y autenticación robusta  
- **🎨 Interfaz moderna**: UX optimizada y responsive
- **🔌 Extensibilidad**: Sistema de plugins modular
- **📊 Datos inteligentes**: Métricas y reportes completos
- **⚡ Tiempo real**: Notificaciones y actualizaciones instantáneas

Es la herramienta perfecta para instituciones educativas que buscan modernizar y optimizar sus procesos académicos con una plataforma confiable, segura y fácil de usar.

---

*Documentación actualizada: Diciembre 2024*  
*Versión del sistema: 1.0.0*  
*Tecnologías: Next.js 14, React 18, TypeScript, Supabase*
