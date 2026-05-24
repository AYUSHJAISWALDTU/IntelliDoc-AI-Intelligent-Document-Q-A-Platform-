import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChatArea } from '@/components/chat/ChatArea'
import { InputBar } from '@/components/chat/InputBar'
import { SuggestedQuestions } from '@/components/chat/SuggestedQuestions'
import { useChatStore } from '@/stores/chatStore'
import { useMessages } from '@/hooks/useConversations'
import { useChat } from '@/hooks/useChat'
import { useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '@/api/documents'
import { useDocuments } from '@/hooks/useDocuments'

export default function ChatView() {
  const { spaceId, convId } = useParams<{ spaceId: string; convId: string }>()
  const { sendMessage, cancel, isStreaming, streamingMessage } = useChat()
  const { setMessages, setConversation } = useChatStore()
  const { data: messages = [], isLoading } = useMessages(spaceId!, convId!)
  const { documents } = useDocuments(spaceId!)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [prefill, setPrefill] = useState<string | undefined>()
  const qc = useQueryClient()

  useEffect(() => {
    if (spaceId && convId) setConversation(spaceId, convId)
  }, [spaceId, convId, setConversation])

  useEffect(() => {
    setMessages(messages)
  }, [messages, setMessages])

  useEffect(() => {
    const readyDocs = documents.filter((d) => d.status === 'ready')
    if (readyDocs.length > 0 && messages.length === 0) {
      documentsApi.getSuggestions(spaceId!, readyDocs[0].id).then(setSuggestions).catch(() => {})
    }
  }, [documents, messages.length, spaceId])

  const handleSend = (question: string, model: string) => {
    setSuggestions([])
    setPrefill(undefined)
    sendMessage(spaceId!, convId!, question, model)
    setTimeout(() => {
      qc.invalidateQueries({ queryKey: ['messages', convId] })
      qc.invalidateQueries({ queryKey: ['conversations', spaceId] })
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full bg-light-bg dark:bg-dark-bg">
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        spaceId={spaceId!}
        convId={convId!}
      />
      <SuggestedQuestions suggestions={suggestions} onSelect={(q) => setPrefill(q)} />
      <InputBar
        onSend={handleSend}
        onStop={cancel}
        isStreaming={isStreaming}
        prefillValue={prefill}
      />
    </div>
  )
}
