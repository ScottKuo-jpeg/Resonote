import { create } from 'zustand'
import { Episode } from "@/types"
import { api } from "@/services/api"
import { useContentStore } from './useContentStore'

interface TranscriptionState {
    text: string
    status: string
    isTranscribing: boolean
    transcribeEpisode: (episode: Episode) => Promise<void>
    setText: (text: string) => void
    setStatus: (status: string) => void
}

export const useTranscriptStore = create<TranscriptionState>((set) => ({
    text: "",
    status: "",
    isTranscribing: false,

    transcribeEpisode: async (episode: Episode) => {
        if (!episode.enclosure?.url) return

        // Update selected episode in content store
        useContentStore.getState().setSelectedEpisodeGuid(episode.guid)

        set({
            isTranscribing: true,
            text: "",
            status: "Initializing..."
        })

        try {
            await api.transcribeEpisode(
                episode.enclosure.url,
                episode.title,
                episode.guid,
                (status) => set({ status }),
                (text) => set({ text })
            )
            // Set completed status
            set({ status: "Completed" })
        } catch (error) {
            console.error("Transcription failed:", error)
            set({ status: "Failed - Click to Retry" })
        } finally {
            set({ isTranscribing: false })
        }
    },

    setText: (text) => set({ text }),
    setStatus: (status) => set({ status }),
}))
