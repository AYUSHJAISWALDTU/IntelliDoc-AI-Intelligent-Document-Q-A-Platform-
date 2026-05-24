import apiClient from './client'
import type { User } from '@/types/models'

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const authApi = {
  signup: (email: string, password: string, name: string) =>
    apiClient.post<TokenResponse>('/auth/signup', { email, password, name }).then((r) => r.data),

  login: (email: string, password: string) =>
    apiClient.post<TokenResponse>('/auth/login', { email, password }).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),

  getProfile: () => apiClient.get<User>('/settings/profile').then((r) => r.data),
}
