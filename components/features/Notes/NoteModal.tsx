"use client"

import { useState } from "react"
import { SmartNote } from "@/types"
import { X, Share2, Download } from "lucide-react"
import { useNotesStore } from "@/store/useNotesStore"
import { cn } from "@/lib/utils"

interface NoteModalProps {
    note: SmartNote
    onClose: () => void
}

export function NoteModal({ note, onClose }: NoteModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 backdrop-blur-md bg-black/80">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            <div className="bg-[#1a1a1a] w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#1a1a1a]">
                    <div className="flex items-center space-x-3 text-gray-400">
                        <span className="font-mono text-xs text-violet-500">
                            {note.note_type}
                        </span>
                        <span className="text-gray-700">|</span>
                        <span className="text-xs uppercase tracking-widest">
                            {new Date(note.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 hover:text-white transition-colors">
                            <Share2 size={18} />
                        </button>
                        <button className="text-gray-500 hover:text-white transition-colors">
                            <Download size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Sidebar Info (Desktop) */}
                    <div className="hidden md:block w-80 bg-[#151515] border-r border-gray-800 p-8 flex-shrink-0 overflow-y-auto">
                        <div className="aspect-square w-full bg-gray-800 mb-6 overflow-hidden">
                            {note.cover_url && (
                                <img
                                    src={note.cover_url}
                                    className="w-full h-full object-cover"
                                    alt="cover"
                                />
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                            {note.title}
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">{note.episodeTitle}</p>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-1">Author</h4>
                                <p className="text-gray-300 font-medium">
                                    {note.author || note.podcastName || "Unknown"}
                                </p>
                            </div>
                            {note.tags && note.tags.length > 0 && (
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-1">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {note.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs text-gray-400 border border-gray-800 px-2 py-1 rounded-sm"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto bg-[#1a1a1a] p-8 md:p-12">
                        {note.note_type === 'SUMMARY' && (
                            <div className="max-w-3xl mx-auto">
                                <div className="prose prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                                        {note.content}
                                    </div>
                                </div>
                            </div>
                        )}

                        {note.note_type === 'MINDMAP' && (
                            <div className="w-full h-full min-h-[500px] border border-gray-800 rounded-xl overflow-hidden bg-[#111] p-4">
                                <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                                    {note.content}
                                </pre>
                            </div>
                        )}

                        {note.note_type === 'CHAT' && (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-[#222] p-8 rounded-sm border-l-2 border-violet-500">
                                    <p className="text-gray-300 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
