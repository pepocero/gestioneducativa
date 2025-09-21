# 🔒 Sistema de Seguridad - Documentación de Uso

Este documento explica cómo usar las mejoras de seguridad implementadas en el sistema de gestión educativa.

## 📋 Módulos Implementados

### 1. **Sanitización Avanzada** (`lib/security/sanitization.ts`)
### 2. **Rate Limiting** (`lib/security/rate-limiting.ts`)
### 3. **Logging de Seguridad** (`lib/security/security-logger.ts`)
### 4. **Hook de Formularios Seguros** (`lib/security/use-security-form.ts`)
### 5. **Middleware de API** (`lib/security/api-security.ts`)

---

## 🛡️ Sanitización Avanzada

### Uso Básico

```typescript
import { sanitizeString, sanitizeEmail, FIELD_CONFIGS } from '@/lib/security'

// Sanitizar texto básico
const result = sanitizeString('<script>alert("xss")</script>')
console.log(result.sanitizedValue) // ""
console.log(result.errors) // ["Se detectó contenido potencialmente peligroso"]

// Sanitizar email
const emailResult = sanitizeEmail('user@example.com')
console.log(emailResult.sanitizedValue) // "user@example.com"

// Sanitizar objeto completo
const formData = { name: '<script>', email: 'test@test.com' }
const sanitized = sanitizeObject(formData, {
  name: FIELD_CONFIGS.name,
  email: FIELD_CONFIGS.email
})
```

### Configuraciones Predefinidas

```typescript
import { FIELD_CONFIGS } from '@/lib/security'

// Configuraciones disponibles:
FIELD_CONFIGS.name        // { maxLength: 100, strictMode: true }
FIELD_CONFIGS.email       // { maxLength: 254, strictMode: true }
FIELD_CONFIGS.phone       // { maxLength: 20, allowSpecialChars: true }
FIELD_CONFIGS.address     // { maxLength: 500, allowSpecialChars: true }
FIELD_CONFIGS.description // { maxLength: 1000, allowSpecialChars: true }
```

---

## ⏱️ Rate Limiting

### Uso en Componentes React

```typescript
import { useRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/security'

function LoginForm() {
  const { checkLimit, recordSuccess, recordFailure } = useRateLimit(
    RATE_LIMIT_CONFIGS.login
  )

  const handleSubmit = async (formData) => {
    const identifier = `user:${userId}`
    const result = checkLimit(identifier)
    
    if (!result.allowed) {
      toast.error(`Demasiados intentos. Intenta en ${result.retryAfter} segundos`)
      return
    }

    try {
      await login(formData)
      recordSuccess(identifier)
    } catch (error) {
      recordFailure(identifier)
    }
  }
}
```

### Configuraciones Predefinidas

```typescript
RATE_LIMIT_CONFIGS.login     // 5 intentos por 15 minutos
RATE_LIMIT_CONFIGS.register  // 3 intentos por hora
RATE_LIMIT_CONFIGS.forms     // 10 intentos por 5 minutos
RATE_LIMIT_CONFIGS.api       // 100 intentos por minuto
```

---

## 📝 Logging de Seguridad

### Uso Básico

```typescript
import { useSecurityLogger, SecurityEventType, SecurityLevel } from '@/lib/security'

function MyComponent() {
  const logger = useSecurityLogger()

  const handleAction = () => {
    // Log de evento de seguridad
    logger.log(
      SecurityEventType.ACCESS_GRANTED,
      SecurityLevel.LOW,
      'Usuario accedió al dashboard',
      { userId: '123', action: 'dashboard_access' }
    )

    // Log de autenticación
    logger.logAuth(
      SecurityEventType.LOGIN_SUCCESS,
      'user@example.com',
      '192.168.1.1',
      'Mozilla/5.0...'
    )

    // Log de actividad sospechosa
    logger.logSuspiciousActivity(
      'Múltiples intentos de login fallidos',
      { attempts: 10, timeWindow: '5 minutes' },
      'user@example.com',
      '192.168.1.1'
    )
  }
}
```

