import { create } from 'zustand'

interface UIState {
    isSidebarCollapsed: boolean
    activeView: 'search' | 'workspace'
    toggleSidebar: () => void
    setActiveView: (view: 'search' | 'workspace') => void
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarCollapsed: false,
    activeView: 'search',
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setActiveView: (view) => set({ activeView: view }),
}))
