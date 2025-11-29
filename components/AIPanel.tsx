"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, MessageSquare, Network, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PremiumButton } from "@/components/ui/PremiumButton"
import { GlassContainer } from "@/components/ui/GlassContainer"

interface AIPanelProps {
    transcript: string
    episodeGuid?: string
    disabled?: boolean
    isTranscribing?: boolean
}

type Tab = "summary" | "mindmap" | "chat"

interface Message {
    role: "user" | "assistant"
    content: string
}

export function AIPanel({ transcript, episodeGuid, isTranscribing = false }: AIPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>("summary")
    const [summary, setSummary] = useState("")
    const [mindmap, setMindmap] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    const loadSummary = async () => {
        if (summary || !transcript) return
        setIsLoading(true)
        try {
            const res = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript, episodeGuid }),
            })
            const data = await res.json()
            setSummary(data.summary || "Failed to generate summary")
        } catch (error) {
            setSummary("Error generating summary")
        } finally {
            setIsLoading(false)
        }
    }

    const loadMindmap = async () => {
        if (mindmap || !transcript) return
        setIsLoading(true)
        try {
            const res = await fetch("/api/mindmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript, episodeGuid }),
            })
            const data = await res.json()
            setMindmap(data.mindmap || "Failed to generate mindmap")
        } catch (error) {
            setMindmap("Error generating mindmap")
        } finally {
            setIsLoading(false)
        }
    }

    const sendMessage = async () => {
        if (!input.trim() || !transcript) return

        const userMessage: Message = { role: "user", content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    transcript,
                    episodeGuid,
                }),
            })

            if (!response.ok) throw new Error("Chat request failed")
            if (!response.body) throw new Error("No response body")

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ""
            let assistantMessage = ""

            // Add empty assistant message
            setMessages(prev => [...prev, { role: "assistant", content: "" }])

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split("\n\n")
                buffer = lines.pop() || ""

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6))
                            if (data.content) {
                                assistantMessage += data.content
                                setMessages(prev => {
                                    const newMessages = [...prev]
                                    newMessages[newMessages.length - 1] = {
                                        role: "assistant",
                                        content: assistantMessage,
                                    }
                                    return newMessages
                                })
                            }
                        } catch (e) {
                            // Skip parsing errors
                        }
                    }
                }
            }
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "Sorry, I encountered an error." },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setSummary("")
        setMindmap("")
        setMessages([])
        setActiveTab("summary")
    }, [episodeGuid])

    useEffect(() => {
        // Only load if transcription is complete
        if (isTranscribing) {
            return
        }

        if (activeTab === "summary" && !summary && transcript) {
            loadSummary()
        } else if (activeTab === "mindmap" && !mindmap && transcript) {
            loadMindmap()
        }
    }, [activeTab, summary, mindmap, transcript, isTranscribing])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Show loading state while transcription is in progress
    const showLoading = isTranscribing || (!transcript && isTranscribing !== false)

    if (!transcript) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                {showLoading ? (
                    <div className="space-y-4 max-w-md">
                        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-violet-400">正在转译音频...</p>
                            <p className="text-sm text-gray-400">
                                所有音频块转译完成后将自动生成摘要和思维导图
                            </p>
                            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-xs text-gray-500">
                                    💡 提示：转译过程中AI面板将保持等待状态
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <Sparkles className="w-12 h-12 mb-4 text-gray-600" />
                        <p className="text-lg font-medium mb-2">AI Features Unavailable</p>
                        <p className="text-sm">Transcribe an episode to generate summaries, mindmaps, and chat with the content.</p>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-transparent">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
                <button
                    onClick={() => setActiveTab("summary")}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
                        activeTab === "summary"
                            ? "text-violet-400 bg-white/5"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Sparkles className="h-4 w-4" />
                    Summary
                    {activeTab === "summary" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("mindmap")}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
                        activeTab === "mindmap"
                            ? "text-violet-400 bg-white/5"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Network className="h-4 w-4" />
                    Mindmap
                    {activeTab === "mindmap" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("chat")}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
                        activeTab === "chat"
                            ? "text-violet-400 bg-white/5"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <MessageSquare className="h-4 w-4" />
                    Chat
                    {activeTab === "chat" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === "summary" && (
                    <div className="prose prose-invert max-w-none">
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-gray-400 animate-pulse">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating summary...
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">{summary}</div>
                        )}
                    </div>
                )}

                {activeTab === "mindmap" && (
                    <div className="prose prose-invert max-w-none">
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-gray-400 animate-pulse">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating mindmap...
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap text-gray-300 font-mono text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                                {mindmap}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "chat" && (
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <GlassContainer
                                key={idx}
                                intensity={msg.role === "user" ? "medium" : "low"}
                                className={cn(
                                    "p-4 rounded-2xl max-w-[90%]",
                                    msg.role === "user"
                                        ? "ml-auto bg-violet-500/10 border-violet-500/20"
                                        : "mr-auto"
                                )}
                            >
                                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                                    {msg.role === "user" ? "You" : "AI Assistant"}
                                </div>
                                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                            </GlassContainer>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Chat Input */}
            {activeTab === "chat" && (
                <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && !isLoading && sendMessage()}
                            placeholder="Ask about this podcast..."
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                            disabled={isLoading}
                        />
                        <PremiumButton
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="!px-3"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </PremiumButton>
                    </div>
                </div>
            )}
        </div>
    )
}
