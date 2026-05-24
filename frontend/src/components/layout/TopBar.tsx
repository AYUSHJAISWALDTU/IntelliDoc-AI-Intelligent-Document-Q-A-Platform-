import { useNavigate } from 'react-router-dom'
import { Brain, LogOut, Settings, User } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface z-30">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-display text-sm font-medium text-gray-900 dark:text-gray-100">
          IntelliDoc
        </span>
      </button>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="avatar" />
              ) : (
                <User className="w-3.5 h-3.5 text-primary" />
              )}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block max-w-[100px] truncate">
              {user?.name || user?.email}
            </span>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-9 bg-white dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg shadow-lg py-1 min-w-[160px] z-50">
              <button
                onClick={() => { navigate('/settings'); setShowMenu(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <hr className="my-1 border-light-border dark:border-dark-border" />
              <button
                onClick={() => { logout(); setShowMenu(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-2 text-red-500"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
