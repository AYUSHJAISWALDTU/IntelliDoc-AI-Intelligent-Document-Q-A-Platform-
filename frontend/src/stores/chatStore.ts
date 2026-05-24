import { create } from 'zustand'
import type { Message, Source } from '@/types/models'

interface StreamingMessage {
  id: string
  content: string
  sources: Source[]
  isStreaming: boolean
  status: string
}

interface ChatState {
  messages: Message[]
  streamingMessage: StreamingMessage | null
  isStreaming: boolean
  currentSpaceId: string | null
  currentConvId: string | null
  setMessages: (msgs: Message[]) => void
  appendMessage: (msg: Message) => void
  startStreaming: () => void
  appendToken: (token: string) => void
  setSources: (sources: Source[]) => void
  setStreamingStatus: (status: string) => void
  finalizeStreaming: (msgId: string) => void
  setConversation: (spaceId: string, convId: string) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  streamingMessage: null,
  isStreaming: false,
  currentSpaceId: null,
  currentConvId: null,

  setMessages: (msgs) => set({ messages: msgs }),

  appendMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  startStreaming: () =>
    set({
      isStreaming: true,
      streamingMessage: { id: 'streaming', content: '', sources: [], isStreaming: true, status: 'thinking' },
    }),

  appendToken: (token) =>
    set((s) => ({
      streamingMessage: s.streamingMessage
        ? { ...s.streamingMessage, content: s.streamingMessage.content + token }
        : null,
    })),

  setSources: (sources) =>
    set((s) => ({
      streamingMessage: s.streamingMessage ? { ...s.streamingMessage, sources } : null,
    })),

  setStreamingStatus: (status) =>
    set((s) => ({
      streamingMessage: s.streamingMessage ? { ...s.streamingMessage, status } : null,
    })),

  finalizeStreaming: (msgId) => {
    const { streamingMessage } = get()
    if (!streamingMessage) return
    set((s) => ({
      isStreaming: false,
      streamingMessage: null,
    }))
  },

  setConversation: (spaceId, convId) => set({ currentSpaceId: spaceId, currentConvId: convId }),

  reset: () => set({ messages: [], streamingMessage: null, isStreaming: false }),
}))
