import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spacesApi } from '@/api/spaces'
import { toast } from 'sonner'
import { extractApiError } from '@/lib/utils'

export function useSpaces() {
  const qc = useQueryClient()

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ['spaces'],
    queryFn: spacesApi.list,
  })

  const createMutation = useMutation({
    mutationFn: spacesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spaces'] })
      toast.success('Space created')
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: spacesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spaces'] })
      toast.success('Space deleted')
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof spacesApi.update>[1] }) =>
      spacesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spaces'] }),
    onError: (err) => toast.error(extractApiError(err)),
  })

  return {
    spaces,
    isLoading,
    createSpace: createMutation.mutate,
    deleteSpace: deleteMutation.mutate,
    updateSpace: updateMutation.mutate,
    isCreating: createMutation.isPending,
  }
}

export function useSpace(spaceId: string) {
  return useQuery({
    queryKey: ['spaces', spaceId],
    queryFn: () => spacesApi.get(spaceId),
    enabled: !!spaceId,
  })
}
