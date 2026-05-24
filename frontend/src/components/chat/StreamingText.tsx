import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { CitationBadge } from './CitationBadge'
import type { Source } from '@/types/models'

interface StreamingTextProps {
  content: string
  isStreaming?: boolean
  sources?: Source[]
}

function processCitations(text: string, sources: Source[]): React.ReactNode[] {
  if (!sources.length) return [text]

  const parts = text.split(/(\[\d+\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/)
    if (match) {
      return <CitationBadge key={i} index={parseInt(match[1])} sources={sources} />
    }
    return part
  })
}

export function StreamingText({ content, isStreaming, sources = [] }: StreamingTextProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 ${isStreaming ? 'streaming-cursor' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-relaxed">
              {typeof children === 'string'
                ? processCitations(children, sources)
                : children}
            </p>
          ),
          code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) =>
            inline ? (
              <code className="font-mono text-xs bg-gray-100 dark:bg-dark-elevated px-1 py-0.5 rounded">
                {children}
              </code>
            ) : (
              <code className={`${className} font-mono text-xs`} {...props}>
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="bg-dark-bg rounded-md p-4 overflow-x-auto text-xs border border-dark-border">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="text-sm border-collapse w-full">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 dark:border-dark-border px-3 py-1.5 text-left font-medium text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 dark:border-dark-border px-3 py-1.5 text-xs">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
