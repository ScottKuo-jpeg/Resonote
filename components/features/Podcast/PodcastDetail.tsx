"use client"

import { useContentStore } from "@/store/useContentStore"
import { useUIStore } from "@/store/useUIStore"
import { usePlayerStore } from "@/store/usePlayerStore"
import { useTranscriptStore } from "@/store/useTranscriptStore"
import { PremiumButton } from "@/components/ui/PremiumButton"
import { ArrowLeft, Play, FileText } from "lucide-react"
import { Episode } from "@/types"

export function PodcastDetail() {
    const { selectedPodcast, episodes, selectPodcast, setSelectedEpisodeGuid } = useContentStore()
    const setActiveView = useUIStore((state) => state.setActiveView)
    const { setCurrentEpisode } = usePlayerStore()
    const { transcribeEpisode } = useTranscriptStore()

    if (!selectedPodcast) return null

    const handleBack = () => {
        setActiveView('discover')
    }

    const handleEpisodeClick = (episode: Episode) => {
        setSelectedEpisodeGuid(episode.guid)
        setActiveView('workspace') // Navigate to Episode Detail
    }

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
            {/* Header / Navigation */}
            <div className="h-16 flex items-center px-8 border-b border-white/5">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Discover
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
                    {/* Left Column: Podcast Info */}
                    <div className="w-full md:w-80 flex-shrink-0">
                        <img
                            src={selectedPodcast.artworkUrl600}
                            alt={selectedPodcast.collectionName}
                            className="w-full aspect-square rounded-2xl shadow-2xl mb-6"
                        />
                        <h1 className="text-2xl font-bold mb-2">{selectedPodcast.collectionName}</h1>
                        <p className="text-violet-400 font-medium mb-6">{selectedPodcast.artistName}</p>

                        <div className="flex gap-3 mb-8">
                            <PremiumButton className="flex-1 justify-center">
                                Subscribe
                            </PremiumButton>
                        </div>

                        <div className="text-gray-400 text-sm leading-relaxed">
                            <h3 className="text-white font-bold uppercase text-xs tracking-wider mb-2">About</h3>
                            <p>Explore the depths of {selectedPodcast.primaryGenreName} with {selectedPodcast.artistName}. New episodes every week.</p>
                        </div>
                    </div>

                    {/* Right Column: Episode List */}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            Episodes
                            <span className="text-sm font-normal text-gray-500">({episodes.length})</span>
                        </h2>

                        <div className="space-y-4">
                            {episodes.map((episode) => (
                                <div
                                    key={episode.guid}
                                    className="group bg-[#111] hover:bg-[#161616] border border-white/5 rounded-xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1" onClick={() => handleEpisodeClick(episode)}>
                                            <h3 className="text-lg font-bold text-gray-200 group-hover:text-white mb-2 line-clamp-1">
                                                {episode.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                                {episode.description?.replace(/<[^>]*>/g, '') || "No description available."}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-600 font-mono">
                                                <span>{new Date(episode.pubDate).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{episode.itunesDuration || "00:00"}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setCurrentEpisode(episode)
                                                }}
                                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-violet-500 text-white flex items-center justify-center transition-all"
                                            >
                                                <Play className="w-4 h-4 fill-current" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleEpisodeClick(episode)
                                                    // Trigger transcribe if needed, or just go to view
                                                }}
                                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
