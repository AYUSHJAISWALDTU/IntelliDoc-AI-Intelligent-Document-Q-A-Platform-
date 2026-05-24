import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg text-center px-6">
      <p className="text-6xl mb-4">404</p>
      <h1 className="text-2xl font-display font-medium text-gray-900 dark:text-gray-100 mb-2">Page not found</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This page doesn't exist or you don't have access.</p>
      <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
    </div>
  )
}