### Tipos de Eventos

```typescript
SecurityEventType.LOGIN_SUCCESS
SecurityEventType.LOGIN_FAILED
SecurityEventType.REGISTRATION_SUCCESS
SecurityEventType.REGISTRATION_FAILED
SecurityEventType.RATE_LIMIT_EXCEEDED
SecurityEventType.SANITIZATION_ERROR
SecurityEventType.SQL_INJECTION_ATTEMPT
SecurityEventType.XSS_ATTEMPT
SecurityEventType.SUSPICIOUS_ACTIVITY
```

---

## 📋 Hook de Formularios Seguros

### Uso en Formularios

```typescript
import { useBasicSecurityForm } from '@/lib/security'

function CreateStudentForm() {
  const { processFormData, isProcessing, getRateLimitInfo } = useBasicSecurityForm<{
    firstName: string
    lastName: string
    email: string
  }>('forms')

  const handleSubmit = async (formData) => {
    const fieldMappings = {
      firstName: 'name',
      lastName: 'name',
      email: 'email'
    }

    const result = await processFormData(formData, fieldMappings)

    if (!result.isValid) {
      // Mostrar errores
      setErrors(result.errors)
      return
    }

    // Usar datos sanitizados
    const { sanitizedData } = result
    await createStudent(sanitizedData)
  }
}
```

### Configuración Avanzada

```typescript
import { useSecurityForm } from '@/lib/security'

const { processFormData } = useSecurityForm({
  formType: 'login',
  enableSanitization: true,
  enableRateLimit: true,
  enableLogging: true,
  customFieldConfigs: {
    customField: { maxLength: 50, strictMode: true }
  },
  userId: 'user123',
  ipAddress: '192.168.1.1'
})
```

---

## 🔌 Middleware de API

### Uso en API Routes

```typescript
// pages/api/students.ts
import { withSecurity, apiSecurityMiddleware } from '@/lib/security'

export default withSecurity(async (request, context) => {
  // Tu lógica de API aquí
  return NextResponse.json({ students: [] })
}, {
  enableRateLimit: true,
  enableLogging: true,
  enableSanitization: true,
  requireAuth: true
})
```

### Middlewares Específicos

```typescript
import { 
  authSecurityMiddleware,
  registerSecurityMiddleware,
  formSecurityMiddleware 
} from '@/lib/security'

// Para endpoints de login
export default authSecurityMiddleware(async (request, context) => {
  // Lógica de login
})

// Para endpoints de registro
export default registerSecurityMiddleware(async (request, context) => {
  // Lógica de registro
})

// Para endpoints de formularios
export default formSecurityMiddleware(async (request, context) => {
  // Lógica de formularios
})
```

---

## 🚀 Integración en Formularios Existentes

### Ejemplo: Formulario de Login

```typescript
// components/auth/LoginForm.tsx
import { useBasicSecurityForm } from '@/lib/security'

export default function LoginForm() {
  const [formErrors, setFormErrors] = useState({})
  const { processFormData, isProcessing } = useBasicSecurityForm<{
    email: string
    password: string
  }>('login')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormErrors({})

    const formData = { email, password }
    const fieldMappings = { email: 'email', password: 'password' }
    
    const result = await processFormData(formData, fieldMappings)

    if (!result.isValid) {
      setFormErrors(result.errors)
      return
    }

    // Usar datos sanitizados
    const { sanitizedData } = result
    await signIn(sanitizedData.email, sanitizedData.password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        className={formErrors.email ? 'border-red-500' : 'border-gray-300'}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {formErrors.email && (
        <p className="text-red-500">{formErrors.email[0]}</p>
      )}
      
      <button disabled={isProcessing}>
        {isProcessing ? 'Procesando...' : 'Iniciar Sesión'}
      </button>
    </form>
  )
}
```

---

## 📊 Monitoreo y Estadísticas

### Obtener Estadísticas de Seguridad

