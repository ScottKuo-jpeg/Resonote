import { create } from 'zustand'
import { Podcast } from "@/components/PodcastList"
import { Episode } from "@/components/EpisodeList"
import { api } from "@/services/api"

interface PlayerState {
    currentEpisode: Episode | null
    isPlaying: boolean
    volume: number
    setCurrentEpisode: (episode: Episode | null) => void
    setIsPlaying: (isPlaying: boolean) => void
    setVolume: (volume: number) => void
}

interface ContentState {
    podcasts: Podcast[]
    selectedPodcast: Podcast | null
    episodes: Episode[]
    selectedEpisodeGuid: string | null

    // Loading States
    isSearching: boolean
    isLoadingEpisodes: boolean

    // Error States
    searchError: string | null
    episodesError: string | null

    // Actions
    searchPodcasts: (term: string) => Promise<void>
    selectPodcast: (podcast: Podcast) => Promise<void>
    setEpisodes: (episodes: Episode[]) => void
    setSelectedEpisodeGuid: (guid: string | null) => void
    resetSearch: () => void
    backToSearch: () => void
}

interface TranscriptionState {
    text: string
    status: string
    isTranscribing: boolean
    transcribeEpisode: (episode: Episode) => Promise<void>
    setText: (text: string) => void
    setStatus: (status: string) => void
}

interface UIState {
    isSidebarCollapsed: boolean
    activeView: 'search' | 'workspace'
    toggleSidebar: () => void
    setActiveView: (view: 'search' | 'workspace') => void
}

interface PodcastStore extends PlayerState, ContentState, TranscriptionState, UIState { }

export const usePodcastStore = create<PodcastStore>((set, get) => ({
    // Player
    currentEpisode: null,
    isPlaying: false,
    volume: 1,
    setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setVolume: (volume) => set({ volume }),

    // Content
    podcasts: [],
    selectedPodcast: null,
    episodes: [],
    selectedEpisodeGuid: null,
    isSearching: false,
    isLoadingEpisodes: false,
    searchError: null,
    episodesError: null,

    searchPodcasts: async (term: string) => {
        set({ isSearching: true, selectedPodcast: null, episodes: [], searchError: null })
        try {
            const results = await api.searchPodcasts(term)
            set({ podcasts: results, searchError: null })
        } catch (error) {
            console.error("Search failed:", error)
            const errorMsg = error instanceof Error ? error.message : 'Unknown error'
            set({ searchError: errorMsg, podcasts: [] })
        } finally {
            set({ isSearching: false })
        }
    },

    selectPodcast: async (podcast: Podcast) => {
        set({ selectedPodcast: podcast, isLoadingEpisodes: true, activeView: 'workspace', episodesError: null })
        try {
            const episodes = await api.getEpisodes(podcast.feedUrl)
            set({ episodes, episodesError: null })
        } catch (error) {
            console.error("Fetch episodes failed:", error)
            const errorMsg = error instanceof Error ? error.message : 'Failed to load episodes'
            set({ episodesError: errorMsg, episodes: [] })
        } finally {
            set({ isLoadingEpisodes: false })
        }
    },

    setEpisodes: (episodes) => set({ episodes }),
    setSelectedEpisodeGuid: (guid) => set({ selectedEpisodeGuid: guid }),
    resetSearch: () => set({ podcasts: [], selectedPodcast: null, episodes: [] }),
    backToSearch: () => set({ selectedPodcast: null, activeView: 'search' }),

    // Transcription
    text: "",
    status: "",
    isTranscribing: false,

    transcribeEpisode: async (episode: Episode) => {
        if (!episode.enclosure?.url) return

        set({
            selectedEpisodeGuid: episode.guid,
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
        } catch (error) {
            console.error("Transcription failed:", error)
            set({ status: "Failed - Click to Retry" })
        } finally {
            set({ isTranscribing: false })
        }
    },

    setText: (text) => set({ text }),
    setStatus: (status) => set({ status }),

    // UI
    isSidebarCollapsed: false,
    activeView: 'search',
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setActiveView: (view) => set({ activeView: view }),
}))
