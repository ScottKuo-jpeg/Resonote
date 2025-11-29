"use client"

import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react"
import { Episode } from "@/types"
import { GlassContainer } from "@/components/ui/GlassContainer"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { formatTime } from "@/lib/timestamps"

interface AudioPlayerProps {
    episode: Episode | null
}

export interface AudioPlayerHandle {
    seek: (time: number) => void
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
    ({ episode }, ref) => {
        const audioRef = useRef<HTMLAudioElement>(null)
        const [isPlaying, setIsPlaying] = useState(false)
        const [currentTime, setCurrentTime] = useState(0)
        const [duration, setDuration] = useState(0)
        const [volume, setVolume] = useState(1)
        const [isMuted, setIsMuted] = useState(false)

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
                setIsPlaying(true)
            }
        }, [episode])

        const togglePlay = () => {
            if (audioRef.current) {
                if (isPlaying) {
                    audioRef.current.pause()
                } else {
                    audioRef.current.play()
                }
                setIsPlaying(!isPlaying)
            }
        }

        const handleTimeUpdate = () => {
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime)
            }
        }

        const handleLoadedMetadata = () => {
            if (audioRef.current) {
                setDuration(audioRef.current.duration)
            }
        }

        const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
            const time = parseFloat(e.target.value)
            if (audioRef.current) {
                audioRef.current.currentTime = time
                setCurrentTime(time)
            }
        }

        const toggleMute = () => {
            if (audioRef.current) {
                audioRef.current.muted = !isMuted
                setIsMuted(!isMuted)
            }
        }

        const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const vol = parseFloat(e.target.value)
            if (audioRef.current) {
                audioRef.current.volume = vol
                setVolume(vol)
                setIsMuted(vol === 0)
            }
        }

        if (!episode || !episode.enclosure?.url) return null

        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
                <GlassContainer
                    intensity="high"
                    className="max-w-4xl mx-auto pointer-events-auto border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col gap-2 p-4"
                >
                    <div className="flex items-center gap-4">
                        {/* Episode Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">
                                {episode.title}
                            </h4>
                            <p className="text-xs text-gray-400 truncate">
                                Now Playing
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => audioRef.current && (audioRef.current.currentTime -= 10)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <SkipBack className="w-5 h-5" />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all"
                            >
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                            </button>

                            <button
                                onClick={() => audioRef.current && (audioRef.current.currentTime += 10)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <SkipForward className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-2 w-32">
                            <button onClick={toggleMute} className="text-gray-400 hover:text-white">
                                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                        <span>{formatTime(currentTime)}</span>
                        <div className="flex-1 relative group h-2 flex items-center">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:rounded-full group-hover:[&::-webkit-slider-thumb]:w-3 group-hover:[&::-webkit-slider-thumb]:h-3 transition-all"
                            />
                            <div
                                className="h-1 bg-violet-500 rounded-lg pointer-events-none"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>
                        <span>{formatTime(duration)}</span>
                    </div>

                    <audio
                        ref={audioRef}
                        src={episode.enclosure.url}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className="hidden"
                    />
                </GlassContainer>
            </div>
        )
    }
)

AudioPlayer.displayName = "AudioPlayer"
