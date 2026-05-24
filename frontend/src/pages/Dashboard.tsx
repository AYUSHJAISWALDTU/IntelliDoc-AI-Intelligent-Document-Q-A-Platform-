import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, FolderOpen } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { SpaceCard } from '@/components/spaces/SpaceCard'
import { CreateSpaceModal } from '@/components/spaces/CreateSpaceModal'
import { CardSkeleton } from '@/components/common/Skeleton'
import { useSpaces } from '@/hooks/useSpaces'
import { Toaster } from 'sonner'

export default function Dashboard() {
  const [showCreate, setShowCreate] = useState(false)
  const { spaces, isLoading, createSpace, isCreating } = useSpaces()

  return (
    <div className="flex-1 overflow-y-auto bg-light-bg dark:bg-dark-bg">
      <Toaster position="bottom-right" richColors />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-medium text-gray-900 dark:text-gray-100">
              Spaces
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Organize your documents into workspaces
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="w-4 h-4" /> New Space
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : spaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-display font-medium text-gray-800 dark:text-gray-200 mb-2">
              Create your first space
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
              A space is a workspace for a group of related documents. Create one to get started.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Create Space
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {spaces.map((space, i) => (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <SpaceCard space={space} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <CreateSpaceModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => {
          createSpace(data)
          setShowCreate(false)
        }}
        isCreating={isCreating}
      />
    </div>
  )
}
