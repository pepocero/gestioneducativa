import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  }

  return (
    <span className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'enrolled' | 'dropped'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: 'success' as const, text: 'Activo' },
    inactive: { variant: 'default' as const, text: 'Inactivo' },
    pending: { variant: 'warning' as const, text: 'Pendiente' },
    completed: { variant: 'success' as const, text: 'Completado' },
    enrolled: { variant: 'info' as const, text: 'Inscrito' },
    dropped: { variant: 'danger' as const, text: 'Abandonado' },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  )
}

interface RoleBadgeProps {
  role: 'admin' | 'professor' | 'student'
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleConfig = {
    admin: { variant: 'danger' as const, text: 'Administrador' },
    professor: { variant: 'info' as const, text: 'Profesor' },
    student: { variant: 'default' as const, text: 'Estudiante' },
  }

  const config = roleConfig[role]

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  )
}
