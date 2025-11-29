"use client"

import { useState, useEffect, useRef } from "react"
import { useContentStore } from "@/store/useContentStore"
import { useUIStore } from "@/store/useUIStore"
import { PremiumButton } from "@/components/ui/PremiumButton"
import { GlassContainer } from "@/components/ui/GlassContainer"
import { Search, TrendingUp, Sparkles, Mic2, Brain, Zap } from "lucide-react"
import { Podcast } from "@/types"

export function Discovery() {
    const { podcasts, searchPodcasts, selectPodcast, isSearching } = useContentStore()
    const setActiveView = useUIStore((state) => state.setActiveView)
    const [term, setTerm] = useState("")
    const [trendingPodcasts, setTrendingPodcasts] = useState<Podcast[]>([])
    const [isLoadingTrending, setIsLoadingTrending] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        fetchTrendingPodcasts()
        initParticles()
    }, [])

    const fetchTrendingPodcasts = async () => {
        setIsLoadingTrending(true)
        try {
            const response = await fetch('/api/trending')
            const data = await response.json()
            if (data.results) {
                setTrendingPodcasts(data.results)
            }
        } catch (error) {
            console.error('Failed to fetch trending podcasts:', error)
            setTrendingPodcasts([])
        } finally {
            setIsLoadingTrending(false)
        }
    }

    const initParticles = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const particles: Array<{
            x: number
            y: number
            vx: number
            vy: number
            size: number
            opacity: number
        }> = []

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((particle, i) => {
                particle.x += particle.vx
                particle.y += particle.vy

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

                // Draw particle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`
                ctx.fill()

                // Draw connections
                particles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x
                    const dy = particle.y - otherParticle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 150) {
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(otherParticle.x, otherParticle.y)
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 150)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                })
            })

            requestAnimationFrame(animate)
        }

        animate()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!term.trim()) return
        await searchPodcasts(term)
    }

    const handlePodcastClick = (podcast: Podcast) => {
        console.log("Discovery: Podcast clicked", podcast.collectionName)
        selectPodcast(podcast)
        setActiveView('podcast_detail')
    }

    const displayPodcasts = podcasts.length > 0 ? podcasts : trendingPodcasts

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a]">
            {/* Animated Particle Background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none opacity-40"
            />

            {/* Gradient Orbs */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
                {/* Hero Section */}
                <div className="text-center mb-20 space-y-8">
                    {/* Logo/Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 animate-pulse" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                                <Mic2 className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-4">
                        <h1 className="text-7xl md:text-8xl font-black tracking-tight">
                            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 animate-float">
                                Podcast
                            </span>
                            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 ml-4 animate-float" style={{ animationDelay: '0.2s' }}>
                                AI
                            </span>
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-violet-400">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="text-sm font-medium tracking-wider uppercase">Powered by Artificial Intelligence</span>
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                    </div>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                        Experience podcasts like never before with{" "}
                        <span className="text-violet-400 font-semibold">AI-powered transcription</span>,{" "}
                        <span className="text-fuchsia-400 font-semibold">intelligent summarization</span>, and{" "}
                        <span className="text-indigo-400 font-semibold">mind mapping</span>.
                    </p>

                    {/* Features Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                        {[
                            { icon: Brain, text: "AI Analysis", color: "from-violet-500 to-purple-500" },
                            { icon: Zap, text: "Instant Transcription", color: "from-fuchsia-500 to-pink-500" },
                            { icon: Sparkles, text: "Smart Notes", color: "from-indigo-500 to-blue-500" }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group relative"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-full blur opacity-30 group-hover:opacity-60 transition`} />
                                <div className="relative flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/10">
                                    <feature.icon className="w-4 h-4 text-violet-400" />
                                    <span className="text-sm font-medium text-gray-300">{feature.text}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group pt-8">
                        <div className={`absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 rounded-3xl blur-lg transition-all duration-500 ${isFocused ? 'opacity-75 scale-105' : 'opacity-25'
                            }`} />
                        <div className="relative flex items-center">
                            <div className="absolute left-6 pointer-events-none">
                                <Search className={`w-5 h-5 transition-all duration-300 ${isFocused ? 'text-violet-400 scale-110' : 'text-gray-500'
                                    }`} />
                            </div>
                            <input
                                type="text"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Search for podcasts..."
                                className="relative w-full pl-14 pr-32 py-5 rounded-3xl bg-black/70 border border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none text-white placeholder-gray-500 backdrop-blur-2xl transition-all text-lg"
                            />
                            <PremiumButton
                                type="submit"
                                disabled={isSearching}
                                className="absolute right-2 !py-3 !px-6 !rounded-2xl"
                            >
                                {isSearching ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Searching...</span>
                                    </div>
                                ) : (
                                    <span>Search</span>
                                )}
                            </PremiumButton>
                        </div>
                    </form>
                </div>

                {/* Section Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-violet-500/30 blur-xl rounded-full" />
                        <TrendingUp className="relative w-6 h-6 text-violet-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                        {podcasts.length > 0 ? 'Search Results' : 'Trending Podcasts'}
                    </h2>
                    {displayPodcasts.length > 0 && (
                        <span className="text-sm text-gray-500 font-mono">
                            ({displayPodcasts.length})
                        </span>
                    )}
                </div>

                {/* Podcasts Grid */}
                {isLoadingTrending && podcasts.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 animate-pulse" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 bg-white/10 rounded-lg animate-pulse w-3/4" />
                                        <div className="h-4 bg-white/5 rounded-lg animate-pulse w-1/2" />
                                        <div className="h-6 bg-white/5 rounded-lg animate-pulse w-20" />
                                    </div>
                                </div>
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayPodcasts.map((podcast, index) => (
                            <div
                                key={podcast.collectionId}
                                className="group relative"
                                style={{
                                    animation: 'fadeInUp 0.6s ease-out forwards',
                                    animationDelay: `${index * 0.05}s`,
                                    opacity: 0
                                }}
                            >
                                {/* Glow effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500" />

                                {/* Card */}
                                <GlassContainer
                                    intensity="low"
                                    className="relative cursor-pointer p-6 flex items-start gap-4 hover:bg-white/10 transition-all duration-500 transform group-hover:scale-[1.02] group-hover:-translate-y-1"
                                    onClick={() => handlePodcastClick(podcast)}
                                >
                                    {/* Artwork */}
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                                        <img
                                            src={podcast.artworkUrl600}
                                            alt={podcast.collectionName}
                                            className="relative w-24 h-24 rounded-xl shadow-2xl group-hover:shadow-violet-500/30 transition-all duration-500 transform group-hover:scale-105"
                                        />
                                        {/* Play overlay */}
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                                <div className="w-0 h-0 border-l-[12px] border-l-violet-600 border-y-[8px] border-y-transparent ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-white text-lg mb-1 line-clamp-2 group-hover:text-violet-400 transition-colors duration-300">
                                            {podcast.collectionName}
                                        </h3>
                                        <p className="text-sm text-gray-400 mb-3 line-clamp-1 group-hover:text-gray-300 transition-colors">
                                            {podcast.artistName}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 px-3 py-1.5 rounded-lg border border-violet-500/30 text-xs font-medium text-violet-300 group-hover:border-violet-400/50 transition-colors">
                                                <Sparkles className="w-3 h-3" />
                                                {podcast.primaryGenreName}
                                            </span>
                                        </div>
                                    </div>
                                </GlassContainer>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoadingTrending && displayPodcasts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-violet-500/30 blur-2xl rounded-full" />
                            <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full flex items-center justify-center">
                                <Search className="w-10 h-10 text-violet-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No podcasts found</h3>
                        <p className="text-gray-400">Try searching for something else</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    )
}
