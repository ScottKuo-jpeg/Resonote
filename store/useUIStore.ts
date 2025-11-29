import { create } from 'zustand'

type ActiveView = 'discover' | 'library' | 'notes' | 'workspace' | 'podcast_detail'

interface UIState {
    isSidebarCollapsed: boolean
    activeView: ActiveView
    toggleSidebar: () => void
    setActiveView: (view: ActiveView) => void
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarCollapsed: false,
    activeView: 'discover',
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setActiveView: (view) => set({ activeView: view }),
}))

