export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  detail: string | { msg: string; loc: string[] }[]
}

export type DocProcessingStage =
  | 'uploading'
  | 'downloading'
  | 'extracting'
  | 'cleaning'
  | 'chunking'
  | 'embedding'
  | 'ready'
  | 'failed'

export interface DocStatusEvent {
  stage: DocProcessingStage
  progress: number
  error?: string
}
