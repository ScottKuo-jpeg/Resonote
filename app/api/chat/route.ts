import { NextResponse } from "next/server"
import { getCachedChat, saveCachedChat } from "@/lib/cache"
import { PROMPTS } from "@/lib/prompts"
import { CONFIG } from "@/lib/config"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
    const { messages, transcript, episodeGuid } = await request.json()

    if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: "Messages required" }, { status: 400 })
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)} \n\n`))
            }

            try {
                // Load existing chat history from cache
                let chatHistory: Array<{ role: string; content: string }> = []
                if (episodeGuid) {
                    const cachedChat = await getCachedChat(episodeGuid)
                    if (cachedChat) {
                        chatHistory = cachedChat
                    }
                }

                // Build system prompt with transcript context
                const maxTranscriptLength = CONFIG.AI.LIMITS.MAX_TRANSCRIPT_LENGTH
                const safeTranscript = transcript.length > maxTranscriptLength
                    ? transcript.substring(0, maxTranscriptLength) + "\n...(truncated)..."
                    : transcript

                const systemMessage = {
                    role: "system",
                    content: PROMPTS.chat.system(safeTranscript)
                }

                // Combine history with new messages (only user messages from new request)
                const newUserMessage = messages[messages.length - 1]
                const apiMessages = [systemMessage, ...chatHistory, newUserMessage]

                logger.info(`Starting chat stream for episode: ${episodeGuid || 'unknown'}`)

                const response = await fetch(`${CONFIG.AI.BASE_URL}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${CONFIG.AI.API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: CONFIG.AI.MODELS.CHAT,
                        messages: apiMessages,
                        stream: true,
                        max_tokens: CONFIG.AI.LIMITS.MAX_TOKENS,
                    }),
                })

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`)
                }

                if (!response.body) {
                    throw new Error("No response body")
                }

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ""
                let assistantResponse = ""

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split("\n")
                    buffer = lines.pop() || ""

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6)
                            if (data === "[DONE]") {
                                sendEvent({ done: true })
                                continue
                            }

                            try {
                                const parsed = JSON.parse(data)
                                const content = parsed.choices?.[0]?.delta?.content
                                if (content) {
                                    assistantResponse += content
                                    sendEvent({ content })
                                }
                            } catch (e) {
                                // Skip parsing errors
                            }
                        }
                    }
                }

                // Save updated chat history to cache
                if (episodeGuid && assistantResponse) {
                    const updatedHistory = [
                        ...chatHistory,
                        newUserMessage,
                        { role: "assistant", content: assistantResponse }
                    ]
                    try {
                        await saveCachedChat(episodeGuid, updatedHistory)
                    } catch (cacheError) {
                        logger.error("Failed to cache chat:", cacheError)
                    }
                }
            } catch (error: any) {
                logger.error("Chat error:", error)
                sendEvent({ error: error.message })
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    })
}
