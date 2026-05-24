import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { Source } from '@/types/models'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export interface ChatStreamCallbacks {
  onStatus?: (stage: string) => void
  onToken?: (token: string) => void
  onSources?: (sources: Source[]) => void
  onDone?: (meta: { message_id: string; token_count: number; latency_ms: number }) => void
  onError?: (error: Error) => void
}

export async function streamChat(
  spaceId: string,
  convId: string,
  question: string,
  model: string,
  callbacks: ChatStreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const token = localStorage.getItem('access_token')

  await fetchEventSource(`${API_BASE}/spaces/${spaceId}/conversations/${convId}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, model }),
    signal,
    onmessage(ev) {
      try {
        const data = JSON.parse(ev.data)
        if (ev.event === 'status') callbacks.onStatus?.(data.stage)
        else if (ev.event === 'token') callbacks.onToken?.(data.token)
        else if (ev.event === 'sources') callbacks.onSources?.(data.sources)
        else if (ev.event === 'done') callbacks.onDone?.(data)
      } catch {
        // skip malformed events
      }
    },
    onerror(err) {
      callbacks.onError?.(err)
      throw err
    },
  })
}
