import { usePodcastStore } from "@/store/usePodcastStore"
import { PremiumButton } from "@/components/ui/PremiumButton"
import { GlassContainer } from "@/components/ui/GlassContainer"
import { EpisodeList } from "@/components/EpisodeList"
import { TranscriptColumn } from "@/components/TranscriptColumn"
import { AIPanel } from "@/components/AIPanel"
import { ArrowLeft, FileText } from "lucide-react"

export function Workspace() {
    const store = usePodcastStore()
    const {
        selectedPodcast,
        episodes,
        currentEpisode,
        selectedEpisodeGuid,
        text,
        status,
        isTranscribing,
        backToSearch,
        setCurrentEpisode,
        transcribeEpisode,
        selectedEpisodeGuid: currentSelectedGuid // Alias to avoid conflict if needed, but store has it
    } = store

    if (!selectedPodcast) return null

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
            {/* Header */}
            <div className="h-20 flex items-center px-6 border-b border-white/5 bg-white/5 backdrop-blur-md z-10 shrink-0">
                <PremiumButton
                    variant="ghost"
                    onClick={backToSearch}
                    className="mr-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </PremiumButton>
                <img
                    src={selectedPodcast.artworkUrl600}
                    className="w-10 h-10 rounded-lg shadow-lg mr-4"
                    alt={selectedPodcast.collectionName}
                />
                <div>
                    <h2 className="font-bold text-white">{selectedPodcast.collectionName}</h2>
                    <p className="text-sm text-gray-400">{selectedPodcast.artistName}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Episodes List */}
                <GlassContainer intensity="low" border={false} className="w-80 border-r border-white/5 flex flex-col rounded-none">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-semibold text-gray-400 text-sm uppercase tracking-wider">Episodes</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <EpisodeList
                            episodes={episodes}
                            onEpisodeSelect={(ep) => {
                                store.setSelectedEpisodeGuid(ep.guid)
                            }}
                            onTranscribe={transcribeEpisode}
                            onPlay={setCurrentEpisode}
                            currentEpisodeGuid={currentEpisode?.guid}
                            selectedEpisodeGuid={selectedEpisodeGuid || undefined}
                        />
                    </div>
                </GlassContainer>

                {/* Transcript */}
                <div className="flex-1 bg-black/40 relative">
                    {text ? (
                        <TranscriptColumn
                            text={text}
                            onSeek={(time) => {
                                // @ts-ignore
                                if (window.seekAudio) window.seekAudio(time)
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                            {isTranscribing ? (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-lg font-medium text-violet-400 animate-pulse">{status}</p>
                                </div>
                            ) : (
                                <div className="max-w-md space-y-4">
                                    <GlassContainer className="w-24 h-24 flex items-center justify-center mx-auto mb-6 rounded-full bg-white/5">
                                        <FileText className="w-10 h-10 text-gray-400" />
                                    </GlassContainer>
                                    <h3 className="text-2xl font-bold text-white">Ready to Transcribe</h3>
                                    <p className="text-gray-400">Select an episode from the list and click the transcribe button to generate AI-powered notes.</p>
                                    {status.includes("Failed") && (
                                        <PremiumButton
                                            variant="danger"
                                            onClick={() => currentEpisode && transcribeEpisode(currentEpisode)}
                                        >
                                            Retry Transcription
                                        </PremiumButton>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* AI Panel */}
                <GlassContainer intensity="low" border={false} className="w-96 border-l border-white/5 flex flex-col rounded-none">
                    <AIPanel
                        transcript={text}
                        episodeGuid={selectedEpisodeGuid || ""}
                        disabled={isTranscribing || !text || status !== "Completed"}
                    />
                </GlassContainer>
            </div>
        </div>
    )
}
