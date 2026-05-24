import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Key, Sliders, BarChart2, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react'
import apiClient from '@/api/client'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ApiKey, UserSettings } from '@/types/models'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const qc = useQueryClient()

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => apiClient.get('/settings/profile').then((r) => r.data) })
  const { data: keys = [] } = useQuery<ApiKey[]>({ queryKey: ['api-keys'], queryFn: () => apiClient.get('/settings/api-keys').then((r) => r.data) })
  const { data: prefs } = useQuery<UserSettings>({ queryKey: ['preferences'], queryFn: () => apiClient.get('/settings/preferences').then((r) => r.data) })

  const [newKeyVal, setNewKeyVal] = useState('')
  const [newKeyLabel, setNewKeyLabel] = useState('')

  const addKey = useMutation({
    mutationFn: () => apiClient.post('/settings/api-keys', { provider: 'openai', api_key: newKeyVal, label: newKeyLabel }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); setNewKeyVal(''); setNewKeyLabel(''); toast.success('API key added') },
    onError: () => toast.error('Failed to add key'),
  })

  const deleteKey = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/settings/api-keys/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Key deleted') },
  })

  const testKey = useMutation({
    mutationFn: (id: string) => apiClient.post(`/settings/api-keys/${id}/test`),
    onSuccess: (_, id) => { qc.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Key tested') },
  })

  const updatePrefs = useMutation({
    mutationFn: (data: Partial<UserSettings>) => apiClient.patch('/settings/preferences', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['preferences'] }); toast.success('Preferences saved') },
  })

  return (
    <div className="flex-1 overflow-y-auto bg-light-bg dark:bg-dark-bg">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-xl font-display font-medium text-gray-900 dark:text-gray-100 mb-6">Settings</h1>

        <div className="flex gap-1 mb-6 border-b border-light-border dark:border-dark-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
              )}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <Input label="Name" defaultValue={profile?.name || ''} />
            <Input label="Email" defaultValue={profile?.email || ''} disabled />
            <Input label="Avatar URL" defaultValue={profile?.avatar_url || ''} />
            <Button onClick={() => toast.info('Profile update coming soon')}>Save Changes</Button>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add your OpenAI API key. It's stored encrypted (AES-256-GCM).
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="sk-..."
                value={newKeyVal}
                onChange={(e) => setNewKeyVal(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Label (optional)"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                className="w-36"
              />
              <Button onClick={() => addKey.mutate()} loading={addKey.isPending} disabled={!newKeyVal}>
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-elevated">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{key.key_preview}</span>
                      {key.label && <span className="text-xs text-gray-400">· {key.label}</span>}
                      {key.is_valid === true && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      {key.is_valid === false && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                    <p className="text-xs text-gray-400">{key.provider} · Added {new Date(key.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => testKey.mutate(key.id)} loading={testKey.isPending}>Test</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteKey.mutate(key.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && prefs && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Model</label>
              <select
                defaultValue={prefs.default_model}
                onChange={(e) => updatePrefs.mutate({ default_model: e.target.value })}
                className="bg-light-surface dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-md px-3 py-2 text-sm outline-none"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chunk Size: {prefs.chunk_size} tokens
              </label>
              <input
                type="range" min={500} max={2000} step={100}
                defaultValue={prefs.chunk_size}
                onMouseUp={(e) => updatePrefs.mutate({ chunk_size: parseInt((e.target as HTMLInputElement).value) })}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Style</label>
              <div className="flex gap-2">
                {['concise', 'detailed', 'exhaustive'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updatePrefs.mutate({ response_style: s })}
                    className={cn(
                      'px-3 py-1.5 rounded text-sm capitalize transition-colors',
                      prefs.response_style === s
                        ? 'bg-primary text-white'
                        : 'border border-light-border dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary/50',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
