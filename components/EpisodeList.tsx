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
    onPlay: (episode: Episode) => void
    onTranscribe: (episode: Episode) => void
    currentEpisodeGuid?: string
}

export function EpisodeList({ episodes, onPlay, onTranscribe, currentEpisodeGuid }: EpisodeListProps) {
    return (
        <div className="space-y-4">
            {episodes.map((episode) => (
                <div
                    key={episode.guid}
                    className={cn(
                        "p-4 rounded-xl border transition-all duration-300",
                        currentEpisodeGuid === episode.guid
                            ? "bg-blue-500/10 border-blue-500/50"
                            : "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600"
                    )}
                >
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <h4 className={cn(
                                "font-medium mb-2 truncate",
                                currentEpisodeGuid === episode.guid ? "text-blue-400" : "text-white"
                            )}>
                                {episode.title}
                            </h4>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                {episode.contentSnippet}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{new Date(episode.pubDate || "").toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                            <button
                                onClick={() => onPlay(episode)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="Play"
                            >
                                <Play className="h-4 w-4 fill-current" />
                            </button>
                            <button
                                onClick={() => onTranscribe(episode)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="Transcribe"
                            >
                                <FileText className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
