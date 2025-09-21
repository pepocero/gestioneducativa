/**
 * Sistema de Logging de Seguridad
 * Registra eventos de seguridad para auditoría y monitoreo
 */

export enum SecurityEventType {
  // Autenticación
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  
  // Autorización
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_BLOCKED = 'RATE_LIMIT_BLOCKED',
  
  // Sanitización
  SANITIZATION_WARNING = 'SANITIZATION_WARNING',
  SANITIZATION_ERROR = 'SANITIZATION_ERROR',
  MALICIOUS_INPUT_DETECTED = 'MALICIOUS_INPUT_DETECTED',
  
  // SQL Injection
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  
  // XSS
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  
  // Otros
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE'
}

export enum SecurityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface SecurityLogEntry {
  id: string
  timestamp: number
  eventType: SecurityEventType
  level: SecurityLevel
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  method?: string
  message: string
  details?: Record<string, any>
  metadata?: Record<string, any>
}

export interface SecurityLoggerConfig {
  enableConsoleLogging?: boolean
  enableFileLogging?: boolean
  logFilePath?: string
  maxLogFileSize?: number
  maxLogFiles?: number
  enableRemoteLogging?: boolean
  remoteEndpoint?: string
  batchSize?: number
  flushInterval?: number
}

class SecurityLogger {
  private config: Required<SecurityLoggerConfig>
  private logBuffer: SecurityLogEntry[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(config: SecurityLoggerConfig = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableFileLogging: false,
      logFilePath: './logs/security.log',
      maxLogFileSize: 10 * 1024 * 1024, // 10MB
      maxLogFiles: 5,
      enableRemoteLogging: false,
      remoteEndpoint: '',
      batchSize: 100,
      flushInterval: 30000, // 30 segundos
      ...config
    }

    // Configurar flush automático
    if (this.config.enableRemoteLogging) {
      this.flushTimer = setInterval(() => {
        this.flush()
      }, this.config.flushInterval)
    }
  }

  /**
   * Registra un evento de seguridad
   */
  log(
    eventType: SecurityEventType,
    level: SecurityLevel,
    message: string,
    details?: Record<string, any>,
    metadata?: {
      userId?: string
      sessionId?: string
      ipAddress?: string
      userAgent?: string
      endpoint?: string
      method?: string
    }
  ): void {
    const logEntry: SecurityLogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      eventType,
      level,
      message,
      details,
      metadata,
      ...metadata
    }

    // Logging a consola
    if (this.config.enableConsoleLogging) {
      this.logToConsole(logEntry)
    }

    // Agregar al buffer
    this.logBuffer.push(logEntry)

