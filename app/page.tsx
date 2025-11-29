"use client"

import { useEffect, useRef } from "react"
import { useUIStore } from "@/store/useUIStore"
import { usePlayerStore } from "@/store/usePlayerStore"
import { Sidebar } from "@/components/layout/Sidebar"
import { Discovery } from "@/components/features/Discovery/Discovery"
import { Library } from "@/components/features/Library/Library"
import { Notes } from "@/components/features/Notes/Notes"
import { Workspace } from "@/components/features/Workspace/Workspace"
import { AudioPlayer, type AudioPlayerHandle } from "@/components/AudioPlayer"

export default function Home() {
  const activeView = useUIStore((state) => state.activeView)
  console.log("Home: activeView changed to", activeView)
  const currentEpisode = usePlayerStore((state) => state.currentEpisode)
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
    <main className="min-h-screen bg-background text-foreground overflow-hidden relative flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area with left padding for sidebar */}
      <div className="flex-1 ml-20">
        {activeView === 'discover' && <Discovery />}
        {activeView === 'library' && <Library />}
        {activeView === 'notes' && <Notes />}
        {activeView === 'workspace' && <Workspace />}
      </div>

      {/* Global Audio Player */}
      <AudioPlayer ref={audioPlayerRef} episode={currentEpisode} />
    </main>
  )
}

