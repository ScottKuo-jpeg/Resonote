import { create } from 'zustand'
import { Episode } from "@/types"

interface PlayerState {
    currentEpisode: Episode | null
    isPlaying: boolean
    volume: number
    setCurrentEpisode: (episode: Episode | null) => void
    setIsPlaying: (isPlaying: boolean) => void
    setVolume: (volume: number) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
    currentEpisode: null,
    isPlaying: false,
    volume: 1,
    setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setVolume: (volume) => set({ volume }),
}))