    // Flush si el buffer está lleno
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flush()
    }
  }

  /**
   * Registra un evento de autenticación
   */
  logAuth(
    eventType: SecurityEventType.LOGIN_SUCCESS | SecurityEventType.LOGIN_FAILED | SecurityEventType.LOGOUT | SecurityEventType.REGISTRATION_SUCCESS | SecurityEventType.REGISTRATION_FAILED,
    userId: string,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>
  ): void {
    const level = eventType.includes('FAILED') ? SecurityLevel.MEDIUM : SecurityLevel.LOW
    const message = this.getAuthMessage(eventType, userId)
    
    this.log(eventType, level, message, details, {
      userId,
      ipAddress,
      userAgent
    })
  }

  /**
   * Registra un evento de autorización
   */
  logAuthorization(
    eventType: SecurityEventType.ACCESS_GRANTED | SecurityEventType.ACCESS_DENIED | SecurityEventType.PERMISSION_DENIED,
    userId: string,
    resource: string,
    action: string,
    ipAddress?: string
  ): void {
    const level = eventType === SecurityEventType.ACCESS_DENIED ? SecurityLevel.MEDIUM : SecurityLevel.LOW
    const message = `${eventType}: Usuario ${userId} ${eventType === SecurityEventType.ACCESS_GRANTED ? 'accedió a' : 'fue denegado el acceso a'} ${resource} (${action})`
    
    this.log(eventType, level, message, { resource, action }, {
      userId,
      ipAddress
    })
  }

  /**
   * Registra un evento de rate limiting
   */
  logRateLimit(
    eventType: SecurityEventType.RATE_LIMIT_EXCEEDED | SecurityEventType.RATE_LIMIT_BLOCKED,
    identifier: string,
    attempts: number,
    ipAddress?: string
  ): void {
    const level = SecurityLevel.MEDIUM
    const message = `${eventType}: Identificador ${identifier} excedió el límite de velocidad (${attempts} intentos)`
    
    this.log(eventType, level, message, { identifier, attempts }, {
      ipAddress
    })
  }

  /**
   * Registra un evento de sanitización
   */
  logSanitization(
    eventType: SecurityEventType.SANITIZATION_WARNING | SecurityEventType.SANITIZATION_ERROR | SecurityEventType.MALICIOUS_INPUT_DETECTED,
    input: string,
    sanitizedInput: string,
    errors: string[],
    userId?: string,
    ipAddress?: string
  ): void {
    const level = eventType === SecurityEventType.MALICIOUS_INPUT_DETECTED ? SecurityLevel.HIGH : SecurityLevel.MEDIUM
    const message = `${eventType}: Input sanitizado - ${errors.join(', ')}`
    
    this.log(eventType, level, message, {
      originalInput: input.substring(0, 100), // Limitar longitud para logs
      sanitizedInput: sanitizedInput.substring(0, 100),
      errors
    }, {
      userId,
      ipAddress
    })
  }

  /**
   * Registra un intento de SQL injection
   */
  logSQLInjection(
    input: string,
    userId?: string,
    ipAddress?: string,
    endpoint?: string
  ): void {
    const message = `Intento de SQL injection detectado`
    
    this.log(SecurityEventType.SQL_INJECTION_ATTEMPT, SecurityLevel.HIGH, message, {
      maliciousInput: input.substring(0, 200),
      endpoint
    }, {
      userId,
      ipAddress,
      endpoint
    })
  }

  /**
   * Registra un intento de XSS
   */
  logXSSAttempt(
    input: string,
    userId?: string,
    ipAddress?: string,
    endpoint?: string
  ): void {
    const message = `Intento de XSS detectado`
    
    this.log(SecurityEventType.XSS_ATTEMPT, SecurityLevel.HIGH, message, {
      maliciousInput: input.substring(0, 200),
      endpoint
    }, {
      userId,
      ipAddress,
      endpoint
    })
  }

  /**
   * Registra actividad sospechosa
   */
  logSuspiciousActivity(
    activity: string,
    details: Record<string, any>,
    userId?: string,
    ipAddress?: string
  ): void {
    const message = `Actividad sospechosa detectada: ${activity}`
    
    this.log(SecurityEventType.SUSPICIOUS_ACTIVITY, SecurityLevel.HIGH, message, details, {
      userId,
      ipAddress
    })
  }

  /**
   * Registra un error del sistema
   */
  logSystemError(
    error: Error,
    context?: string,
    userId?: string
  ): void {
    const message = `Error del sistema${context ? ` en ${context}` : ''}: ${error.message}`
    
    this.log(SecurityEventType.SYSTEM_ERROR, SecurityLevel.MEDIUM, message, {
      error: error.message,
      stack: error.stack,
      context
    }, {
      userId
    })
  }

  /**
   * Obtiene logs por criterios
   */
  getLogs(filters?: {
    eventType?: SecurityEventType
    level?: SecurityLevel
    userId?: string
    startTime?: number
    endTime?: number
    limit?: number
  }): SecurityLogEntry[] {
    let filteredLogs = [...this.logBuffer]

    if (filters) {
      if (filters.eventType) {
        filteredLogs = filteredLogs.filter(log => log.eventType === filters.eventType)
      }
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level)
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
      }
      if (filters.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime!)
      }
      if (filters.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime!)
      }
    }

    // Ordenar por timestamp descendente
    filteredLogs.sort((a, b) => b.timestamp - a.timestamp)

    // Aplicar límite
    if (filters?.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit)
    }

    return filteredLogs
  }

  /**
   * Obtiene estadísticas de seguridad
   */
  getSecurityStats(timeRange?: { start: number; end: number }): {
    totalEvents: number
    eventsByType: Record<SecurityEventType, number>
    eventsByLevel: Record<SecurityLevel, number>
    topUsers: Array<{ userId: string; count: number }>
    topIPs: Array<{ ipAddress: string; count: number }>
  } {
    let logs = this.logBuffer

    if (timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
      )
    }

    const eventsByType = {} as Record<SecurityEventType, number>
    const eventsByLevel = {} as Record<SecurityLevel, number>
    const userCounts = new Map<string, number>()
    const ipCounts = new Map<string, number>()

    for (const log of logs) {
      // Contar por tipo
      eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1
      
      // Contar por nivel
      eventsByLevel[log.level] = (eventsByLevel[log.level] || 0) + 1
      
      // Contar usuarios
      if (log.userId) {
        userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1)
      }
      
      // Contar IPs
      if (log.ipAddress) {
        ipCounts.set(log.ipAddress, (ipCounts.get(log.ipAddress) || 0) + 1)
      }
    }

    return {
      totalEvents: logs.length,
      eventsByType,
      eventsByLevel,
      topUsers: Array.from(userCounts.entries())
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topIPs: Array.from(ipCounts.entries())
        .map(([ipAddress, count]) => ({ ipAddress, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }
  }

  /**
   * Limpia logs antiguos
   */
  cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): void { // 7 días por defecto
    const cutoff = Date.now() - maxAge
    this.logBuffer = this.logBuffer.filter(log => log.timestamp > cutoff)
  }

  /**
   * Envía logs al servidor remoto
   */
  private async flush(): Promise<void> {
    if (!this.config.enableRemoteLogging || this.logBuffer.length === 0) {
      return
    }

    try {
      const logsToSend = [...this.logBuffer]
      this.logBuffer = []

      // Aquí implementarías el envío a tu servicio de logging remoto
      // Por ejemplo, a un endpoint de tu API o servicio como LogRocket, Sentry, etc.
      console.log(`[SECURITY-LOGGER] Enviando ${logsToSend.length} logs al servidor remoto`)
      
      // Ejemplo de implementación:
      // await fetch(this.config.remoteEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ logs: logsToSend })
      // })

    } catch (error) {
      console.error('[SECURITY-LOGGER] Error enviando logs remotos:', error)
      // Re-agregar logs al buffer si falla el envío
      this.logBuffer.unshift(...this.logBuffer)
    }
  }

  /**
   * Logging a consola con formato
   */
  private logToConsole(entry: SecurityLogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString()
    const levelColor = this.getLevelColor(entry.level)
    
    console.log(
      `[${timestamp}] ${levelColor}[${entry.level}]${'\x1b[0m'} ` +
      `${'\x1b[36m'}[${entry.eventType}]${'\x1b[0m'} ` +
      `${entry.message}`
    )

    if (entry.details) {
      console.log('  Details:', entry.details)
    }

    if (entry.userId || entry.ipAddress) {
      console.log('  Context:', {
        userId: entry.userId,
        ipAddress: entry.ipAddress,
        endpoint: entry.endpoint
      })
    }
  }

  /**
   * Obtiene color para el nivel de log
   */
  private getLevelColor(level: SecurityLevel): string {
    switch (level) {
      case SecurityLevel.LOW: return '\x1b[32m' // Verde
      case SecurityLevel.MEDIUM: return '\x1b[33m' // Amarillo
      case SecurityLevel.HIGH: return '\x1b[35m' // Magenta
      case SecurityLevel.CRITICAL: return '\x1b[31m' // Rojo
      default: return '\x1b[0m' // Sin color
    }
  }

  /**
   * Genera ID único para el log
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtiene mensaje para eventos de autenticación
   */
  private getAuthMessage(eventType: SecurityEventType, userId: string): string {
    switch (eventType) {
      case SecurityEventType.LOGIN_SUCCESS:
        return `Login exitoso para usuario ${userId}`
      case SecurityEventType.LOGIN_FAILED:
        return `Intento de login fallido para usuario ${userId}`
      case SecurityEventType.LOGOUT:
        return `Logout del usuario ${userId}`
      case SecurityEventType.REGISTRATION_SUCCESS:
        return `Registro exitoso para usuario ${userId}`
      case SecurityEventType.REGISTRATION_FAILED:
        return `Intento de registro fallido para usuario ${userId}`
      default:
        return `Evento de autenticación: ${eventType}`
    }
  }

  /**
   * Destruye el logger y limpia recursos
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
  }
}

// Instancia global del logger
export const securityLogger = new SecurityLogger({
  enableConsoleLogging: true,
  enableFileLogging: false,
  enableRemoteLogging: false
})

/**
 * Hook para usar el logger en componentes React
 */
export function useSecurityLogger() {
  return {
    log: securityLogger.log.bind(securityLogger),
    logAuth: securityLogger.logAuth.bind(securityLogger),
    logAuthorization: securityLogger.logAuthorization.bind(securityLogger),
    logRateLimit: securityLogger.logRateLimit.bind(securityLogger),
    logSanitization: securityLogger.logSanitization.bind(securityLogger),
    logSQLInjection: securityLogger.logSQLInjection.bind(securityLogger),
    logXSSAttempt: securityLogger.logXSSAttempt.bind(securityLogger),
    logSuspiciousActivity: securityLogger.logSuspiciousActivity.bind(securityLogger),
    logSystemError: securityLogger.logSystemError.bind(securityLogger),
    getLogs: securityLogger.getLogs.bind(securityLogger),
    getStats: securityLogger.getSecurityStats.bind(securityLogger)
  }
}
