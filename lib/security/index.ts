/**
 * Índice de Módulos de Seguridad
 * Exporta todas las funcionalidades de seguridad del sistema
 */

// Sanitización
export {
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeObject,
  FIELD_CONFIGS,
  type SanitizationOptions,
  type ValidationResult
} from './sanitization'

// Rate Limiting
export {
  rateLimiter,
  useRateLimit,
  generateIdentifier,
  getClientIP,
  RATE_LIMIT_CONFIGS,
  type RateLimitConfig,
  type RateLimitResult
} from './rate-limiting'

// Security Logger
export {
  securityLogger,
  useSecurityLogger,
  SecurityEventType,
  SecurityLevel,
  type SecurityLogEntry
} from './security-logger'

// Security Form Hook
export {
  useSecurityForm,
  useBasicSecurityForm,
  type SecurityFormConfig,
  type SecurityFormResult
} from './use-security-form'

// API Security Middleware
export {
  createSecurityMiddleware,
  authSecurityMiddleware,
  registerSecurityMiddleware,
  formSecurityMiddleware,
  apiSecurityMiddleware,
  extractSecurityContext,
  sanitizeRequestBody,
  withSecurity,
  type SecurityMiddlewareConfig,
  type SecurityContext
} from './api-security'
