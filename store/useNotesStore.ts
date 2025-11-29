import { create } from 'zustand'
import { SmartNote, NoteType, CreateNotePayload } from '@/types'

const USER_ID = 'default_user' // Placeholder user ID

interface NotesState {
    // Data
    notes: SmartNote[]
    selectedNote: SmartNote | null

    // UI State
    filter: NoteType | 'ALL'
    isCreating: boolean
    isLoading: boolean
    error: string | null

    // Actions
    setFilter: (filter: NoteType | 'ALL') => void
    setSelectedNote: (note: SmartNote | null) => void

    // CRUD operations
    createNote: (payload: CreateNotePayload) => Promise<SmartNote | null>
    updateNote: (id: string, updates: Partial<SmartNote>) => Promise<void>
    deleteNote: (id: string) => Promise<void>
    fetchNotes: () => Promise<void>

    // Filtered notes
    getFilteredNotes: () => SmartNote[]
}

export const useNotesStore = create<NotesState>((set, get) => ({
    notes: [],
    selectedNote: null,
    filter: 'ALL',
    isCreating: false,
    isLoading: false,
    error: null,

    setFilter: (filter) => set({ filter }),

    setSelectedNote: (note) => set({ selectedNote: note }),

    createNote: async (payload: CreateNotePayload) => {
        set({ isCreating: true, error: null })
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    user_id: USER_ID
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create note')
            }

            const newNote = await response.json()
            set((state) => ({
                notes: [newNote, ...state.notes],
                isCreating: false
            }))

            return newNote
        } catch (error) {
            console.error('Create note error:', error)
            set({
                error: error instanceof Error ? error.message : 'Failed to create note',
                isCreating: false
            })
            return null
        }
    },

    updateNote: async (id: string, updates: Partial<SmartNote>) => {
        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })

            if (!response.ok) throw new Error('Failed to update note')

            const updatedNote = await response.json()
            set((state) => ({
                notes: state.notes.map(n => n.id === id ? updatedNote : n),
                selectedNote: state.selectedNote?.id === id ? updatedNote : state.selectedNote
            }))
        } catch (error) {
            console.error('Update note error:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to update note' })
        }
    },

    deleteNote: async (id: string) => {
        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete note')

            set((state) => ({
                notes: state.notes.filter(n => n.id !== id),
                selectedNote: state.selectedNote?.id === id ? null : state.selectedNote
            }))
        } catch (error) {
            console.error('Delete note error:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to delete note' })
        }
    },

    fetchNotes: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`/api/notes?user_id=${USER_ID}`)

            if (!response.ok) throw new Error('Failed to fetch notes')

            const data = await response.json()
            set({ notes: data, isLoading: false })
        } catch (error) {
            console.error('Fetch notes error:', error)
            set({
                error: error instanceof Error ? error.message : 'Failed to load notes',
                isLoading: false
            })
        }
    },

    getFilteredNotes: () => {
        const { notes, filter } = get()
        return filter === 'ALL' ? notes : notes.filter(n => n.note_type === filter)
    }
}))
