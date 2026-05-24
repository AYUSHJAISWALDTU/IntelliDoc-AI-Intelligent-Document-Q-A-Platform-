import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: 'light' as const, icon: Sun },
    { value: 'system' as const, icon: Monitor },
    { value: 'dark' as const, icon: Moon },
  ]

  return (
    <div className="flex items-center gap-0.5 bg-light-elevated dark:bg-dark-elevated rounded-md p-0.5 border border-light-border dark:border-dark-border">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'p-1.5 rounded transition-all',
            theme === value
              ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}
