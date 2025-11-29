"use client"

import { SmartNote } from "@/types"
import { cn } from "@/lib/utils"

interface NoteCardProps {
    note: SmartNote
    index: number
    onClick: () => void
}

export function NoteCard({ note, index, onClick }: NoteCardProps) {
    // Map note types to accent colors for the bottom border
    const typeColors = {
        SUMMARY: 'border-b-orange-500',
        MINDMAP: 'border-b-blue-500',
        CHAT: 'border-b-green-500'
    }

    // Format index to be 01, 02, etc.
    const formattedIndex = index.toString().padStart(2, '0')

    // Get a snippet of content for the preview if key_takeaway is missing
    const previewContent = note.key_takeaway || note.content.slice(0, 150) + (note.content.length > 150 ? "..." : "")

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative bg-[#151515] hover:bg-[#1a1a1a] transition-all duration-300 cursor-pointer group flex flex-col justify-between h-[420px] p-8 border border-white/5 hover:border-white/10",
                "border-b-2", // Base bottom border width
                typeColors[note.note_type] || 'border-b-gray-500' // Dynamic color
            )}
        >
            {/* Top Section: Number */}
            <div className="text-xs font-mono text-gray-600 mb-6">
                {formattedIndex}
            </div>

            {/* Middle Section: Content */}
            <div className="flex-1 overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 leading-tight">
                    {note.title}
                </h3>

                <div className="text-gray-400 font-serif text-lg leading-relaxed line-clamp-6">
                    "{previewContent}"
                </div>
            </div>

            {/* Bottom Section: Author & Cover */}
            <div className="mt-8 flex items-end justify-between border-t border-white/5 pt-4">
                <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-bold text-white truncate">
                        {note.author || note.podcastName || "Unknown Author"}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-1 truncate">
                        {note.episodeTitle || "Episode"}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1 uppercase">
                        {note.note_type}
                    </p>
                </div>

                <div className="w-12 h-12 bg-gray-800 flex-shrink-0">
                    {note.cover_url ? (
                        <img
                            src={note.cover_url}
                            alt="cover"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-600 text-xs">
                            IMG
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
