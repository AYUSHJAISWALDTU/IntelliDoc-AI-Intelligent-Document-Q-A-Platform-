import { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Plus, MessageSquare,
  Pin, Trash2, MoreHorizontal, BookOpen,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useConversations } from '@/hooks/useConversations'
import { useDocuments } from '@/hooks/useDocuments'
import { groupConversationsByDate, formatRelativeDate, getFileIcon, cn } from '@/lib/utils'
import type { Conversation } from '@/types/models'

export function Sidebar() {
  const { spaceId, convId } = useParams()
  const navigate = useNavigate()
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()
  const { conversations, createConversation, deleteConversation, updateConversation } =
    useConversations(spaceId || '')
  const { documents } = useDocuments(spaceId || '')

  const handleNewChat = async () => {
    if (!spaceId) return
    const conv = await createConversation()
    navigate(`/space/${spaceId}/chat/${conv.id}`)
  }

  const grouped = groupConversationsByDate(conversations)

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 60 : 240 }}
      transition={{ duration: 0.2 }}
      className="flex-shrink-0 h-full bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 border-b border-light-border dark:border-dark-border flex-shrink-0">
        {!sidebarCollapsed && (
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Navigation
          </span>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="ml-auto p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {spaceId && (
            <>
              <div className="p-3">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Conversation
                </button>
              </div>

              {documents.length > 0 && (
                <div className="px-3 pb-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Documents
                  </p>
                  <div className="space-y-0.5">
                    {documents.slice(0, 5).map((doc) => (
                      <NavLink
                        key={doc.id}
                        to={`/space/${spaceId}/doc/${doc.id}`}
                        className={({ isActive }) =>
                          cn('sidebar-item text-xs', isActive && 'active')
                        }
                      >
                        <span>{getFileIcon(doc.file_type)}</span>
                        <span className="truncate">{doc.file_name}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-3 pb-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Conversations
                </p>
                {Object.entries(grouped).map(([group, items]) =>
                  items.length > 0 ? (
                    <div key={group} className="mb-3">
                      <p className="text-[10px] text-gray-400 mb-1 ml-1">{group}</p>
                      <div className="space-y-0.5">
                        {items.map((conv) => (
                          <ConvItem
                            key={conv.id}
                            conv={conv}
                            active={conv.id === convId}
                            spaceId={spaceId}
                            onDelete={() => deleteConversation(conv.id)}
                            onPin={() => updateConversation({ convId: conv.id, data: { is_pinned: !conv.is_pinned } })}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </>
          )}
        </div>
      )}
    </motion.aside>
  )
}

function ConvItem({
  conv, active, spaceId, onDelete, onPin,
}: {
  conv: Conversation
  active: boolean
  spaceId: string
  onDelete: () => void
  onPin: () => void
}) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors relative',
        active
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-light-hover dark:hover:bg-dark-hover text-gray-600 dark:text-gray-400',
      )}
      onClick={() => navigate(`/space/${spaceId}/chat/${conv.id}`)}
    >
      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs truncate flex-1">{conv.title || 'New Conversation'}</span>
      {conv.is_pinned && <Pin className="w-2.5 h-2.5 text-citation flex-shrink-0" />}
      <button
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-light-hover dark:hover:bg-dark-hover"
      >
        <MoreHorizontal className="w-3 h-3" />
      </button>
      {showMenu && (
        <div className="absolute right-0 top-6 z-10 bg-white dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-md shadow-lg py-1 min-w-[120px]">
          <button
            onClick={(e) => { e.stopPropagation(); onPin(); setShowMenu(false) }}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-2"
          >
            <Pin className="w-3 h-3" /> {conv.is_pinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false) }}
            className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
