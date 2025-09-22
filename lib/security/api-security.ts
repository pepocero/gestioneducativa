/**
 * Middleware de Seguridad para API Routes
 * Proporciona protección contra ataques comunes en endpoints de API
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter, RATE_LIMIT_CONFIGS, getClientIP } from '@/lib/security/rate-limiting'
import { securityLogger, SecurityEventType, SecurityLevel } from '@/lib/security/security-logger'
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitization'

export interface SecurityMiddlewareConfig {
  enableRateLimit?: boolean
  enableLogging?: boolean
  enableSanitization?: boolean
  rateLimitConfig?: keyof typeof RATE_LIMIT_CONFIGS
  customRateLimit?: {
    maxAttempts: number
    windowMs: number
    blockDurationMs?: number
  }
  allowedMethods?: string[]
  requireAuth?: boolean
}

export interface SecurityContext {
  ipAddress: string
  userAgent: string
  userId?: string
  sessionId?: string
}

/**
 * Middleware principal de seguridad
 */
export function createSecurityMiddleware(config: SecurityMiddlewareConfig = {}) {
  const {
    enableRateLimit = true,
    enableLogging = true,
    enableSanitization = true,
    rateLimitConfig = 'api',
    customRateLimit,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
    requireAuth = false
  } = config

  return async function securityMiddleware(
    request: NextRequest,
    context: SecurityContext
  ): Promise<NextResponse | null> {
    const { ipAddress, userAgent, userId, sessionId } = context
    const method = request.method
    const url = request.url
    const endpoint = new URL(url).pathname

    try {
      // 1. Verificar método HTTP permitido
      if (!allowedMethods.includes(method)) {
        if (enableLogging) {
          securityLogger.log(
            SecurityEventType.ACCESS_DENIED,
            SecurityLevel.MEDIUM,
            `Método HTTP no permitido: ${method}`,
            { method, endpoint },
            { userId, ipAddress, userAgent, endpoint, method }
          )
        }

        return NextResponse.json(
          { error: 'Método no permitido' },
          { status: 405 }
        )
      }

      // 2. Rate Limiting
      if (enableRateLimit) {
        const identifier = userId 
          ? `user:${userId}` 
          : `ip:${ipAddress}`

        const limitConfig = customRateLimit || RATE_LIMIT_CONFIGS[rateLimitConfig]
        const rateLimitResult = rateLimiter.checkLimit(identifier, limitConfig)

        if (!rateLimitResult.allowed) {
          if (enableLogging) {
            securityLogger.logRateLimit(
              SecurityEventType.RATE_LIMIT_EXCEEDED,
              identifier,
              rateLimitResult.remainingAttempts,
              ipAddress
            )
          }

          const response = NextResponse.json(
            { 
              error: 'Demasiadas solicitudes',
              retryAfter: rateLimitResult.retryAfter,
              resetTime: rateLimitResult.resetTime
            },
            { status: 429 }
          )

          // Agregar headers de rate limit
          response.headers.set('X-RateLimit-Limit', limitConfig.maxAttempts.toString())
          response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingAttempts.toString())
          response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
          
          if (rateLimitResult.retryAfter) {
            response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())
          }

          return response
        }
      }

      // 3. Logging de acceso
      if (enableLogging) {
        securityLogger.log(
          SecurityEventType.ACCESS_GRANTED,
          SecurityLevel.LOW,
          `Acceso a endpoint ${endpoint}`,
          { method, endpoint },
          { userId, ipAddress, userAgent, endpoint, method }
        )
      }

      // 4. Sanitización de parámetros de URL
      if (enableSanitization) {
        const urlObj = new URL(url)
        const searchParams = urlObj.searchParams
        const entries = Array.from(searchParams.entries())
        
        for (const [key, value] of entries) {
          const sanitized = sanitizeString(value, { maxLength: 1000 })
          if (!sanitized.isValid) {
            if (enableLogging) {
              securityLogger.logSanitization(
                SecurityEventType.SANITIZATION_ERROR,
                value,
                sanitized.sanitizedValue,
                sanitized.errors,
                userId,
                ipAddress
              )
            }

            return NextResponse.json(
              { error: 'Parámetros de URL inválidos' },
              { status: 400 }
            )
          }
        }
      }

      // 5. Verificación de autenticación (si es requerida)
      if (requireAuth && !userId) {
        if (enableLogging) {
          securityLogger.log(
            SecurityEventType.ACCESS_DENIED,
            SecurityLevel.MEDIUM,
            `Acceso denegado - autenticación requerida para ${endpoint}`,
            { endpoint },
            { ipAddress, userAgent, endpoint, method }
          )
        }

        return NextResponse.json(
          { error: 'Autenticación requerida' },
          { status: 401 }
        )
      }

      // Si todo está bien, continuar con la siguiente función
      return null

    } catch (error) {
      if (enableLogging) {
        securityLogger.logSystemError(
          error as Error,
          `Middleware de seguridad para ${endpoint}`,
          userId
        )
      }

      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware específico para endpoints de autenticación
 */
export const authSecurityMiddleware = createSecurityMiddleware({
  enableRateLimit: true,
  enableLogging: true,
  enableSanitization: true,
  rateLimitConfig: 'login',
  allowedMethods: ['POST'],
  requireAuth: false
})

/**
 * Middleware específico para endpoints de registro
 */
export const registerSecurityMiddleware = createSecurityMiddleware({
  enableRateLimit: true,
  enableLogging: true,
  enableSanitization: true,
  rateLimitConfig: 'register',
  allowedMethods: ['POST'],
  requireAuth: false
})

/**
 * Middleware específico para endpoints de formularios
 */
export const formSecurityMiddleware = createSecurityMiddleware({
  enableRateLimit: true,
  enableLogging: true,
  enableSanitization: true,
  rateLimitConfig: 'forms',
  allowedMethods: ['POST', 'PUT'],
  requireAuth: true
})

/**
 * Middleware específico para endpoints de API generales
 */
export const apiSecurityMiddleware = createSecurityMiddleware({
  enableRateLimit: true,
  enableLogging: true,
  enableSanitization: true,
  rateLimitConfig: 'api',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  requireAuth: true
})

/**
 * Función helper para extraer contexto de seguridad de la request
 */
export function extractSecurityContext(request: NextRequest): SecurityContext {
  const ipAddress = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Extraer información de autenticación si está disponible
  const authHeader = request.headers.get('authorization')
  const sessionCookie = request.cookies.get('session')?.value
  
  // En un caso real, aquí verificarías el token JWT o la sesión
  let userId: string | undefined
  let sessionId: string | undefined
  
  if (authHeader?.startsWith('Bearer ')) {
    // Verificar JWT token aquí
    // const token = authHeader.substring(7)
    // const decoded = verifyJWT(token)
    // userId = decoded.userId
  }
  
  if (sessionCookie) {
    sessionId = sessionCookie
  }

  return {
    ipAddress,
    userAgent,
    userId,
    sessionId
  }
}

/**
 * Función helper para sanitizar el body de la request
 */
export async function sanitizeRequestBody(request: NextRequest): Promise<{
  isValid: boolean
  sanitizedData: any
  errors: string[]
}> {
  try {
    const body = await request.json()
    
    // Sanitizar campos comunes
    const sanitizedData = { ...body }
    const errors: string[] = []

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        if (key.toLowerCase().includes('email')) {
          const result = sanitizeEmail(value)
          if (!result.isValid) {
            errors.push(...result.errors)
          }
          sanitizedData[key] = result.sanitizedValue
        } else {
          const result = sanitizeString(value, { maxLength: 1000 })
          if (!result.isValid) {
            errors.push(...result.errors)
          }
          sanitizedData[key] = result.sanitizedValue
        }
      }
    }

    return {
      isValid: errors.length === 0,
      sanitizedData,
      errors
    }
  } catch (error) {
    return {
      isValid: false,
      sanitizedData: null,
      errors: ['Error procesando el body de la request']
    }
  }
}

/**
 * Wrapper para API routes que aplica seguridad automáticamente
 */
export function withSecurity(
  handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>,
  config: SecurityMiddlewareConfig = {}
) {
  const middleware = createSecurityMiddleware(config)

  return async function securedHandler(request: NextRequest): Promise<NextResponse> {
    const context = extractSecurityContext(request)
    
    // Aplicar middleware de seguridad
    const middlewareResponse = await middleware(request, context)
    if (middlewareResponse) {
      return middlewareResponse
    }

    // Si el middleware pasa, ejecutar el handler original
    try {
      return await handler(request, context)
    } catch (error) {
      securityLogger.logSystemError(
        error as Error,
        `Handler de API ${new URL(request.url).pathname}`,
        context.userId
      )

      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
  }
}
