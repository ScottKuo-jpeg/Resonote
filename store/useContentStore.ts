import { create } from 'zustand'
import { Podcast, Episode } from "@/types"
import { api } from "@/services/api"

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

export const useContentStore = create<ContentState>((set) => ({
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
        set({ selectedPodcast: podcast, isLoadingEpisodes: true, episodesError: null })
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
    backToSearch: () => set({ selectedPodcast: null }),
}))
