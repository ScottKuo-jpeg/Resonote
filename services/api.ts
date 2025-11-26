import { Podcast } from "@/components/PodcastList"
import { Episode } from "@/components/EpisodeList"

export interface SearchResponse {
    resultCount: number
    results: Podcast[]
}

export interface RSSResponse {
    items: Episode[]
    feed: {
        title: string
        description: string
        link: string
        image: string
    }
}

export interface TranscribeResponse {
    status?: string
    text?: string
    savedPath?: string
    error?: string
}

export const api = {
    searchPodcasts: async (term: string): Promise<Podcast[]> => {
        try {
            const res = await fetch(`/api/search?term=${encodeURIComponent(term)}`)
            if (!res.ok) throw new Error(`Search failed: ${res.statusText}`)
            const data: SearchResponse = await res.json()
            return data.results || []
        } catch (error) {
            console.error("API Error [searchPodcasts]:", error)
            throw error
        }
    },

    getEpisodes: async (feedUrl: string): Promise<Episode[]> => {
        try {
            const res = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`)
            if (!res.ok) throw new Error(`Failed to fetch episodes: ${res.statusText}`)
            const data: RSSResponse = await res.json()
            return data.items || []
        } catch (error) {
            console.error("API Error [getEpisodes]:", error)
            throw error
        }
    },

    transcribeEpisode: async (
        audioUrl: string,
        title: string,
        episodeGuid: string,
        onStatus: (status: string) => void,
        onText: (text: string) => void
    ) => {
        try {
            const response = await fetch("/api/transcribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audioUrl, title, episodeGuid }),
            })

            if (!response.ok) throw new Error("Transcription request failed")
            if (!response.body) throw new Error("No response body")

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ""

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split("\n\n")
                buffer = lines.pop() || ""

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data: TranscribeResponse = JSON.parse(line.slice(6))
                            if (data.status) {
                                if (data.status === "Completed" && data.savedPath) {
                                    onStatus(`Saved to ${data.savedPath.split('/').pop()}`)
                                } else {
                                    onStatus(data.status)
                                }
                            }
                            if (data.text) onText(data.text)
                            if (data.error) throw new Error(data.error)
                        } catch (e) {
                            console.error("Parse error", e)
                        }
                    }
                }
            }
        } catch (error) {
            console.error("API Error [transcribeEpisode]:", error)
            throw error
        }
    }
}
