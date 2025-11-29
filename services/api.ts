import { Podcast, Episode, SearchResponse, RSSResponse, TranscribeResponse } from "@/types"

export { type SearchResponse, type RSSResponse, type TranscribeResponse }

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
            if (!res.ok) {
                // Try to get detailed error from response body
                const errorData = await res.json().catch(() => ({ error: res.statusText }))
                const errorMsg = errorData.details || errorData.error || res.statusText
                throw new Error(`Failed to fetch episodes: ${errorMsg}`)
            }
            const data: RSSResponse = await res.json()
            console.log('🔍 RSS API Response:', {
                itemCount: data.items?.length || 0,
                firstItem: data.items?.[0] ? {
                    title: data.items[0].title,
                    pub_date: data.items[0].pub_date,
                    content_snippet: data.items[0].content_snippet?.substring(0, 50)
                } : null
            })
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
