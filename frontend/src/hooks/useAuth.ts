import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { extractApiError } from '@/lib/utils'

export function useAuth() {
  const { user, isAuthenticated, setTokens, setUser, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()

  const { isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    onSuccess: setUser,
  } as Parameters<typeof useQuery>[0])

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      navigate('/dashboard')
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  const signupMutation = useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authApi.signup(email, password, name),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      navigate('/dashboard')
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch {}
    storeLogout()
    navigate('/login')
  }, [storeLogout, navigate])

  return {
    user,
    isAuthenticated,
    isLoading: profileLoading,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout,
    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending,
  }
}
