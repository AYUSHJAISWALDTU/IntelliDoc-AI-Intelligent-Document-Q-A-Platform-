import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText } from 'lucide-react'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFiles: (files: File[]) => void
  isUploading?: boolean
}

export function UploadZone({ onFiles, isUploading }: UploadZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFiles(accepted)
    },
    [onFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxSize: MAX_FILE_SIZE_BYTES,
    maxFiles: 10,
    disabled: isUploading,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer',
        isDragActive
          ? 'border-primary bg-primary/5 shadow-glow'
          : 'border-light-border dark:border-dark-border hover:border-primary/50 hover:bg-primary/[0.02]',
        isUploading && 'opacity-50 cursor-not-allowed',
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center transition-colors', isDragActive ? 'bg-primary/20' : 'bg-light-elevated dark:bg-dark-elevated')}>
          {isDragActive ? (
            <FileText className="w-5 h-5 text-primary animate-bounce" />
          ) : (
            <Upload className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            PDF, DOCX, TXT, CSV · Max 50MB · Up to 10 files
          </p>
        </div>
      </div>
    </div>
  )
}
