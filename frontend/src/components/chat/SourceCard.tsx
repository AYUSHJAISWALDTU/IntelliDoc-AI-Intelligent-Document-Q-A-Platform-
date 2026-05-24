import { FileText, ExternalLink } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import type { Source } from '@/types/models'
import { cn } from '@/lib/utils'

interface SourceCardProps {
  source: Source
}

export function SourceCard({ source }: SourceCardProps) {
  const { setActiveCitation } = useUIStore()

  const handleView = () => {
    setActiveCitation(source.index, source.document_id, source.page_number ?? 1)
  }

  const scoreColor = source.relevance_score >= 0.8
    ? 'bg-emerald-500'
    : source.relevance_score >= 0.5
    ? 'bg-amber-500'
    : 'bg-red-500'

  return (
    <div className="flex items-start gap-3 p-3 rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-elevated hover:border-primary/30 transition-colors group">
      <div className="flex-shrink-0 w-7 h-7 rounded bg-citation/10 flex items-center justify-center text-citation text-xs font-mono font-bold">
        {source.index}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {source.document_name}
          </span>
          {source.page_number && (
            <span className="text-xs text-gray-400 flex-shrink-0">p.{source.page_number}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1.5">
          {source.chunk_text}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-0.5 rounded-full bg-gray-200 dark:bg-dark-border overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', scoreColor)}
                style={{ width: `${Math.round(source.relevance_score * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              {Math.round(source.relevance_score * 100)}%
            </span>
          </div>
          <button
            onClick={handleView}
            className="flex items-center gap-1 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            See in doc <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
