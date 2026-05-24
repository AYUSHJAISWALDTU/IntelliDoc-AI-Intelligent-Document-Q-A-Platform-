import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationsApi } from '@/api/conversations'
import { toast } from 'sonner'
import { extractApiError } from '@/lib/utils'

export function useConversations(spaceId: string) {
  const qc = useQueryClient()

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', spaceId],
    queryFn: () => conversationsApi.list(spaceId),
    enabled: !!spaceId,
  })

  const createMutation = useMutation({
    mutationFn: (title?: string) => conversationsApi.create(spaceId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations', spaceId] }),
    onError: (err) => toast.error(extractApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (convId: string) => conversationsApi.delete(spaceId, convId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations', spaceId] }),
    onError: (err) => toast.error(extractApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ convId, data }: { convId: string; data: { title?: string; is_pinned?: boolean } }) =>
      conversationsApi.update(spaceId, convId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations', spaceId] }),
    onError: (err) => toast.error(extractApiError(err)),
  })

  return {
    conversations,
    isLoading,
    createConversation: createMutation.mutateAsync,
    deleteConversation: deleteMutation.mutate,
    updateConversation: updateMutation.mutate,
  }
}

export function useMessages(spaceId: string, convId: string) {
  return useQuery({
    queryKey: ['messages', convId],
    queryFn: () => conversationsApi.getMessages(spaceId, convId),
    enabled: !!spaceId && !!convId,
  })
}
