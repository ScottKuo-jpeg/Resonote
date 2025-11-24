"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface PodcastSearchProps {
    onSearch: (term: string) => void
    isLoading: boolean
}

export function PodcastSearch({ onSearch, isLoading }: PodcastSearchProps) {
    const [term, setTerm] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (term.trim()) {
            onSearch(term)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className={cn(
                        "block w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl",
                        "text-white placeholder-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-300 ease-in-out",
                        "backdrop-blur-sm"
                    )}
                    placeholder="Search for podcasts..."
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                    {isLoading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                    )}
                </div>
            </div>
        </form>
    )
}
