import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm'

    const variants = {
      primary: 'bg-primary hover:bg-primary-light text-white shadow-glow-sm hover:shadow-glow',
      secondary: 'bg-secondary hover:bg-secondary-dark text-white',
      ghost: 'hover:bg-dark-hover dark:hover:bg-dark-hover text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      outline: 'border border-gray-200 dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover text-gray-700 dark:text-gray-300',
    }

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
