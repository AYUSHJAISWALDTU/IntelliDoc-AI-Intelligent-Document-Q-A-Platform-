import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { SPACE_COLORS, SPACE_ICONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface CreateSpaceModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: { name: string; description?: string; color: string; icon: string }) => void
  isCreating: boolean
}

export function CreateSpaceModal({ open, onClose, onCreate, isCreating }: CreateSpaceModalProps) {
  const [selectedColor, setSelectedColor] = useState(SPACE_COLORS[0])
  const [selectedIcon, setSelectedIcon] = useState(SPACE_ICONS[0])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    onCreate({ ...data, color: selectedColor, icon: selectedIcon })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Space">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" placeholder="e.g. Research Papers" error={errors.name?.message} {...register('name')} />
        <Input label="Description (optional)" placeholder="What's this space for?" {...register('description')} />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {SPACE_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                className={cn(
                  'w-8 h-8 rounded text-lg flex items-center justify-center transition-all',
                  selectedIcon === icon ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-light-hover dark:hover:bg-dark-hover',
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
          <div className="flex gap-2">
            {SPACE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn('w-7 h-7 rounded-full transition-transform hover:scale-110', selectedColor === color && 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-dark-bg scale-110')}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isCreating}>Create Space</Button>
        </div>
      </form>
    </Modal>
  )
}
