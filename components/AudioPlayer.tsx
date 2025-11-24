"use client"

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { Episode } from "./EpisodeList"

interface AudioPlayerProps {
    episode: Episode | null
}

export interface AudioPlayerHandle {
    seek: (time: number) => void
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
    ({ episode }, ref) => {
        const audioRef = useRef<HTMLAudioElement>(null)

        useImperativeHandle(ref, () => ({
            seek: (time: number) => {
                if (audioRef.current) {
                    audioRef.current.currentTime = time
                }
            },
        }))

        useEffect(() => {
            if (episode && audioRef.current) {
                audioRef.current.play().catch(() => {
                    // Auto-play might be blocked
                })
            }
        }, [episode])

        if (!episode || !episode.enclosure?.url) return null

        return (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-4 z-50">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                            {episode.title}
                        </h4>
                    </div>
                    <audio
                        ref={audioRef}
                        controls
                        className="w-full max-w-md h-10"
                        src={episode.enclosure.url}
                    />
                </div>
            </div>
        )
    }
)

AudioPlayer.displayName = "AudioPlayer"
