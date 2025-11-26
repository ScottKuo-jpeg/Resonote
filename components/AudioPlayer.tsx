"use client"

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { Episode } from "./EpisodeList"
import { GlassContainer } from "@/components/ui/GlassContainer"

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
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
                <GlassContainer
                    intensity="high"
                    className="max-w-4xl mx-auto flex items-center gap-4 p-4 pointer-events-auto border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                            {episode.title}
                        </h4>
                        <p className="text-xs text-gray-400">Now Playing</p>
                    </div>
                    <audio
                        ref={audioRef}
                        controls
                        className="w-full max-w-md h-10 opacity-90 hover:opacity-100 transition-opacity"
                        src={episode.enclosure.url}
                    />
                </GlassContainer>
            </div>
        )
    }
)

AudioPlayer.displayName = "AudioPlayer"
