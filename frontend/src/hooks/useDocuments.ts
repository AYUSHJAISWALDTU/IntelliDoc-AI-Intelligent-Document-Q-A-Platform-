import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '@/api/documents'
import { toast } from 'sonner'
import { extractApiError } from '@/lib/utils'
import { useState } from 'react'

export function useDocuments(spaceId: string) {
  const qc = useQueryClient()

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', spaceId],
    queryFn: () => documentsApi.list(spaceId),
    enabled: !!spaceId,
  })

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) =>
      documentsApi.upload(spaceId, file, (pct) => {
        setUploadProgress((p) => ({ ...p, [file.name]: pct }))
      }),
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ['documents', spaceId] })
      qc.invalidateQueries({ queryKey: ['spaces'] })
      toast.success(`${doc.file_name} uploaded — processing started`)
    },
    onError: (err) => toast.error(extractApiError(err)),
    onSettled: (_, __, { file }) => {
      setUploadProgress((p) => {
        const next = { ...p }
        delete next[file.name]
        return next
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => documentsApi.delete(spaceId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', spaceId] })
      qc.invalidateQueries({ queryKey: ['spaces'] })
      toast.success('Document deleted')
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  return {
    documents,
    isLoading,
    uploadDocument: (file: File) => uploadMutation.mutate({ file }),
    deleteDocument: deleteMutation.mutate,
    uploadProgress,
    isUploading: uploadMutation.isPending,
  }
}
