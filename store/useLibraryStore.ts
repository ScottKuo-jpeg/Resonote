import { create } from 'zustand'
import { UserFollow, UserLike, UserHistory, LibraryTab, LibraryEpisode, Podcast } from '@/types'

const USER_ID = 'default_user' // Placeholder user ID

interface LibraryState {
    // Data
    follows: UserFollow[]
    likes: UserLike[]
    history: UserHistory[]
    libraryEpisodes: LibraryEpisode[]

    // UI State
    activeLibraryTab: LibraryTab
    isLoading: boolean
    error: string | null
    hasMore: boolean
    currentPage: number

    // Actions
    setActiveLibraryTab: (tab: LibraryTab) => void

    // Follow actions
    followPodcast: (podcast: Podcast) => Promise<void>
    unfollowPodcast: (podcastId: string) => Promise<void>
    fetchFollows: () => Promise<void>
    isFollowing: (podcastId: string) => boolean

    // Like actions
    likeEpisode: (episodeGuid: string) => Promise<void>
    unlikeEpisode: (episodeGuid: string) => Promise<void>
    fetchLikes: () => Promise<void>
    isLiked: (episodeGuid: string) => boolean

    // History actions
    addToHistory: (episodeGuid: string, progress: number, lastPosition: number) => Promise<void>
    fetchHistory: () => Promise<void>

    // Library episodes
    fetchLibraryEpisodes: (tab: LibraryTab, page?: number) => Promise<void>
    loadMore: () => Promise<void>
    refreshLibrary: () => Promise<void>
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
    follows: [],
    likes: [],
    history: [],
    libraryEpisodes: [],
    activeLibraryTab: 'follow',
    isLoading: false,
    error: null,
    hasMore: true,
    currentPage: 0,

    setActiveLibraryTab: (tab) => {
        set({ activeLibraryTab: tab, currentPage: 0, libraryEpisodes: [], hasMore: true })
        get().fetchLibraryEpisodes(tab, 0)
    },

    followPodcast: async (podcast: Podcast) => {
        try {
            const response = await fetch('/api/library/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: USER_ID,
                    podcast_id: String(podcast.collectionId),
                    podcast
                })
            })

            if (!response.ok) throw new Error('Failed to follow podcast')

            const newFollow = await response.json()
            set((state) => ({ follows: [...state.follows, newFollow] }))
        } catch (error) {
            console.error('Follow podcast error:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to follow podcast' })
        }
    },

    unfollowPodcast: async (podcastId: string) => {
        try {
            const response = await fetch('/api/library/follow', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: USER_ID, podcast_id: podcastId })
            })

            if (!response.ok) throw new Error('Failed to unfollow podcast')

            set((state) => ({
                follows: state.follows.filter(f => f.podcast_id !== podcastId)
            }))
        } catch (error) {
            console.error('Unfollow podcast error:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to unfollow podcast' })
        }
    },

    fetchFollows: async () => {
        try {
            const response = await fetch(`/api/library/follow?user_id=${USER_ID}`)
            if (!response.ok) throw new Error('Failed to fetch follows')
            const data = await response.json()
            set({ follows: data })
        } catch (error) {
            console.error('Fetch follows error:', error)
        }
    },

    isFollowing: (podcastId: string) => {
        return get().follows.some(f => f.podcast_id === podcastId)
    },

    likeEpisode: async (episodeGuid: string) => {
        try {
            const response = await fetch('/api/library/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: USER_ID, episode_guid: episodeGuid })
            })

            if (!response.ok) throw new Error('Failed to like episode')

            const newLike = await response.json()
            set((state) => ({ likes: [...state.likes, newLike] }))
        } catch (error) {
            console.error('Like episode error:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to like episode' })
        }
    },

    unlikeEpisode: async (episodeGuid: string) => {
        try {
            const response = await fetch('/api/library/like', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: USER_ID, episode_guid: episodeGuid })
            })

            if (!response.ok) throw new Error('Failed to unlike episode')

            set((state) => ({
                likes: state.likes.filter(l => l.episode_guid !== episodeGuid)
            }))
        } catch (error) {
            console.error('Unlike episode error:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to unlike episode' })
        }
    },

    fetchLikes: async () => {
        try {
            const response = await fetch(`/api/library/like?user_id=${USER_ID}`)
            if (!response.ok) throw new Error('Failed to fetch likes')
            const data = await response.json()
            set({ likes: data })
        } catch (error) {
            console.error('Fetch likes error:', error)
        }
    },

    isLiked: (episodeGuid: string) => {
        return get().likes.some(l => l.episode_guid === episodeGuid)
    },

    addToHistory: async (episodeGuid: string, progress: number, lastPosition: number) => {
        try {
            const response = await fetch('/api/library/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: USER_ID,
                    episode_guid: episodeGuid,
                    progress,
                    last_position: lastPosition
                })
            })

            if (!response.ok) throw new Error('Failed to update history')

            await get().fetchHistory()
        } catch (error) {
            console.error('Add to history error:', error)
        }
    },

    fetchHistory: async () => {
        try {
            const response = await fetch(`/api/library/history?user_id=${USER_ID}`)
            if (!response.ok) throw new Error('Failed to fetch history')
            const data = await response.json()
            set({ history: data })
        } catch (error) {
            console.error('Fetch history error:', error)
        }
    },

    fetchLibraryEpisodes: async (tab: LibraryTab, page = 0) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(
                `/api/library/episodes?user_id=${USER_ID}&tab=${tab}&page=${page}&limit=10`
            )

            if (!response.ok) throw new Error('Failed to fetch library episodes')

            const data = await response.json()

            set((state) => ({
                libraryEpisodes: page === 0 ? data.episodes : [...state.libraryEpisodes, ...data.episodes],
                hasMore: data.hasMore,
                currentPage: page,
                isLoading: false
            }))
        } catch (error) {
            console.error('Fetch library episodes error:', error)
            set({
                error: error instanceof Error ? error.message : 'Failed to load episodes',
                isLoading: false
            })
        }
    },

    loadMore: async () => {
        const { hasMore, isLoading, currentPage, activeLibraryTab } = get()
        if (!hasMore || isLoading) return

        await get().fetchLibraryEpisodes(activeLibraryTab, currentPage + 1)
    },

    refreshLibrary: async () => {
        const { activeLibraryTab } = get()
        set({ currentPage: 0, libraryEpisodes: [], hasMore: true })
        await get().fetchLibraryEpisodes(activeLibraryTab, 0)
    }
}))
