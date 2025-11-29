"use client"

import { useEffect } from "react"
import { useNotesStore } from "@/store/useNotesStore"
import { Filter, BookOpen } from "lucide-react"
import { NoteType } from "@/types"
import { NoteCard } from "./NoteCard"
import { NoteModal } from "./NoteModal"
import { cn } from "@/lib/utils"

export function Notes() {
    const {
        notes,
        selectedNote,
        filter,
        isLoading,
        setFilter,
        setSelectedNote,
        fetchNotes,
        getFilteredNotes
    } = useNotesStore()

    useEffect(() => {
        fetchNotes()
    }, [])

    const filteredNotes = getFilteredNotes()

    const filterOptions: Array<{ id: NoteType | 'ALL'; label: string }> = [
        { id: 'ALL', label: 'All' },
        { id: 'SUMMARY', label: 'Summ' },
        { id: 'MINDMAP', label: 'Mind' },
        { id: 'CHAT', label: 'Chat' },
    ]

    return (
        <div className="flex-1 h-screen overflow-hidden bg-[#111111] relative flex flex-col font-sans">

            {/* Header */}
            <div className="relative z-10 px-8 py-8 flex items-end justify-between border-b border-gray-800 bg-[#111111]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        Smart Library
                    </h1>
                    <p className="text-gray-400 text-sm">Curated insights from your listening journey.</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
                        {filterOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setFilter(option.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all uppercase tracking-wide",
                                    filter === option.id
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-gray-500 hover:text-gray-300'
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <button className="p-2 text-gray-500 hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Masonry Grid Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10 bg-[#0e0e0e]">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600">
                        <p className="font-serif italic text-xl">"Silence is golden, but notes are useful."</p>
                        <p className="text-sm mt-2 font-mono">No notes found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 mx-auto max-w-[1920px]">
                        {filteredNotes.map((note, idx) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                index={idx + 1}
                                onClick={() => setSelectedNote(note)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Overlay Modal for Expanded Note */}
            {selectedNote && (
                <NoteModal
                    note={selectedNote}
                    onClose={() => setSelectedNote(null)}
                />
            )}
        </div>
    )
}
