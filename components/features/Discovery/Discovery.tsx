import { useState } from "react"
import { useContentStore } from "@/store/useContentStore"
import { useUIStore } from "@/store/useUIStore"
import { PremiumButton } from "@/components/ui/PremiumButton"
import { GlassContainer } from "@/components/ui/GlassContainer"
import { Search } from "lucide-react"
import { Podcast } from "@/types"

export function Discovery() {
    const { podcasts, searchPodcasts, selectPodcast, isSearching } = useContentStore()
    const setActiveView = useUIStore((state) => state.setActiveView)
    const [term, setTerm] = useState("")

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!term.trim()) return
        await searchPodcasts(term)
    }

    const handlePodcastClick = (podcast: Podcast) => {
        console.log("Discovery: Podcast clicked", podcast.collectionName)
        selectPodcast(podcast)
        setActiveView('workspace')
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="text-center mb-16 space-y-6">
                <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 animate-float">
                    Podcast AI
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Experience podcasts like never before with AI-powered transcription, summarization, and mind mapping.
                </p>

                <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                    <input
                        type="text"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Search for podcasts..."
                        className="relative w-full px-6 py-4 rounded-2xl bg-black/50 border border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-gray-500 backdrop-blur-xl transition-all"
                    />
                    <PremiumButton
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-2 top-2 bottom-2 !py-0 !px-3"
                    >
                        {isSearching ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                    </PremiumButton>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {podcasts.map((podcast) => (
                    <GlassContainer
                        key={podcast.collectionId}
                        intensity="low"
                        className="relative z-10 cursor-pointer p-4 flex items-center gap-4 group hover:bg-white/5 transition-all duration-300 hover:scale-[1.02]"
                        onClick={() => handlePodcastClick(podcast)}
                    >
                        <img
                            src={podcast.artworkUrl600}
                            alt={podcast.collectionName}
                            className="w-20 h-20 rounded-xl shadow-lg group-hover:shadow-violet-500/20 transition-all duration-300"
                        />
                        <div className="min-w-0">
                            <h3 className="font-semibold text-white truncate group-hover:text-violet-400 transition-colors">
                                {podcast.collectionName}
                            </h3>
                            <p className="text-sm text-gray-400 truncate">{podcast.artistName}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                    {podcast.primaryGenreName}
                                </span>
                            </div>
                        </div>
                    </GlassContainer>
                ))}
            </div>
        </div>
    )
}
