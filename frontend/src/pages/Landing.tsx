import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Upload, MessageSquare, BookOpen, ArrowRight, Zap, Shield, Star } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-medium text-gray-900 dark:text-gray-100">IntelliDoc AI</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
          <Button size="sm" onClick={() => navigate('/signup')}>Get Started →</Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" /> Powered by GPT-4o + RAG
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-medium text-gray-900 dark:text-gray-100 mb-6 leading-tight">
            Your documents,<br />
            <span className="text-primary">answered.</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            Upload PDFs, DOCX, CSV, or TXT files. Ask anything in plain English.
            Get cited, accurate answers grounded in your own data.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20"
        >
          {[
            { icon: Upload, title: 'Upload', desc: 'Drop PDFs, DOCX, CSV or TXT — up to 50MB each', color: 'text-blue-500 bg-blue-500/10' },
            { icon: MessageSquare, title: 'Ask', desc: 'Ask anything in natural language about your docs', color: 'text-primary bg-primary/10' },
            { icon: BookOpen, title: 'Understand', desc: 'Get cited answers with source references and page numbers', color: 'text-emerald-500 bg-emerald-500/10' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="p-6 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-elevated text-left hover:border-primary/30 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </motion.div>

        <div className="flex items-center justify-center gap-6 mt-16 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Private & secure</span>
          <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> GPT-4o powered</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Real-time streaming</span>
        </div>
      </main>
    </div>
  )
}
