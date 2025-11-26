import { Play, Download, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Episode {
    guid: string
    title: string
    contentSnippet?: string
    enclosure?: {
        url: string
        length?: string
        type?: string
    }
    pubDate?: string
}

interface EpisodeListProps {
    episodes: Episode[]
    onEpisodeSelect: (episode: Episode) => void
    onTranscribe: (episode: Episode) => void
    onPlay: (episode: Episode) => void
    currentEpisodeGuid?: string
    selectedEpisodeGuid?: string
}

export function EpisodeList({ episodes, onEpisodeSelect, onPlay, onTranscribe, currentEpisodeGuid, selectedEpisodeGuid }: EpisodeListProps) {
    return (
        <div className="space-y-4">
            {episodes.map((episode) => {
                const isSelected = selectedEpisodeGuid === episode.guid
                const isPlaying = currentEpisodeGuid === episode.guid

                return (
                    <div
                        key={episode.guid}
                        onClick={() => onEpisodeSelect(episode)}
                        className={cn(
                            "p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                            isSelected
                                ? "bg-violet-500/10 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                                : "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600"
                        )}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                    "font-medium mb-2 truncate",
                                    isPlaying ? "text-blue-400" : (isSelected ? "text-violet-400" : "text-white")
                                )}>
                                    {episode.title}
                                </h4>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                    {episode.contentSnippet}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>{new Date(episode.pubDate || "").toLocaleDateString()}</span>
                                    {isPlaying && <span className="text-blue-400 flex items-center gap-1"><Play className="w-3 h-3" /> Playing</span>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onPlay(episode)
                                    }}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isPlaying ? "bg-blue-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                                    )}
                                    title="Play"
                                >
                                    <Play className={cn("h-4 w-4", isPlaying && "fill-current")} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onTranscribe(episode)
                                    }}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isSelected ? "bg-violet-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                                    )}
                                    title="Transcribe"
                                >
                                    <FileText className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
