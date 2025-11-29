"use client"

import { useEffect, useRef, useCallback } from "react"
import { useLibraryStore } from "@/store/useLibraryStore"
import { useUIStore } from "@/store/useUIStore"
import { usePlayerStore } from "@/store/usePlayerStore"
import { Heart, History, Users, Play } from "lucide-react"
import { GlassContainer } from "@/components/ui/GlassContainer"
import { LibraryTab, LibraryEpisode } from "@/types"
import { cn } from "@/lib/utils"

export function Library() {
    const {
        activeLibraryTab,
        setActiveLibraryTab,
        libraryEpisodes,
        isLoading,
        hasMore,
        loadMore,
        fetchFollows,
        fetchLikes,
        fetchHistory
    } = useLibraryStore()

    const setActiveView = useUIStore((state) => state.setActiveView)
    const { setCurrentEpisode } = usePlayerStore()
    const observerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Fetch initial data
        fetchFollows()
        fetchLikes()
        fetchHistory()
    }, [])

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore()
                }
            },
            { threshold: 0.5 }
        )

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => observer.disconnect()
    }, [hasMore, isLoading, loadMore])

    const tabs = [
        { id: 'follow' as LibraryTab, label: 'Following', icon: Users },
        { id: 'like' as LibraryTab, label: 'Liked', icon: Heart },
        { id: 'history' as LibraryTab, label: 'History', icon: History },
    ]

    const handleEpisodeClick = (episode: LibraryEpisode) => {
        setCurrentEpisode({
            guid: episode.guid,
            podcast_id: episode.podcast_id,
            title: episode.title,
            enclosure_url: episode.enclosure_url,
            pub_date: episode.pub_date,
            content_snippet: episode.content_snippet
        })
        setActiveView('workspace')
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 mb-2">
                    My Library
                </h1>
                <p className="text-gray-400">Your personal podcast collection</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeLibraryTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveLibraryTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Episodes Grid */}
            {isLoading && libraryEpisodes.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                </div>
            ) : libraryEpisodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <p className="text-lg">
                        {activeLibraryTab === 'follow' && "You haven't followed any podcasts yet"}
                        {activeLibraryTab === 'like' && "You haven't liked any episodes yet"}
                        {activeLibraryTab === 'history' && "No listening history yet"}
                    </p>
                    <p className="text-sm mt-2">Start exploring to build your library!</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {libraryEpisodes.map((episode: LibraryEpisode) => (
                            <GlassContainer
                                key={episode.guid}
                                intensity="low"
                                className="p-4 cursor-pointer group hover:bg-white/5 transition-all duration-300"
                                onClick={() => handleEpisodeClick(episode)}
                            >
                                <div className="flex gap-4">
                                    {/* Podcast Artwork */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={episode.podcast?.artworkUrl600 || '/default-podcast.png'}
                                            alt={episode.podcast?.collectionName}
                                            className="w-20 h-20 rounded-lg shadow-lg"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* Episode Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate mb-1 group-hover:text-violet-400 transition-colors">
                                            {episode.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 truncate mb-2">
                                            {episode.podcast?.collectionName}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            {episode.pub_date && (
                                                <span>{new Date(episode.pub_date).toLocaleDateString()}</span>
                                            )}
                                            {episode.historyEntry && (
                                                <span className="text-violet-400">
                                                    {Math.round(episode.historyEntry.progress * 100)}% played
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </GlassContainer>
                        ))}
                    </div>

                    {/* Loading indicator for infinite scroll */}
                    {hasMore && (
                        <div ref={observerRef} className="flex justify-center py-8">
                            {isLoading && (
                                <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
