"use client"

import { useState, useRef } from "react"
import { PodcastSearch } from "@/components/PodcastSearch"
import { PodcastList, type Podcast } from "@/components/PodcastList"
import { EpisodeList, type Episode } from "@/components/EpisodeList"
import { AudioPlayer, type AudioPlayerHandle } from "@/components/AudioPlayer"
import { TranscriptColumn } from "@/components/TranscriptColumn"
import { AIPanel } from "@/components/AIPanel"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Home() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [selectedEpisodeGuid, setSelectedEpisodeGuid] = useState<string | null>(null)

  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false)

  // Transcription State
  const [transcriptionText, setTranscriptionText] = useState("")
  const [transcriptionStatus, setTranscriptionStatus] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)

  // UI State
  const [isEpisodeListCollapsed, setIsEpisodeListCollapsed] = useState(false)

  const audioPlayerRef = useRef<AudioPlayerHandle>(null)

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

    setSelectedEpisodeGuid(episode.guid)
    setIsTranscribing(true)
    setTranscriptionText("")
    setTranscriptionStatus("Initializing...")

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: episode.enclosure.url,
          title: episode.title,
          episodeGuid: episode.guid
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

  const handleSeek = (time: number) => {
    audioPlayerRef.current?.seek(time)
  }

  // Search View
  if (!selectedPodcast) {
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

          <PodcastSearch onSearch={handleSearch} isLoading={isSearching} />
          <PodcastList podcasts={podcasts} onSelect={handleSelectPodcast} />
        </div>
      </main>
    )
  }

  // Dashboard View (Split Screen)
  return (
    <main className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setSelectedPodcast(null)
              setTranscriptionText("")
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Search
          </button>
          <div className="flex items-center gap-4">
            <img
              src={selectedPodcast.artworkUrl600}
              alt={selectedPodcast.collectionName}
              className="w-12 h-12 rounded-lg"
            />
            <div>
              <h2 className="font-bold">{selectedPodcast.collectionName}</h2>
              <p className="text-sm text-gray-400">{selectedPodcast.artistName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden pb-20">
        {/* Left: Episode List */}
        <div
          className={cn(
            "border-r border-gray-800 bg-gray-900/50 transition-all duration-300 overflow-hidden",
            isEpisodeListCollapsed ? "w-12" : "w-80"
          )}
        >
          {isEpisodeListCollapsed ? (
            <button
              onClick={() => setIsEpisodeListCollapsed(false)}
              className="w-full h-full flex items-center justify-center hover:bg-gray-800/50 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="font-semibold">Episodes</h3>
                <button
                  onClick={() => setIsEpisodeListCollapsed(true)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
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
            </div>
          )}
        </div>

        {/* Center: Transcript */}
        <div className="flex-1 bg-gray-900 overflow-hidden">
          {transcriptionText ? (
            <TranscriptColumn text={transcriptionText} onSeek={handleSeek} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              {isTranscribing ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-lg">{transcriptionStatus}</p>
                </>
              ) : (
                <p>Select an episode and click "Transcribe" to begin</p>
              )}
            </div>
          )}
        </div>

        {/* Right: AI Panel */}
        {transcriptionText && (
          <div className="w-96 border-l border-gray-800 bg-gray-900/50">
            <AIPanel transcript={transcriptionText} episodeGuid={selectedEpisodeGuid || undefined} />
          </div>
        )}
      </div>

      {/* Audio Player */}
      <AudioPlayer ref={audioPlayerRef} episode={currentEpisode} />
    </main>
  )
}
