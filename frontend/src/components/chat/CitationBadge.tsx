import { useUIStore } from '@/stores/uiStore'
import type { Source } from '@/types/models'

interface CitationBadgeProps {
  index: number
  sources: Source[]
}

export function CitationBadge({ index, sources }: CitationBadgeProps) {
  const { setActiveCitation } = useUIStore()
  const source = sources.find((s) => s.index === index)

  const handleClick = () => {
    if (source) {
      setActiveCitation(index, source.document_id, source.page_number ?? 1)
    }
  }

  return (
    <span
      role="button"
      onClick={handleClick}
      title={source ? `${source.document_name} — Page ${source.page_number ?? 'N/A'}` : undefined}
      className="citation-badge mx-0.5 align-super text-[10px]"
    >
      {index}
    </span>
  )
}
