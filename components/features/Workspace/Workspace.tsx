import { useContentStore } from "@/store/useContentStore"
import { usePlayerStore } from "@/store/usePlayerStore"
import { useTranscriptStore } from "@/store/useTranscriptStore"
import { useUIStore } from "@/store/useUIStore"
import { PremiumButton } from "@/components/ui/PremiumButton"
import { GlassContainer } from "@/components/ui/GlassContainer"
import { EpisodeList } from "@/components/EpisodeList"
import { TranscriptColumn } from "@/components/TranscriptColumn"
import { AIPanel } from "@/components/AIPanel"
import { ArrowLeft, FileText } from "lucide-react"

export function Workspace() {
    console.log("Workspace: Rendered")
    const {
        selectedPodcast,
        episodes,
        selectedEpisodeGuid,
        backToSearch,
        selectPodcast
    } = useContentStore()

    const {
        currentEpisode,
        setCurrentEpisode
    } = usePlayerStore()

    const {
        text,
        status,
        isTranscribing,
        transcribeEpisode
    } = useTranscriptStore()

    const setActiveView = useUIStore((state) => state.setActiveView)

    // Get the selected episode details
    const selectedEpisode = episodes.find(e => e.guid === selectedEpisodeGuid)

    const handleBack = () => {
        // Go back to podcast detail view
        setActiveView('podcast_detail')
    }

    if (!selectedPodcast) return null

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-white/5 bg-white/5 backdrop-blur-md z-10 shrink-0">
                <PremiumButton
                    variant="ghost"
                    onClick={handleBack}
                    className="mr-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Episodes
                </PremiumButton>
                <img
                    src={selectedPodcast.artworkUrl600}
                    className="w-8 h-8 rounded-lg shadow-lg mr-4"
                    alt={selectedPodcast.collectionName}
                />
                <div>
                    <h2 className="font-bold text-white text-sm">{selectedPodcast.collectionName}</h2>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Transcript (Left/Center) */}
                <div className="flex-1 bg-black/40 relative border-r border-white/5">
                    {text ? (
                        <TranscriptColumn
                            text={text}
                            onSeek={(time) => {
                                // @ts-ignore
                                if (window.seekAudio) window.seekAudio(time)
                            }}
                            title={selectedEpisode?.title}
                            description={selectedEpisode?.content_snippet}
                            podcastName={selectedPodcast.collectionName}
                            pubDate={selectedEpisode?.pub_date}
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
                                    <p className="text-gray-400">
                                        {selectedEpisode ? `Transcribe "${selectedEpisode.title}" to generate AI notes.` : "Select an episode to transcribe."}
                                    </p>

                                    {selectedEpisode && (
                                        <PremiumButton
                                            variant="primary"
                                            onClick={() => transcribeEpisode(selectedEpisode)}
                                            className="mt-4"
                                        >
                                            Start Transcription
                                        </PremiumButton>
                                    )}

                                    {status.includes("Failed") && selectedEpisode && (
                                        <PremiumButton
                                            variant="danger"
                                            onClick={() => transcribeEpisode(selectedEpisode)}
                                        >
                                            Retry Transcription
                                        </PremiumButton>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* AI Panel (Right) */}
                <GlassContainer intensity="low" border={false} className="w-[450px] flex flex-col rounded-none bg-[#0a0a0a]">
                    <AIPanel
                        transcript={text}
                        episodeGuid={selectedEpisodeGuid || ""}
                        disabled={isTranscribing || !text || status !== "Completed"}
                        isTranscribing={isTranscribing}
                    />
                </GlassContainer>
            </div>
        </div>
    )
}
