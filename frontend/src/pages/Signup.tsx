import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
})
type FormData = z.infer<typeof schema>

export default function Signup() {
  const { signup, signupLoading } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => signup(data)

  return (
    <div className="min-h-screen flex bg-light-bg dark:bg-dark-bg">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-medium text-gray-900 dark:text-gray-100">
              IntelliDoc AI
            </span>
          </div>

          <h1 className="text-2xl font-display font-medium text-gray-900 dark:text-gray-100 mb-1">
            Create account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Start asking questions about your documents
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} {...register('password')} />

            <Button type="submit" className="w-full" loading={signupLoading}>
              Create account
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-dark-bg items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10" />
        <div className="relative text-center px-12">
          <div className="text-6xl mb-6">📚</div>
          <h2 className="font-display text-3xl font-medium text-white mb-4">Get started free</h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Upload PDFs, DOCX, CSV, or TXT. Ask anything. Get cited answers from your own data.
          </p>
        </div>
      </div>
    </div>
  )
}
