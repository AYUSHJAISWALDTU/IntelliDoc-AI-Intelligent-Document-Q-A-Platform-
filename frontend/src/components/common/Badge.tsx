import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  default: 'bg-gray-100 dark:bg-dark-elevated text-gray-600 dark:text-gray-400',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  error: 'bg-red-500/10 text-red-600 dark:text-red-400',
  info: 'bg-primary/10 text-primary',
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-medium',
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function DocStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    uploading: { variant: 'info', label: '⏫ Uploading' },
    processing: { variant: 'warning', label: '⏳ Processing' },
    ready: { variant: 'success', label: '✓ Ready' },
    failed: { variant: 'error', label: '✕ Failed' },
  }
  const config = map[status] || { variant: 'default', label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
