import { useNavigate } from 'react-router-dom'
import { FileText, MessageSquare, HardDrive } from 'lucide-react'
import { formatFileSize, formatRelativeDate } from '@/lib/utils'
import type { Space } from '@/types/models'

interface SpaceCardProps {
  space: Space
}

export function SpaceCard({ space }: SpaceCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/space/${space.id}`)}
      className="group p-5 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-elevated hover:border-primary/40 hover:shadow-glow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${space.color}20` }}
        >
          {space.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{space.name}</h3>
          {space.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{space.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" /> {space.document_count} docs
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" /> {space.conversation_count} chats
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <HardDrive className="w-3 h-3" /> {formatFileSize(space.storage_used)}
        </span>
      </div>

      <p className="text-[10px] text-gray-400 mt-2">
        Updated {space.updated_at ? formatRelativeDate(space.updated_at) : formatRelativeDate(space.created_at)}
      </p>
    </div>
  )
}
