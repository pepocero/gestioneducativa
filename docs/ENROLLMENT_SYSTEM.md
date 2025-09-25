# Sistema de Inscripciones a Materias con Aprobación

## Descripción General

Este sistema implementa un flujo completo de inscripciones a materias donde los estudiantes pueden solicitar inscripción a materias específicas, y los administradores pueden revisar, aprobar o rechazar estas solicitudes. Una vez aprobada, el estudiante queda oficialmente inscrito en la materia.

## Flujo de Trabajo

### 1. **Solicitud del Estudiante**
- El estudiante navega por las carreras disponibles
- Selecciona una carrera para ver sus ciclos
- Selecciona un ciclo para ver las materias disponibles
- Solicita inscripción a una materia específica
- La solicitud queda en estado "Pendiente"

### 2. **Supervisión del Administrador**
- Los administradores reciben una notificación de nueva solicitud
- Pueden ver todas las solicitudes pendientes
- Revisan los detalles de cada solicitud
- Pueden aprobar o rechazar la solicitud

### 3. **Aprobación/Rechazo**
- **Aprobación**: Se crea automáticamente la inscripción oficial en la tabla `enrollments`
- **Rechazo**: Se marca la solicitud como rechazada con opción de agregar notas
- El estudiante recibe una notificación del resultado

### 4. **Inscripción Oficial**
- Una vez aprobada, el estudiante queda oficialmente inscrito
- Puede acceder a la materia en su perfil académico
- El profesor puede ver al estudiante en su lista de alumnos

## Estructura de Base de Datos

### Tablas Principales

#### `enrollment_requests`
- Almacena todas las solicitudes de inscripción
- Estados: `pending`, `approved`, `rejected`, `cancelled`
- Incluye notas del estudiante y del administrador

#### `enrollments`
- Almacena las inscripciones oficiales (solo después de aprobación)
- Se crea automáticamente cuando se aprueba una solicitud

#### `notifications`
- Sistema de notificaciones en tiempo real
- Notifica a estudiantes sobre aprobaciones/rechazos
- Notifica a administradores sobre nuevas solicitudes

### Funciones SQL

#### `approve_enrollment_request(request_id UUID)`
- Aprueba una solicitud de inscripción
- Crea la inscripción oficial en `enrollments`
- Envía notificación al estudiante

#### `reject_enrollment_request(request_id UUID, admin_notes TEXT)`
- Rechaza una solicitud de inscripción
- Permite agregar notas explicativas
- Envía notificación al estudiante

#### `cancel_enrollment_request(request_id UUID)`
- Permite a los estudiantes cancelar sus propias solicitudes
- Solo funciona si la solicitud está pendiente o aprobada

## Componentes de la Interfaz

### Para Estudiantes

#### `SubjectBrowser`
- Navegador de carreras, ciclos y materias
- Muestra el estado actual de inscripción para cada materia
- Permite solicitar inscripción a materias disponibles

#### `EnrollmentRequestForm`
- Formulario para solicitar inscripción
- Incluye información del período académico
- Permite agregar notas adicionales

#### `StudentEnrollmentsPage`
- Página principal para estudiantes
- Muestra el navegador de materias
- Lista el historial de solicitudes

### Para Administradores

#### `EnrollmentApprovalPanel`
- Panel de gestión de solicitudes
- Estadísticas en tiempo real
- Filtros por estado
- Acciones de aprobación/rechazo

#### `AdminEnrollmentRequestsPage`
- Página principal para administradores
- Acceso completo al panel de aprobación

### Componentes Compartidos

#### `NotificationBell`
- Campana de notificaciones
- Muestra notificaciones en tiempo real
- Permite marcar como leídas

## Estados de las Solicitudes

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| `pending` | Solicitud enviada, esperando revisión | Admin: Aprobar/Rechazar, Estudiante: Cancelar |
| `approved` | Solicitud aprobada, estudiante inscrito | Estudiante: Cancelar |
| `rejected` | Solicitud rechazada | Estudiante: Reintentar |
| `cancelled` | Solicitud cancelada | Ninguna |

## Notificaciones

### Tipos de Notificación

- **`enrollment_approved`**: Solicitud aprobada
- **`enrollment_rejected`**: Solicitud rechazada
- **`enrollment_pending`**: Nueva solicitud (para admins)
- **`enrollment_cancelled`**: Solicitud cancelada

### Flujo de Notificaciones

1. **Nueva Solicitud**: Notifica a todos los administradores de la institución
2. **Aprobación**: Notifica al estudiante con confirmación
3. **Rechazo**: Notifica al estudiante con motivo (si se proporciona)
4. **Cancelación**: Notifica al estudiante sobre la cancelación

## Seguridad y Permisos

### Políticas RLS (Row Level Security)

- Los estudiantes solo pueden ver y gestionar sus propias solicitudes
- Los administradores pueden ver todas las solicitudes de su institución
- Las notificaciones son privadas para cada usuario
- Las funciones SQL tienen permisos `SECURITY DEFINER`

### Validaciones

- No se puede aprobar una solicitud ya aprobada
- No se puede rechazar una solicitud ya procesada
- Los estudiantes no pueden cancelar solicitudes de otros
- Verificación de duplicados antes de crear inscripciones

## Instalación y Configuración

### 1. Ejecutar Scripts de Base de Datos

```sql
-- En orden:
1. schema.sql
2. rls-policies.sql
3. enrollment-requests.sql
4. notifications.sql
5. sample-data.sql (opcional, para datos de prueba)
```

### 2. Configurar Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Rutas Disponibles

- `/student/enrollments` - Página de inscripciones para estudiantes
- `/admin/enrollment-requests` - Panel de gestión para administradores

## Uso del Sistema

### Para Estudiantes

1. Acceder a `/student/enrollments`
2. Seleccionar carrera → ciclo → materia
3. Hacer clic en "Solicitar Inscripción"
4. Completar el formulario
5. Esperar notificación de resultado

### Para Administradores

1. Acceder a `/admin/enrollment-requests`
2. Revisar solicitudes pendientes
3. Ver detalles de cada solicitud
4. Aprobar o rechazar según corresponda
5. Agregar notas si es necesario

## Características Técnicas

### Tiempo Real
- Notificaciones en tiempo real usando Supabase Realtime
- Actualizaciones automáticas de estados
- Sincronización entre múltiples usuarios

### Performance
- Índices optimizados en base de datos
- Carga lazy de datos
- Paginación en listas grandes

### Escalabilidad
- Diseño multi-tenant
- Políticas RLS para aislamiento de datos
- Funciones SQL para operaciones complejas

## Mantenimiento

### Monitoreo
- Revisar logs de errores en Supabase
- Monitorear performance de queries
- Verificar funcionamiento de notificaciones

### Backup
- Backup automático de Supabase
- Exportar datos críticos regularmente
- Mantener respaldo de configuraciones

## Futuras Mejoras

### Funcionalidades Adicionales
- Sistema de correlatividades
- Límites de cupos por materia
- Horarios de materias
- Sistema de listas de espera
- Notificaciones por email
- Reportes y estadísticas avanzadas

### Optimizaciones
- Cache de consultas frecuentes
- Compresión de notificaciones
- Optimización de queries complejas
- Implementación de CDN para assets
