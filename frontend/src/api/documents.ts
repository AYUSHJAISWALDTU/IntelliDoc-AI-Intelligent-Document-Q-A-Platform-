import apiClient from './client'
import type { Document } from '@/types/models'

export const documentsApi = {
  list: (spaceId: string) =>
    apiClient.get<Document[]>(`/spaces/${spaceId}/documents`).then((r) => r.data),

  get: (spaceId: string, docId: string) =>
    apiClient.get<Document>(`/spaces/${spaceId}/documents/${docId}`).then((r) => r.data),

  upload: (spaceId: string, file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<Document>(`/spaces/${spaceId}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total))
          }
        },
      })
      .then((r) => r.data)
  },

  delete: (spaceId: string, docId: string) =>
    apiClient.delete(`/spaces/${spaceId}/documents/${docId}`).then((r) => r.data),

  getSuggestions: (spaceId: string, docId: string) =>
    apiClient.get<string[]>(`/spaces/${spaceId}/documents/${docId}/suggestions`).then((r) => r.data),
}
