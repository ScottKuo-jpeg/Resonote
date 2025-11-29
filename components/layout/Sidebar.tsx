"use client"

import { useUIStore } from "@/store/useUIStore"
import { Compass, Library, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const { activeView, setActiveView } = useUIStore()

    const tabs = [
        { id: 'discover' as const, label: 'Discover', icon: Compass },
        { id: 'library' as const, label: 'Library', icon: Library },
        { id: 'notes' as const, label: 'Notes', icon: BookOpen },
    ]

    return (
        <div className="fixed left-0 top-0 h-full w-20 bg-black/40 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col items-center py-8">
            {/* Logo */}
            <div className="mb-12">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <span className="text-white font-bold text-xl">R</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex-1 flex flex-col gap-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeView === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveView(tab.id)}
                            className={cn(
                                "relative group flex flex-col items-center gap-2 px-3 py-4 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-br from-violet-500/20 to-indigo-600/20 backdrop-blur-sm"
                                    : "hover:bg-white/5"
                            )}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-r-full" />
                            )}

                            {/* Icon */}
                            <div className={cn(
                                "p-2 rounded-lg transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/50"
                                    : "bg-white/5 group-hover:bg-white/10"
                            )}>
                                <Icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                                )} />
                            </div>

                            {/* Label */}
                            <span className={cn(
                                "text-xs font-medium transition-colors",
                                isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                            )}>
                                {tab.label}
                            </span>

                            {/* Glow Effect */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/10 to-indigo-600/0 rounded-xl blur-xl" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Settings (Future) */}
            <div className="mt-auto">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-500 opacity-50" />
                </div>
            </div>
        </div>
    )
}
