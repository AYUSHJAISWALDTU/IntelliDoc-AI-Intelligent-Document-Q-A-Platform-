import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react'
import { MODELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface InputBarProps {
  onSend: (question: string, model: string) => void
  onStop?: () => void
  isStreaming: boolean
  placeholder?: string
  prefillValue?: string
}

export function InputBar({ onSend, onStop, isStreaming, placeholder, prefillValue }: InputBarProps) {
  const [value, setValue] = useState('')
  const [model, setModel] = useState('gpt-4o')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (prefillValue) {
      setValue(prefillValue)
      textareaRef.current?.focus()
    }
  }, [prefillValue])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [value])

  const handleSend = () => {
    const q = value.trim()
    if (!q || isStreaming) return
    onSend(q, model)
    setValue('')
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const tokenEstimate = Math.ceil(value.length / 4)

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="bg-light-surface dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg shadow-sm focus-within:border-primary/50 focus-within:shadow-glow-sm transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder || 'Ask a question about your documents...'}
          disabled={isStreaming}
          rows={1}
          className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none outline-none leading-relaxed disabled:opacity-60"
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-xs bg-transparent text-gray-500 dark:text-gray-400 border border-transparent rounded px-1 py-0.5 hover:border-light-border dark:hover:border-dark-border transition-colors outline-none cursor-pointer"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {tokenEstimate > 0 && (
              <span className="text-[10px] text-gray-400 ml-1">{tokenEstimate} tokens</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 hidden sm:block">⌘↵</span>
            {isStreaming ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <StopCircle className="w-3.5 h-3.5" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!value.trim()}
                className={cn(
                  'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-medium transition-all',
                  value.trim()
                    ? 'bg-primary text-white hover:bg-primary-light shadow-glow-sm'
                    : 'bg-gray-100 dark:bg-dark-border text-gray-400 cursor-not-allowed',
                )}
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
