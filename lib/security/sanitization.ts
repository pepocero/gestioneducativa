/**
 * Módulo de Sanitización de Seguridad
 * Proporciona funciones para limpiar y validar datos de entrada
 */

// Patrones de caracteres peligrosos
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Scripts
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, // Iframes
  /javascript:/gi, // JavaScript URLs
  /on\w+\s*=/gi, // Event handlers
  /<[^>]*>/g, // HTML tags básicos
]

// Caracteres especiales que pueden ser problemáticos
const SPECIAL_CHARS = /[<>'"&]/g

// Patrones de SQL injection básicos
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /(UNION\s+SELECT)/gi,
  /(DROP\s+TABLE)/gi,
  /(INSERT\s+INTO)/gi,
  /(DELETE\s+FROM)/gi,
]

export interface SanitizationOptions {
  maxLength?: number
  allowHtml?: boolean
  allowSpecialChars?: boolean
  strictMode?: boolean
}

export interface ValidationResult {
  isValid: boolean
  sanitizedValue: string
  errors: string[]
  warnings: string[]
}

/**
 * Sanitiza una cadena de texto eliminando caracteres peligrosos
 */
export function sanitizeString(
  input: string, 
  options: SanitizationOptions = {}
): ValidationResult {
  const {
    maxLength = 255,
    allowHtml = false,
    allowSpecialChars = false,
    strictMode = false
  } = options

  const errors: string[] = []
  const warnings: string[] = []
  let sanitizedValue = input

  // Validar entrada
  if (typeof input !== 'string') {
    return {
      isValid: false,
      sanitizedValue: '',
      errors: ['El input debe ser una cadena de texto'],
      warnings: []
    }
  }

  // Limpiar espacios en blanco
  sanitizedValue = sanitizedValue.trim()

  // Verificar longitud máxima
  if (sanitizedValue.length > maxLength) {
    warnings.push(`El texto excede la longitud máxima de ${maxLength} caracteres`)
    sanitizedValue = sanitizedValue.substring(0, maxLength)
  }

  // Detectar patrones peligrosos
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitizedValue)) {
      errors.push('Se detectó contenido potencialmente peligroso')
      sanitizedValue = sanitizedValue.replace(pattern, '')
    }
  }

  // Detectar intentos de SQL injection
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(sanitizedValue)) {
      errors.push('Se detectó un posible intento de inyección SQL')
      sanitizedValue = sanitizedValue.replace(pattern, '')
    }
  }

  // Remover HTML si no está permitido
  if (!allowHtml) {
    sanitizedValue = sanitizedValue.replace(/<[^>]*>/g, '')
  }

  // Remover caracteres especiales si no están permitidos
  if (!allowSpecialChars) {
    sanitizedValue = sanitizedValue.replace(SPECIAL_CHARS, '')
  }

  // Modo estricto: validaciones adicionales
  if (strictMode) {
    // Verificar caracteres de control
    if (/[\x00-\x1F\x7F]/.test(sanitizedValue)) {
      warnings.push('Se detectaron caracteres de control')
      sanitizedValue = sanitizedValue.replace(/[\x00-\x1F\x7F]/g, '')
    }

    // Verificar caracteres Unicode sospechosos
    if (/[\u200B-\u200D\uFEFF]/.test(sanitizedValue)) {
      warnings.push('Se detectaron caracteres Unicode invisibles')
      sanitizedValue = sanitizedValue.replace(/[\u200B-\u200D\uFEFF]/g, '')
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors,
    warnings
  }
}

/**
 * Sanitiza un email validando su formato
 */
export function sanitizeEmail(email: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      sanitizedValue: '',
      errors: ['Email es requerido'],
      warnings: []
    }
  }

  let sanitizedEmail = email.trim().toLowerCase()
  
  // Validar formato básico de email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(sanitizedEmail)) {
    errors.push('Formato de email inválido')
  }

  // Verificar longitud
  if (sanitizedEmail.length > 254) {
    errors.push('Email demasiado largo')
    sanitizedEmail = sanitizedEmail.substring(0, 254)
  }

  // Detectar caracteres peligrosos
  if (/[<>'"&]/.test(sanitizedEmail)) {
    errors.push('Email contiene caracteres no permitidos')
    sanitizedEmail = sanitizedEmail.replace(/[<>'"&]/g, '')
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: sanitizedEmail,
    errors,
    warnings
  }
}

/**
 * Sanitiza un número validando que sea numérico
 */
export function sanitizeNumber(input: string | number, min?: number, max?: number): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  let sanitizedValue: string | number = input

  // Convertir a número si es string
  if (typeof input === 'string') {
    const parsed = parseFloat(input)
    if (isNaN(parsed)) {
      return {
        isValid: false,
        sanitizedValue: 0,
        errors: ['El valor debe ser un número válido'],
        warnings: []
      }
    }
    sanitizedValue = parsed
  }

  // Validar rango mínimo
  if (min !== undefined && sanitizedValue < min) {
    errors.push(`El valor debe ser mayor o igual a ${min}`)
  }

  // Validar rango máximo
  if (max !== undefined && sanitizedValue > max) {
    errors.push(`El valor debe ser menor o igual a ${max}`)
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors,
    warnings
  }
}

/**
 * Sanitiza un objeto completo aplicando sanitización a cada campo
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldConfig: Record<keyof T, SanitizationOptions>
): { isValid: boolean; sanitizedData: T; errors: Record<string, string[]>; warnings: Record<string, string[]> } {
  const errors: Record<string, string[]> = {}
  const warnings: Record<string, string[]> = {}
  const sanitizedData = { ...obj }

  for (const [key, value] of Object.entries(obj)) {
    const config = fieldConfig[key as keyof T]
    if (config && typeof value === 'string') {
      const result = sanitizeString(value, config)
      sanitizedData[key as keyof T] = result.sanitizedValue as T[keyof T]
      
      if (result.errors.length > 0) {
        errors[key] = result.errors
      }
      if (result.warnings.length > 0) {
        warnings[key] = result.warnings
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    sanitizedData,
    errors,
    warnings
  }
}

/**
 * Configuraciones predefinidas para diferentes tipos de campos
 */
export const FIELD_CONFIGS = {
  name: { maxLength: 100, strictMode: true },
  email: { maxLength: 254, strictMode: true },
  phone: { maxLength: 20, allowSpecialChars: true },
  address: { maxLength: 500, allowSpecialChars: true },
  description: { maxLength: 1000, allowSpecialChars: true },
  notes: { maxLength: 2000, allowSpecialChars: true },
  password: { maxLength: 128, strictMode: true },
  url: { maxLength: 2048, allowSpecialChars: true },
  code: { maxLength: 20, strictMode: true },
  title: { maxLength: 200, strictMode: true }
} as const
