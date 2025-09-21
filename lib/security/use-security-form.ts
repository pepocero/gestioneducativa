/**
 * Hook de Seguridad para Formularios
 * Integra sanitización, rate limiting y logging en formularios React
 */

import { useState, useCallback, useRef } from 'react'
import { 
  sanitizeString, 
  sanitizeEmail, 
  sanitizeNumber, 
  sanitizeObject, 
  FIELD_CONFIGS,
  type SanitizationOptions,
  type ValidationResult 
} from './sanitization'
import { 
  useRateLimit, 
  generateIdentifier, 
  RATE_LIMIT_CONFIGS 
} from './rate-limiting'
import { 
  useSecurityLogger, 
  SecurityEventType, 
  SecurityLevel 
} from './security-logger'

export interface SecurityFormConfig {
  formType: 'login' | 'register' | 'forms' | 'api'
  enableSanitization?: boolean
  enableRateLimit?: boolean
  enableLogging?: boolean
  customFieldConfigs?: Record<string, SanitizationOptions>
  userId?: string
  ipAddress?: string
}

export interface SecurityFormResult<T> {
  isValid: boolean
  sanitizedData: T
  errors: Record<string, string[]>
  warnings: Record<string, string[]>
  rateLimitInfo?: {
    allowed: boolean
    remainingAttempts: number
    resetTime: number
    retryAfter?: number
  }
}

export function useSecurityForm<T extends Record<string, any>>(
  config: SecurityFormConfig
) {
  const {
    formType,
    enableSanitization = true,
    enableRateLimit = true,
    enableLogging = true,
    customFieldConfigs = {},
    userId,
    ipAddress
  } = config

  const [isProcessing, setIsProcessing] = useState(false)
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0)
  const submissionCountRef = useRef(0)

  // Inicializar rate limiter
  const rateLimitConfig = RATE_LIMIT_CONFIGS[formType]
  const { checkLimit, recordSuccess, recordFailure, getInfo } = useRateLimit(rateLimitConfig)
  
  // Inicializar logger
  const logger = useSecurityLogger()

  /**
   * Procesa y valida los datos del formulario
   */
  const processFormData = useCallback(async (
    formData: T,
    fieldMappings: Record<keyof T, string>
  ): Promise<SecurityFormResult<T>> => {
    setIsProcessing(true)
    submissionCountRef.current++

    const identifier = userId 
      ? generateIdentifier('user', userId) 
      : generateIdentifier('ip', ipAddress || 'unknown')

    try {
      // 1. Verificar rate limit
      let rateLimitInfo
      if (enableRateLimit) {
        const rateLimitResult = checkLimit(identifier)
        rateLimitInfo = {
          allowed: rateLimitResult.allowed,
          remainingAttempts: rateLimitResult.remainingAttempts,
          resetTime: rateLimitResult.resetTime,
          retryAfter: rateLimitResult.retryAfter
        }

        if (!rateLimitResult.allowed) {
          if (enableLogging) {
            logger.logRateLimit(
              SecurityEventType.RATE_LIMIT_EXCEEDED,
              identifier,
              submissionCountRef.current,
              ipAddress
            )
          }

          return {
            isValid: false,
            sanitizedData: formData,
            errors: {
              _rateLimit: [`Demasiados intentos. Intenta nuevamente en ${rateLimitResult.retryAfter} segundos.`]
            },
            warnings: {},
            rateLimitInfo
          }
        }
      }

      // 2. Sanitizar datos
      let sanitizedData = formData
      let errors: Record<string, string[]> = {}
      let warnings: Record<string, string[]> = {}

      if (enableSanitization) {
        const fieldConfig: Record<keyof T, SanitizationOptions> = {}
        
        // Configurar opciones de sanitización para cada campo
        for (const [fieldName, fieldType] of Object.entries(fieldMappings)) {
          const customConfig = customFieldConfigs[fieldName]
          const defaultConfig = FIELD_CONFIGS[fieldType as keyof typeof FIELD_CONFIGS]
          
          fieldConfig[fieldName as keyof T] = {
            ...defaultConfig,
            ...customConfig
          }
        }

        const sanitizationResult = sanitizeObject(formData, fieldConfig)
        sanitizedData = sanitizationResult.sanitizedData
        errors = sanitizationResult.errors
        warnings = sanitizationResult.warnings

        // Logging de sanitización
        if (enableLogging) {
          for (const [field, fieldErrors] of Object.entries(errors)) {
            if (fieldErrors.length > 0) {
              logger.logSanitization(
                SecurityEventType.SANITIZATION_ERROR,
                String(formData[field as keyof T]),
                String(sanitizedData[field as keyof T]),
                fieldErrors,
                userId,
                ipAddress
              )
            }
          }

          for (const [field, fieldWarnings] of Object.entries(warnings)) {
            if (fieldWarnings.length > 0) {
              logger.logSanitization(
                SecurityEventType.SANITIZATION_WARNING,
                String(formData[field as keyof T]),
                String(sanitizedData[field as keyof T]),
                fieldWarnings,
                userId,
                ipAddress
              )
            }
          }
        }
      }

      // 3. Validaciones adicionales específicas por tipo de formulario
      const additionalErrors = await performAdditionalValidations(formData, formType)
      Object.assign(errors, additionalErrors)

      // 4. Determinar si el formulario es válido
      const isValid = Object.keys(errors).length === 0

      // 5. Logging del resultado
      if (enableLogging) {
        if (isValid) {
          logger.log(
            SecurityEventType.ACCESS_GRANTED,
            SecurityLevel.LOW,
            `Formulario ${formType} procesado exitosamente`,
            { fieldCount: Object.keys(formData).length },
            { userId, ipAddress }
          )
        } else {
          logger.log(
            SecurityEventType.ACCESS_DENIED,
            SecurityLevel.MEDIUM,
            `Formulario ${formType} rechazado por errores de validación`,
            { errors: Object.keys(errors) },
            { userId, ipAddress }
          )
        }
      }

      // 6. Registrar en rate limiter
      if (enableRateLimit) {
        if (isValid) {
          recordSuccess(identifier)
        } else {
          recordFailure(identifier)
        }
      }

      setLastSubmissionTime(Date.now())

      return {
        isValid,
        sanitizedData,
        errors,
        warnings,
        rateLimitInfo
      }

    } catch (error) {
      // Logging de errores del sistema
      if (enableLogging) {
        logger.logSystemError(
          error as Error,
          `Procesamiento de formulario ${formType}`,
          userId
        )
      }

      return {
        isValid: false,
        sanitizedData: formData,
        errors: {
          _system: ['Error interno del sistema. Intenta nuevamente.']
        },
        warnings: {}
      }
    } finally {
      setIsProcessing(false)
    }
  }, [
    formType,
    enableSanitization,
    enableRateLimit,
    enableLogging,
    customFieldConfigs,
    userId,
    ipAddress,
    checkLimit,
    recordSuccess,
    recordFailure,
    logger
  ])

  /**
   * Valida un campo individual
   */
  const validateField = useCallback((
    fieldName: string,
    value: any,
    fieldType: string
  ): ValidationResult => {
    const customConfig = customFieldConfigs[fieldName]
    const defaultConfig = FIELD_CONFIGS[fieldType as keyof typeof FIELD_CONFIGS]
    const config = { ...defaultConfig, ...customConfig }

    switch (fieldType) {
      case 'email':
        return sanitizeEmail(String(value))
      case 'number':
        return sanitizeNumber(value)
      default:
        return sanitizeString(String(value), config)
    }
  }, [customFieldConfigs])

  /**
   * Obtiene información del rate limit actual
   */
  const getRateLimitInfo = useCallback(() => {
    if (!enableRateLimit) return null

    const identifier = userId 
      ? generateIdentifier('user', userId) 
      : generateIdentifier('ip', ipAddress || 'unknown')

    return getInfo(identifier)
  }, [enableRateLimit, userId, ipAddress, getInfo])

  /**
   * Resetea el rate limit para el usuario/IP actual
   */
  const resetRateLimit = useCallback(() => {
    if (!enableRateLimit) return

    const identifier = userId 
      ? generateIdentifier('user', userId) 
      : generateIdentifier('ip', ipAddress || 'unknown')

    // Implementar reset si está disponible en el hook
    // reset(identifier)
  }, [enableRateLimit, userId, ipAddress])

  return {
    processFormData,
    validateField,
    getRateLimitInfo,
    resetRateLimit,
    isProcessing,
    submissionCount: submissionCountRef.current,
    lastSubmissionTime
  }
}

