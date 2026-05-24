import apiClient from './client'
import type { Conversation, Message } from '@/types/models'

export const conversationsApi = {
  list: (spaceId: string) =>
    apiClient.get<Conversation[]>(`/spaces/${spaceId}/conversations`).then((r) => r.data),

  create: (spaceId: string, title?: string) =>
    apiClient.post<Conversation>(`/spaces/${spaceId}/conversations`, { title }).then((r) => r.data),

  update: (spaceId: string, convId: string, data: { title?: string; is_pinned?: boolean }) =>
    apiClient.patch<Conversation>(`/spaces/${spaceId}/conversations/${convId}`, data).then((r) => r.data),

  delete: (spaceId: string, convId: string) =>
    apiClient.delete(`/spaces/${spaceId}/conversations/${convId}`).then((r) => r.data),

  getMessages: (spaceId: string, convId: string) =>
    apiClient.get<Message[]>(`/spaces/${spaceId}/conversations/${convId}/messages`).then((r) => r.data),

  submitFeedback: (spaceId: string, convId: string, msgId: string, feedback: string) =>
    apiClient
      .post(`/spaces/${spaceId}/conversations/${convId}/messages/${msgId}/feedback`, { feedback })
      .then((r) => r.data),
}
