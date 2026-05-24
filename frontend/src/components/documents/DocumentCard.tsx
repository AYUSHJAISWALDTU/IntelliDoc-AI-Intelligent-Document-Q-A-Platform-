import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Trash2, RotateCcw, MoreVertical } from 'lucide-react'
import { DocStatusBadge } from '@/components/common/Badge'
import { formatFileSize, formatRelativeDate, getFileIcon } from '@/lib/utils'
import type { Document } from '@/types/models'

interface DocumentCardProps {
  doc: Document
  spaceId: string
  onDelete: (id: string) => void
}

export function DocumentCard({ doc, spaceId, onDelete }: DocumentCardProps) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="group relative p-4 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-elevated hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0 mt-0.5">{getFileIcon(doc.file_type)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={doc.file_name}>
            {doc.file_name}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <DocStatusBadge status={doc.status} />
            <span className="text-xs text-gray-400">{formatFileSize(doc.file_size)}</span>
            {doc.page_count && (
              <span className="text-xs text-gray-400">{doc.page_count} pages</span>
            )}
            {doc.chunk_count > 0 && (
              <span className="text-xs text-gray-400">{doc.chunk_count} chunks</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(doc.created_at)}</p>
          {doc.error_message && (
            <p className="text-xs text-red-500 mt-1 truncate" title={doc.error_message}>
              {doc.error_message}
            </p>
          )}
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 z-10 bg-white dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-md shadow-lg py-1 min-w-[130px]">
              <button
                onClick={() => { navigate(`/space/${spaceId}/doc/${doc.id}`); setShowMenu(false) }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-2"
              >
                <Eye className="w-3 h-3" /> Preview
              </button>
              <button
                onClick={() => { onDelete(doc.id); setShowMenu(false) }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {doc.status === 'processing' && (
        <div className="mt-3">
          <div className="h-0.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}
    </div>
  )
}
