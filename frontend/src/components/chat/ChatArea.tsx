import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { StreamingText } from './StreamingText'
import { MessageSkeleton } from '@/components/common/Skeleton'
import { useChatStore } from '@/stores/chatStore'
import type { Message } from '@/types/models'
import { Brain, Search } from 'lucide-react'

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  spaceId: string
  convId: string
}

function StreamingIndicator({ status }: { status: string }) {
  const labels: Record<string, string> = {
    searching: '🔍 Searching documents...',
    generating: '🧠 Generating answer...',
    thinking: '💭 Thinking...',
  }
  return (
    <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
      </div>
      {labels[status] || 'Processing...'}
    </div>
  )
}

export function ChatArea({ messages, isLoading, spaceId, convId }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { streamingMessage, isStreaming } = useChatStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage?.content])

  if (isLoading) return <MessageSkeleton />

  if (!messages.length && !isStreaming) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center px-8 py-16">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-display font-medium text-gray-800 dark:text-gray-200 mb-2">
          Ask anything about your documents
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Upload documents to this space and ask natural-language questions. Get cited answers instantly.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} spaceId={spaceId} convId={convId} />
      ))}

      {isStreaming && streamingMessage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {!streamingMessage.content ? (
            <StreamingIndicator status={streamingMessage.status} />
          ) : (
            <div className="bg-light-surface dark:bg-dark-elevated rounded-lg border border-light-border dark:border-dark-border p-4">
              <StreamingText
                content={streamingMessage.content}
                isStreaming
                sources={streamingMessage.sources}
              />
            </div>
          )}
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