/**
 * Realiza validaciones adicionales específicas por tipo de formulario
 */
async function performAdditionalValidations<T>(
  formData: T,
  formType: string
): Promise<Record<string, string[]>> {
  const errors: Record<string, string[]> = {}

  switch (formType) {
    case 'login':
      // Validaciones específicas para login
      if ('email' in formData && 'password' in formData) {
        const email = String(formData.email)
        const password = String(formData.password)

        if (password.length < 6) {
          errors.password = ['La contraseña debe tener al menos 6 caracteres']
        }

        if (!email.includes('@')) {
          errors.email = ['Formato de email inválido']
        }
      }
      break

    case 'register':
      // Validaciones específicas para registro
      if ('password' in formData && 'confirmPassword' in formData) {
        const password = String(formData.password)
        const confirmPassword = String(formData.confirmPassword)

        if (password !== confirmPassword) {
          errors.confirmPassword = ['Las contraseñas no coinciden']
        }

        if (password.length < 8) {
          errors.password = ['La contraseña debe tener al menos 8 caracteres']
        }
      }
      break

    case 'forms':
      // Validaciones generales para formularios
      for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string' && value.length > 1000) {
          errors[key] = ['El campo es demasiado largo']
        }
      }
      break
  }

  return errors
}

/**
 * Hook simplificado para formularios básicos
 */
export function useBasicSecurityForm<T extends Record<string, any>>(
  formType: 'login' | 'register' | 'forms' = 'forms',
  userId?: string
) {
  return useSecurityForm<T>({
    formType,
    enableSanitization: true,
    enableRateLimit: true,
    enableLogging: true,
    userId,
    ipAddress: typeof window !== 'undefined' ? 'client-side' : undefined
  })
}
