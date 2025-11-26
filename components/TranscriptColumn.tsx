"use client"

import { useEffect, useState } from "react"
import { generateTimestamps, formatTime, type TimestampedParagraph } from "@/lib/timestamps"
import { cn } from "@/lib/utils"
import { GlassContainer } from "@/components/ui/GlassContainer"

interface TranscriptColumnProps {
    text: string
    onSeek?: (time: number) => void
}

export function TranscriptColumn({ text, onSeek }: TranscriptColumnProps) {
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
        <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-white/5">
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
