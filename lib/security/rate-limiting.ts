/**
 * Módulo de Rate Limiting
 * Controla la frecuencia de solicitudes para prevenir ataques de fuerza bruta
 */

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs?: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lastAttempt: number
  blockedUntil?: number
}

export interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  resetTime: number
  retryAfter?: number
  reason?: string
}

// Configuraciones predefinidas para diferentes tipos de endpoints
export const RATE_LIMIT_CONFIGS = {
  // Login: máximo 5 intentos por 15 minutos
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 30 * 60 * 1000, // 30 minutos de bloqueo
    skipSuccessfulRequests: true
  },
  
  // Registro: máximo 3 intentos por hora
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas de bloqueo
  },
  
  // Formularios generales: máximo 10 intentos por 5 minutos
  forms: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000, // 5 minutos
    blockDurationMs: 15 * 60 * 1000, // 15 minutos de bloqueo
  },
  
  // API calls: máximo 100 intentos por minuto
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minuto
    skipSuccessfulRequests: true
  },
  
  // Password reset: máximo 3 intentos por hora
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 4 * 60 * 60 * 1000, // 4 horas de bloqueo
  }
} as const

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpiar entradas expiradas cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Verifica si una solicitud está permitida según el rate limit
   */
  checkLimit(
    identifier: string, 
    config: RateLimitConfig,
    success: boolean = false
  ): RateLimitResult {
    const now = Date.now()
    const entry = this.attempts.get(identifier) || {
      attempts: 0,
      firstAttempt: now,
      lastAttempt: now
    }

    // Verificar si está bloqueado
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: entry.blockedUntil,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
        reason: 'Rate limit exceeded - temporarily blocked'
      }
    }

    // Limpiar bloqueo si ha expirado
    if (entry.blockedUntil && now >= entry.blockedUntil) {
      entry.blockedUntil = undefined
    }

    // Verificar si la ventana de tiempo ha expirado
    if (now - entry.firstAttempt > config.windowMs) {
      // Resetear contador si la ventana ha expirado
      entry.attempts = 0
      entry.firstAttempt = now
    }

    // Incrementar contador si no es una solicitud exitosa que debemos omitir
    if (!(success && config.skipSuccessfulRequests)) {
      entry.attempts++
      entry.lastAttempt = now
    }

    // Verificar si se ha excedido el límite
    if (entry.attempts > config.maxAttempts) {
      // Aplicar bloqueo si está configurado
      if (config.blockDurationMs) {
        entry.blockedUntil = now + config.blockDurationMs
      }

      this.attempts.set(identifier, entry)

      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: entry.firstAttempt + config.windowMs,
        retryAfter: config.blockDurationMs ? Math.ceil(config.blockDurationMs / 1000) : undefined,
        reason: 'Rate limit exceeded'
      }
    }

    // Guardar entrada actualizada
    this.attempts.set(identifier, entry)

    return {
      allowed: true,
      remainingAttempts: Math.max(0, config.maxAttempts - entry.attempts),
      resetTime: entry.firstAttempt + config.windowMs,
      reason: undefined
    }
  }

  /**
   * Registra un intento exitoso
   */
  recordSuccess(identifier: string, config: RateLimitConfig): void {
    this.checkLimit(identifier, config, true)
  }

  /**
   * Registra un intento fallido
   */
  recordFailure(identifier: string, config: RateLimitConfig): void {
    this.checkLimit(identifier, config, false)
  }

  /**
   * Obtiene información del rate limit para un identificador
   */
  getLimitInfo(identifier: string, config: RateLimitConfig): RateLimitResult {
    const entry = this.attempts.get(identifier)
    if (!entry) {
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
        resetTime: Date.now() + config.windowMs
      }
    }

    const now = Date.now()
    
    // Verificar si está bloqueado
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: entry.blockedUntil,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
        reason: 'Rate limit exceeded - temporarily blocked'
      }
    }

    // Verificar si la ventana ha expirado
    if (now - entry.firstAttempt > config.windowMs) {
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
        resetTime: now + config.windowMs
      }
    }

    return {
      allowed: entry.attempts <= config.maxAttempts,
      remainingAttempts: Math.max(0, config.maxAttempts - entry.attempts),
      resetTime: entry.firstAttempt + config.windowMs
    }
  }

  /**
   * Limpia entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas

    for (const [key, entry] of this.attempts.entries()) {
      // Eliminar entradas muy antiguas
      if (now - entry.lastAttempt > maxAge) {
        this.attempts.delete(key)
      }
      // Eliminar entradas con bloqueo expirado
      else if (entry.blockedUntil && now >= entry.blockedUntil) {
        entry.blockedUntil = undefined
      }
    }
  }

  /**
   * Resetea el rate limit para un identificador específico
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * Obtiene estadísticas del rate limiter
   */
  getStats(): { totalEntries: number; blockedEntries: number } {
    const now = Date.now()
    let blockedEntries = 0

    for (const entry of this.attempts.values()) {
      if (entry.blockedUntil && now < entry.blockedUntil) {
        blockedEntries++
      }
    }

    return {
      totalEntries: this.attempts.size,
      blockedEntries
    }
  }

  /**
   * Destruye el rate limiter y limpia recursos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.attempts.clear()
  }
}

// Instancia global del rate limiter
export const rateLimiter = new RateLimiter()

/**
 * Hook para usar rate limiting en componentes React
 */
export function useRateLimit(config: RateLimitConfig) {
  const checkLimit = (identifier: string, success: boolean = false) => {
    return rateLimiter.checkLimit(identifier, config, success)
  }

  const recordSuccess = (identifier: string) => {
    rateLimiter.recordSuccess(identifier, config)
  }

  const recordFailure = (identifier: string) => {
    rateLimiter.recordFailure(identifier, config)
  }

  const reset = (identifier: string) => {
    rateLimiter.reset(identifier)
  }

  const getInfo = (identifier: string) => {
    return rateLimiter.getLimitInfo(identifier, config)
  }

  return {
    checkLimit,
    recordSuccess,
    recordFailure,
    reset,
    getInfo
  }
}

/**
 * Función helper para generar identificadores únicos
 */
export function generateIdentifier(type: string, value: string): string {
  return `${type}:${value}`
}

/**
 * Función helper para obtener IP del cliente (en contexto de servidor)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}
