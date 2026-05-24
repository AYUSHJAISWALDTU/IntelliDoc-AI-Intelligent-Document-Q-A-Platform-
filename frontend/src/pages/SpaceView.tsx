import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Grid, List } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { UploadZone } from '@/components/documents/UploadZone'
import { CardSkeleton } from '@/components/common/Skeleton'
import { useDocuments } from '@/hooks/useDocuments'
import { useSpace } from '@/hooks/useSpaces'
import { useConversations } from '@/hooks/useConversations'
import { cn } from '@/lib/utils'

export default function SpaceView() {
  const { spaceId } = useParams<{ spaceId: string }>()
  const navigate = useNavigate()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const { data: space } = useSpace(spaceId!)
  const { documents, isLoading, uploadDocument, deleteDocument, isUploading } = useDocuments(spaceId!)
  const { createConversation } = useConversations(spaceId!)

  const handleNewChat = async () => {
    const conv = await createConversation()
    navigate(`/space/${spaceId}/chat/${conv.id}`)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {space?.icon} {space?.name || 'Space'}
            </h1>
            {space?.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{space.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-light-border dark:border-dark-border rounded-md overflow-hidden">
              {(['grid', 'list'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn('p-2 transition-colors', view === v ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600')}
                >
                  {v === 'grid' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={handleNewChat}>
              <Plus className="w-4 h-4" /> New Chat
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <UploadZone
            onFiles={(files) => files.forEach(uploadDocument)}
            isUploading={isUploading}
          />
        </div>

        {isLoading ? (
          <div className={cn('gap-4', view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col')}>
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-sm">No documents yet. Upload one above to get started.</p>
          </div>
        ) : (
          <div className={cn('gap-4', view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col')}>
            {documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <DocumentCard doc={doc} spaceId={spaceId!} onDelete={deleteDocument} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
