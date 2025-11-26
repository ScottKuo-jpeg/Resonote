"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, MessageSquare, Network, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIPanelProps {
    transcript: string
    episodeGuid?: string
    disabled?: boolean
}

type Tab = "summary" | "mindmap" | "chat"

interface Message {
    role: "user" | "assistant"
    content: string
}

export function AIPanel({ transcript, episodeGuid }: AIPanelProps) {
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
        if (activeTab === "summary" && !summary) {
            loadSummary()
        } else if (activeTab === "mindmap" && !mindmap) {
            loadMindmap()
        }
    }, [activeTab])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    if (!transcript) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                <p>Transcribe an episode to enable AI features</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-gray-900">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
                <button
                    onClick={() => setActiveTab("summary")}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        activeTab === "summary"
                            ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    )}
                >
                    <Sparkles className="h-4 w-4" />
                    Summary
                </button>
                <button
                    onClick={() => setActiveTab("mindmap")}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        activeTab === "mindmap"
                            ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    )}
                >
                    <Network className="h-4 w-4" />
                    Mindmap
                </button>
                <button
                    onClick={() => setActiveTab("chat")}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        activeTab === "chat"
                            ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    )}
                >
                    <MessageSquare className="h-4 w-4" />
                    Chat
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "summary" && (
                    <div className="prose prose-invert max-w-none">
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating summary...
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap text-gray-300">{summary}</div>
                        )}
                    </div>
                )}

                {activeTab === "mindmap" && (
                    <div className="prose prose-invert max-w-none">
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating mindmap...
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
                                {mindmap}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "chat" && (
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "p-4 rounded-lg",
                                    msg.role === "user"
                                        ? "bg-blue-500/10 border border-blue-500/30 ml-8"
                                        : "bg-gray-800/50 border border-gray-700/50 mr-8"
                                )}
                            >
                                <div className="text-xs text-gray-500 mb-1">
                                    {msg.role === "user" ? "You" : "AI Assistant"}
                                </div>
                                <div className="text-gray-300 whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Chat Input */}
            {activeTab === "chat" && (
                <div className="p-4 border-t border-gray-800">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && !isLoading && sendMessage()}
                            placeholder="Ask about this podcast..."
                            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
