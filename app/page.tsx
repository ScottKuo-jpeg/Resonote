"use client"

import { useState } from "react"
import { PodcastSearch } from "@/components/PodcastSearch"
import { PodcastList, type Podcast } from "@/components/PodcastList"
import { EpisodeList, type Episode } from "@/components/EpisodeList"
import { AudioPlayer } from "@/components/AudioPlayer"
import { TranscriptionView } from "@/components/TranscriptionView"
import { ArrowLeft } from "lucide-react"

export default function Home() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)

  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false)

  // Transcription State
  const [transcriptionText, setTranscriptionText] = useState("")
  const [transcriptionStatus, setTranscriptionStatus] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)

  const handleSearch = async (term: string) => {
    setIsSearching(true)
    setSelectedPodcast(null)
    setEpisodes([])
    try {
      const res = await fetch(`/api/search?term=${encodeURIComponent(term)}`)
      const data = await res.json()
      setPodcasts(data.results || [])
    } catch (error) {
      console.error("Search failed", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectPodcast = async (podcast: Podcast) => {
    setSelectedPodcast(podcast)
    setIsLoadingEpisodes(true)
    try {
      const res = await fetch(`/api/rss?url=${encodeURIComponent(podcast.feedUrl)}`)
      const data = await res.json()
      setEpisodes(data.items || [])
    } catch (error) {
      console.error("RSS fetch failed", error)
    } finally {
      setIsLoadingEpisodes(false)
    }
  }

  const handleTranscribe = async (episode: Episode) => {
    if (!episode.enclosure?.url) return

    setIsTranscribing(true)
    setTranscriptionText("")
    setTranscriptionStatus("Initializing...")

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: episode.enclosure.url,
          title: episode.title
        }),
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

        // Keep the last part in the buffer as it might be incomplete
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.status) {
                if (data.status === "Completed" && data.savedPath) {
                  setTranscriptionStatus(`Saved to ${data.savedPath.split('/').pop()}`)
                } else {
                  setTranscriptionStatus(data.status)
                }
              }
              if (data.text) setTranscriptionText(data.text)
            } catch (e) {
              console.error("Parse error", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Transcription failed", error)
      setTranscriptionStatus("Failed")
    } finally {
      setIsTranscribing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pb-32">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Podcast AI
          </h1>
          <p className="text-gray-400 text-lg">
            Search, Listen, and Transcribe your favorite podcasts
          </p>
        </header>

        {!selectedPodcast ? (
          <>
            <PodcastSearch onSearch={handleSearch} isLoading={isSearching} />
            <PodcastList podcasts={podcasts} onSelect={handleSelectPodcast} />
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedPodcast(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Search
            </button>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <img
                src={selectedPodcast.artworkUrl600}
                alt={selectedPodcast.collectionName}
                className="w-48 h-48 rounded-xl shadow-2xl"
              />
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedPodcast.collectionName}</h2>
                <p className="text-xl text-gray-400 mb-4">{selectedPodcast.artistName}</p>
              </div>
            </div>

            {isLoadingEpisodes ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <EpisodeList
                episodes={episodes}
                onPlay={setCurrentEpisode}
                onTranscribe={handleTranscribe}
                currentEpisodeGuid={currentEpisode?.guid}
              />
            )}
          </div>
        )}
      </div>

      <AudioPlayer episode={currentEpisode} />

      <TranscriptionView
        text={transcriptionText}
        status={transcriptionStatus}
        isTranscribing={isTranscribing}
      />
    </main>
  )
}
