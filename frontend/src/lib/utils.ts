import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function formatRelativeDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true })
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d, yyyy')
}

export function groupConversationsByDate<T extends { created_at: string }>(items: T[]) {
  const groups: Record<string, T[]> = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] }
  const now = new Date()

  for (const item of items) {
    const date = parseISO(item.created_at)
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    if (isToday(date)) groups['Today'].push(item)
    else if (isYesterday(date)) groups['Yesterday'].push(item)
    else if (diffDays <= 7) groups['Last 7 Days'].push(item)
    else groups['Older'].push(item)
  }

  return groups
}

export function getFileIcon(fileType: string): string {
  const icons: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    doc: '📝',
    txt: '📃',
    csv: '📊',
  }
  return icons[fileType.toLowerCase()] || '📎'
}

export function getFileTypeColor(fileType: string): string {
  const colors: Record<string, string> = {
    pdf: 'text-red-500',
    docx: 'text-blue-500',
    doc: 'text-blue-500',
    txt: 'text-gray-500',
    csv: 'text-green-500',
  }
  return colors[fileType.toLowerCase()] || 'text-gray-500'
}

export function getConfidenceLevel(score: number): { label: string; color: string } {
  if (score >= 0.8) return { label: 'High confidence', color: 'bg-emerald-500' }
  if (score >= 0.5) return { label: 'Moderate confidence', color: 'bg-amber-500' }
  return { label: 'Low confidence', color: 'bg-red-500' }
}

export function extractApiError(error: unknown): string {
  if (!error) return 'An error occurred'
  const err = error as { response?: { data?: { detail?: string | { msg: string }[] } }; message?: string }
  const detail = err.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ')
  return err.message || 'An error occurred'
}
