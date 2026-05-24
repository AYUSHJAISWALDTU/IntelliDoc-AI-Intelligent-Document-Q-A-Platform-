import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react'
import { StreamingText } from './StreamingText'
import { SourceCard } from './SourceCard'
import { ConfidenceBar } from './ConfidenceBar'
import type { Message } from '@/types/models'
import { toast } from 'sonner'
import { conversationsApi } from '@/api/conversations'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface MessageBubbleProps {
  message: Message
  spaceId: string
  convId: string
}

export function MessageBubble({ message, spaceId, convId }: MessageBubbleProps) {
  const [showSources, setShowSources] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(message.feedback ?? null)
  const isUser = message.role === 'user'
  const sources = message.sources ?? []

  const avgScore = sources.length > 0
    ? sources.reduce((sum, s) => sum + s.relevance_score, 0) / sources.length
    : 0

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    toast.success('Copied to clipboard')
  }

  const handleFeedback = async (val: string) => {
    setFeedback(val)
    try {
      await conversationsApi.submitFeedback(spaceId, convId, message.id, val)
    } catch {
      setFeedback(null)
    }
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="message-bubble bg-primary/10 border border-primary/20 dark:bg-primary/15">
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
          <p className="text-[10px] text-gray-400 mt-1.5 text-right">
            {format(new Date(message.created_at), 'HH:mm')}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="bg-light-surface dark:bg-dark-elevated rounded-lg border border-light-border dark:border-dark-border p-4">
        <StreamingText content={message.content} sources={sources} />

        {sources.length > 0 && <ConfidenceBar score={avgScore} />}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-light-border dark:border-dark-border">
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              title="Copy"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleFeedback('thumbs_up')}
              className={cn(
                'p-1.5 rounded transition-colors',
                feedback === 'thumbs_up'
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : 'text-gray-400 hover:text-emerald-500 hover:bg-light-hover dark:hover:bg-dark-hover',
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleFeedback('thumbs_down')}
              className={cn(
                'p-1.5 rounded transition-colors',
                feedback === 'thumbs_down'
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-gray-400 hover:text-red-500 hover:bg-light-hover dark:hover:bg-dark-hover',
              )}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {sources.length > 0 && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {sources.length} source{sources.length !== 1 ? 's' : ''}
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {showSources && sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            {sources.map((source) => (
              <SourceCard key={source.index} source={source} />
            ))}
          </motion.div>
        )}
      </div>

      {message.model_used && (
        <p className="text-[10px] text-gray-400 mt-1 ml-1">
          {message.model_used} · {message.latency_ms ? `${(message.latency_ms / 1000).toFixed(1)}s` : ''}
        </p>
      )}
    </motion.div>
  )
}
