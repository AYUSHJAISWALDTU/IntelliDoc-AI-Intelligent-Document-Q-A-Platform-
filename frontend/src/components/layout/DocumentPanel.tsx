import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useChatStore } from '@/stores/chatStore'

export function DocumentPanel() {
  const { documentPanelOpen, activeDocumentId, activeDocumentPage, activeCitationIndex, setDocumentPanelOpen } = useUIStore()
  const { streamingMessage } = useChatStore()
  const [activeTab, setActiveTab] = useState<'document' | 'sources'>('document')

  const sources = streamingMessage?.sources || []

  return (
    <AnimatePresence>
      {documentPanelOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 h-full bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border flex-shrink-0">
            <div className="flex gap-1 bg-light-elevated dark:bg-dark-elevated rounded-md p-0.5">
              {(['document', 'sources'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs rounded font-medium transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              onClick={() => setDocumentPanelOpen(false)}
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'document' ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click a citation [1] in the chat to view source</p>
                {activeDocumentId && (
                  <p className="text-xs mt-2 text-primary">Page {activeDocumentPage}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sources.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No sources yet</p>
                ) : (
                  sources.map((s) => (
                    <div
                      key={s.index}
                      className={`p-3 rounded-md border text-xs transition-colors ${
                        activeCitationIndex === s.index
                          ? 'border-citation bg-citation/5'
                          : 'border-light-border dark:border-dark-border'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded bg-citation/10 text-citation flex items-center justify-center font-bold text-[10px]">
                          {s.index}
                        </span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{s.document_name}</span>
                        <span className="text-gray-400 ml-auto flex-shrink-0">p.{s.page_number ?? '?'}</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 line-clamp-3">{s.chunk_text}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-0.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.round(s.relevance_score * 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-400">{Math.round(s.relevance_score * 100)}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
