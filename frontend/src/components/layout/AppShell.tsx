import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { DocumentPanel } from './DocumentPanel'
import { Toaster } from 'sonner'

export function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </main>
        <DocumentPanel />
      </div>
      <Toaster position="bottom-right" richColors theme="system" />
    </div>
  )
}
