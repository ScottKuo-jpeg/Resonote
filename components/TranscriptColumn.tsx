"use client"

import { useEffect, useState } from "react"
import { generateTimestamps, formatTime, type TimestampedParagraph } from "@/lib/timestamps"
import { cn } from "@/lib/utils"
import { GlassContainer } from "@/components/ui/GlassContainer"

interface TranscriptColumnProps {
    text: string
    onSeek?: (time: number) => void
    title?: string
    description?: string
    podcastName?: string
    pubDate?: string
}

export function TranscriptColumn({ text, onSeek, title, description, podcastName, pubDate }: TranscriptColumnProps) {
    const [paragraphs, setParagraphs] = useState<TimestampedParagraph[]>([])

    useEffect(() => {
        if (text) {
            const timestamped = generateTimestamps(text)
            setParagraphs(timestamped)
        }
    }, [text])

    if (!text) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>No transcript available. Click "Transcribe" on an episode to begin.</p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Episode Header */}
            <div className="space-y-4 pb-6 border-b border-white/5">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white leading-tight">
                        {title || "Untitled Episode"}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="text-violet-400 font-medium">{podcastName}</span>
                        <span>•</span>
                        <span>{pubDate ? new Date(pubDate).toLocaleDateString() : "Unknown Date"}</span>
                    </div>
                </div>

                {description && (
                    <div
                        className="text-gray-400 leading-relaxed text-sm line-clamp-3 hover:line-clamp-none transition-all cursor-pointer"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                )}
            </div>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                Transcript
            </h2>
            {paragraphs.map((para, idx) => (
                <GlassContainer
                    key={idx}
                    intensity="low"
                    className={cn(
                        "group p-4 cursor-pointer hover:bg-white/5 transition-all duration-300",
                        "hover:border-violet-500/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                    )}
                    onClick={() => onSeek?.(para.startTime)}
                >
                    <div className="flex items-start gap-3">
                        <button
                            className="flex-shrink-0 px-2 py-1 text-xs font-mono text-violet-400 bg-violet-500/10 rounded group-hover:bg-violet-500/20 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation()
                                onSeek?.(para.startTime)
                            }}
                        >
                            {formatTime(para.startTime)}
                        </button>
                        <p className="flex-1 text-gray-300 leading-relaxed whitespace-pre-wrap group-hover:text-white transition-colors">
                            {para.text}
                        </p>
                    </div>
                </GlassContainer>
            ))}
        </div>
    )
}
