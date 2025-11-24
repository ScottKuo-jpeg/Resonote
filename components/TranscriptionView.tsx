"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface TranscriptionViewProps {
    text: string
    status: string
    isTranscribing: boolean
}

export function TranscriptionView({ text, status, isTranscribing }: TranscriptionViewProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [text, status])

    if (!isTranscribing && !text) return null

    return (
        <div className="fixed right-0 top-0 bottom-0 w-full md:w-1/3 bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto shadow-2xl z-40">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                Transcription
                {isTranscribing && (
                    <span className="text-xs font-normal px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 animate-pulse">
                        {status}
                    </span>
                )}
            </h2>

            <div className="space-y-4">
                {text ? (
                    <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                            {text}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mb-4"></div>
                        <p>Waiting for transcription...</p>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}
