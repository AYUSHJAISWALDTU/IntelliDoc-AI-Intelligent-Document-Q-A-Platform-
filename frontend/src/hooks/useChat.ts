import { useRef, useCallback } from 'react'
import { streamChat } from '@/api/chat'
import { useChatStore } from '@/stores/chatStore'
import { toast } from 'sonner'

export function useChat() {
  const abortRef = useRef<AbortController | null>(null)
  const {
    isStreaming, streamingMessage,
    startStreaming, appendToken, setSources,
    setStreamingStatus, finalizeStreaming,
  } = useChatStore()

  const sendMessage = useCallback(
    async (spaceId: string, convId: string, question: string, model: string) => {
      if (isStreaming) return

      abortRef.current = new AbortController()
      startStreaming()

      try {
        await streamChat(spaceId, convId, question, model, {
          onStatus: (stage) => setStreamingStatus(stage),
          onToken: (token) => appendToken(token),
          onSources: (sources) => setSources(sources),
          onDone: (meta) => finalizeStreaming(meta.message_id),
          onError: (err) => {
            if (err.name !== 'AbortError') {
              toast.error('Failed to get response. Please try again.')
            }
            finalizeStreaming('')
          },
        }, abortRef.current.signal)
      } catch (err: unknown) {
        const e = err as Error
        if (e.name !== 'AbortError') {
          toast.error('Connection error. Please try again.')
        }
        finalizeStreaming('')
      }
    },
    [isStreaming, startStreaming, appendToken, setSources, setStreamingStatus, finalizeStreaming],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { sendMessage, cancel, isStreaming, streamingMessage }
}
