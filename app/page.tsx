"use client"

import { useEffect, useRef } from "react"
import { usePodcastStore } from "@/store/usePodcastStore"
import { Discovery } from "@/components/features/Discovery/Discovery"
import { Workspace } from "@/components/features/Workspace/Workspace"
import { AudioPlayer, type AudioPlayerHandle } from "@/components/AudioPlayer"

export default function Home() {
  const { activeView, currentEpisode } = usePodcastStore()
  const audioPlayerRef = useRef<AudioPlayerHandle>(null)

  // Expose seek function to window for transcript clicks
  useEffect(() => {
    // @ts-ignore
    window.seekAudio = (time: number) => {
      audioPlayerRef.current?.seek(time)
    }
    return () => {
      // @ts-ignore
      delete window.seekAudio
    }
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {activeView === 'search' ? (
        <Discovery />
      ) : (
        <Workspace />
      )}

      {/* Global Audio Player */}
      <AudioPlayer ref={audioPlayerRef} episode={currentEpisode} />
    </main>
  )
}
