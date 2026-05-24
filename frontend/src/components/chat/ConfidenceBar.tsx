import { cn } from '@/lib/utils'

interface ConfidenceBarProps {
  score: number
}

export function ConfidenceBar({ score }: ConfidenceBarProps) {
  const { label, color } = score >= 0.8
    ? { label: 'High confidence', color: 'bg-emerald-500' }
    : score >= 0.5
    ? { label: 'Moderate confidence', color: 'bg-amber-500' }
    : { label: 'Low confidence', color: 'bg-red-500' }

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-0.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${Math.round(score * 100)}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-400 flex-shrink-0">{label}</span>
    </div>
  )
}