```typescript
import { securityLogger } from '@/lib/security'

// Obtener logs por criterios
const logs = securityLogger.getLogs({
  eventType: SecurityEventType.LOGIN_FAILED,
  level: SecurityLevel.MEDIUM,
  startTime: Date.now() - 24 * 60 * 60 * 1000, // Últimas 24 horas
  limit: 100
})

// Obtener estadísticas
const stats = securityLogger.getSecurityStats({
  start: Date.now() - 7 * 24 * 60 * 60 * 1000, // Última semana
  end: Date.now()
})

console.log('Total de eventos:', stats.totalEvents)
console.log('Eventos por tipo:', stats.eventsByType)
console.log('Top usuarios:', stats.topUsers)
console.log('Top IPs:', stats.topIPs)
```

### Estadísticas de Rate Limiting

```typescript
import { rateLimiter } from '@/lib/security'

const stats = rateLimiter.getStats()
console.log('Entradas totales:', stats.totalEntries)
console.log('Entradas bloqueadas:', stats.blockedEntries)
```

---

## ⚙️ Configuración Avanzada

### Configurar Logger Remoto

```typescript
import { SecurityLogger } from '@/lib/security/security-logger'

const logger = new SecurityLogger({
  enableConsoleLogging: true,
  enableFileLogging: true,
  logFilePath: './logs/security.log',
  enableRemoteLogging: true,
  remoteEndpoint: 'https://api.example.com/security-logs',
  batchSize: 50,
  flushInterval: 30000
})
```

### Configurar Rate Limiter Personalizado

```typescript
import { RateLimiter } from '@/lib/security/rate-limiting'

const customLimiter = new RateLimiter()

const result = customLimiter.checkLimit('user:123', {
  maxAttempts: 3,
  windowMs: 5 * 60 * 1000, // 5 minutos
  blockDurationMs: 15 * 60 * 1000 // 15 minutos de bloqueo
})
```

---

## 🔧 Solución de Problemas

### Problemas Comunes

1. **Rate Limit Exceeded**
   ```typescript
   // Verificar configuración
   const info = getRateLimitInfo()
   console.log('Intentos restantes:', info.remainingAttempts)
   console.log('Tiempo de reset:', new Date(info.resetTime))
   ```

2. **Errores de Sanitización**
   ```typescript
   // Verificar configuración de campos
   const result = sanitizeString(input, { maxLength: 100, strictMode: false })
   console.log('Errores:', result.errors)
   console.log('Advertencias:', result.warnings)
   ```

3. **Logs No Aparecen**
   ```typescript
   // Verificar configuración del logger
   securityLogger.log(SecurityEventType.SYSTEM_ERROR, SecurityLevel.LOW, 'Test message')
   ```

---

## 📈 Mejores Prácticas

### 1. **Siempre usar sanitización en formularios**
```typescript
const { processFormData } = useBasicSecurityForm('forms')
```

### 2. **Implementar rate limiting en endpoints críticos**
```typescript
export default withSecurity(handler, { enableRateLimit: true })
```

### 3. **Logging de eventos importantes**
```typescript
logger.logAuth(SecurityEventType.LOGIN_SUCCESS, email, ip, userAgent)
```

### 4. **Monitoreo regular de estadísticas**
```typescript
const stats = securityLogger.getSecurityStats()
// Revisar eventos sospechosos regularmente
```

### 5. **Configuración apropiada por entorno**
- **Desarrollo**: Logging completo, rate limits relajados
- **Producción**: Logging crítico, rate limits estrictos
- **Testing**: Logging mínimo, rate limits deshabilitados

---

## 🎯 Próximos Pasos

1. **Integrar en más formularios** del sistema
2. **Configurar logging remoto** para producción
3. **Implementar alertas** para eventos críticos
4. **Crear dashboard** de monitoreo de seguridad
5. **Auditoría regular** de logs de seguridad

---

## 📞 Soporte

Para dudas o problemas con el sistema de seguridad:

1. Revisar los logs de consola
2. Verificar configuración de módulos
3. Consultar esta documentación
4. Revisar ejemplos de implementación

¡El sistema de seguridad está listo para proteger tu aplicación! 🛡️
