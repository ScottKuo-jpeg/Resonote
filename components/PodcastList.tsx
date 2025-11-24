import { cn } from "@/lib/utils"

export interface Podcast {
    collectionId: number
    collectionName: string
    artistName: string
    artworkUrl600: string
    feedUrl: string
}

interface PodcastListProps {
    podcasts: Podcast[]
    onSelect: (podcast: Podcast) => void
}

export function PodcastList({ podcasts, onSelect }: PodcastListProps) {
    if (podcasts.length === 0) return null

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {podcasts.map((podcast) => (
                <div
                    key={podcast.collectionId}
                    onClick={() => onSelect(podcast)}
                    className={cn(
                        "group cursor-pointer bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/50",
                        "hover:border-blue-500/50 hover:bg-gray-800/50 hover:shadow-lg hover:shadow-blue-500/10",
                        "transition-all duration-300 transform hover:-translate-y-1"
                    )}
                >
                    <div className="aspect-square relative overflow-hidden">
                        <img
                            src={podcast.artworkUrl600}
                            alt={podcast.collectionName}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold text-white truncate mb-1 group-hover:text-blue-400 transition-colors">
                            {podcast.collectionName}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">{podcast.artistName}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
