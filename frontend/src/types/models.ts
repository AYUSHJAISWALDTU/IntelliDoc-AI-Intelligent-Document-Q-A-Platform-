export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  auth_provider: string | null
  is_admin: boolean
  created_at: string
}

export interface Space {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  storage_used: number
  document_count: number
  conversation_count: number
  created_at: string
  updated_at: string | null
}

export interface Document {
  id: string
  space_id: string
  file_name: string
  file_type: string
  file_size: number
  page_count: number | null
  chunk_count: number
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  error_message: string | null
  doc_metadata: Record<string, unknown> | null
  download_url?: string
  created_at: string
  updated_at: string | null
}

export interface Conversation {
  id: string
  space_id: string
  title: string | null
  is_pinned: boolean
  message_count: number
  last_message_at: string | null
  created_at: string
  updated_at: string | null
}

export interface Source {
  index: number
  document_id: string
  document_name: string
  page_number: number | null
  chunk_index: number
  chunk_text: string
  relevance_score: number
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources: Source[] | null
  model_used: string | null
  token_count: number | null
  latency_ms: number | null
  feedback: 'thumbs_up' | 'thumbs_down' | null
  created_at: string
}

export interface ApiKey {
  id: string
  provider: string
  key_preview: string | null
  label: string | null
  is_valid: boolean | null
  last_tested_at: string | null
  created_at: string
}

export interface UserSettings {
  default_model: string
  chunk_size: number
  chunk_overlap: number
  response_style: string
  theme: string
}
