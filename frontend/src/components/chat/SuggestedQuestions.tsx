interface SuggestedQuestionsProps {
  suggestions: string[]
  onSelect: (q: string) => void
}

export function SuggestedQuestions({ suggestions, onSelect }: SuggestedQuestionsProps) {
  if (!suggestions.length) return null

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {suggestions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="text-xs px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border
            text-gray-600 dark:text-gray-400 hover:border-primary/50 hover:text-primary
            bg-light-surface dark:bg-dark-elevated transition-all hover:scale-[1.02]"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
