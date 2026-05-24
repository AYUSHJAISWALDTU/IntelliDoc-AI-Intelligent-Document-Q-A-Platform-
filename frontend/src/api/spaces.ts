import apiClient from './client'
import type { Space } from '@/types/models'

export const spacesApi = {
  list: () => apiClient.get<Space[]>('/spaces').then((r) => r.data),

  get: (id: string) => apiClient.get<Space>(`/spaces/${id}`).then((r) => r.data),

  create: (data: { name: string; description?: string; color?: string; icon?: string }) =>
    apiClient.post<Space>('/spaces', data).then((r) => r.data),

  update: (id: string, data: Partial<{ name: string; description: string; color: string; icon: string }>) =>
    apiClient.patch<Space>(`/spaces/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/spaces/${id}`).then((r) => r.data),
}
