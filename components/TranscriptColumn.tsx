"use client"

import { useEffect, useState } from "react"
import { generateTimestamps, formatTime, type TimestampedParagraph } from "@/lib/timestamps"
import { cn } from "@/lib/utils"

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
        <div className="h-full overflow-y-auto p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 sticky top-0 bg-gray-900 pb-2 border-b border-gray-800">
                Transcript
            </h2>
            {paragraphs.map((para, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "group p-4 rounded-lg border border-gray-800/50 hover:border-blue-500/50",
                        "hover:bg-gray-800/30 transition-all cursor-pointer"
                    )}
                    onClick={() => onSeek?.(para.startTime)}
                >
                    <div className="flex items-start gap-3">
                        <button
                            className="flex-shrink-0 px-2 py-1 text-xs font-mono text-blue-400 bg-blue-500/10 rounded group-hover:bg-blue-500/20 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation()
                                onSeek?.(para.startTime)
                            }}
                        >
                            {formatTime(para.startTime)}
                        </button>
                        <p className="flex-1 text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {para.text}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
