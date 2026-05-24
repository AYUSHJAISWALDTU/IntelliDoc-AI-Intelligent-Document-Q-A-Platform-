import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  documentPanelOpen: boolean
  activeCitationIndex: number | null
  activeDocumentId: string | null
  activeDocumentPage: number
  theme: 'light' | 'dark' | 'system'
  setSidebarCollapsed: (v: boolean) => void
  setDocumentPanelOpen: (v: boolean) => void
  setActiveCitation: (index: number | null, docId?: string, page?: number) => void
  setTheme: (t: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  documentPanelOpen: false,
  activeCitationIndex: null,
  activeDocumentId: null,
  activeDocumentPage: 1,
  theme: 'dark',

  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setDocumentPanelOpen: (v) => set({ documentPanelOpen: v }),

  setActiveCitation: (index, docId, page) =>
    set({
      activeCitationIndex: index,
      activeDocumentId: docId ?? null,
      activeDocumentPage: page ?? 1,
      documentPanelOpen: index !== null,
    }),

  setTheme: (t) => {
    set({ theme: t })
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  },
}))
