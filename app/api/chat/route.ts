import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const { messages, transcript } = await request.json()

    if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: "Messages required" }, { status: 400 })
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            }

            try {
                // Build system prompt with transcript context
                const systemMessage = {
                    role: "system",
                    content: transcript
                        ? `You are a helpful AI assistant analyzing a podcast transcript. Here is the transcript:\n\n${transcript}\n\nAnswer questions based on this transcript.`
                        : "You are a helpful AI assistant."
                }

                const apiMessages = [systemMessage, ...messages]

                const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.SILICONFLOW_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "Qwen/Qwen2.5-72B-Instruct",
                        messages: apiMessages,
                        stream: true,
                        max_tokens: 2048,
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
                                    sendEvent({ content })
                                }
                            } catch (e) {
                                // Skip parsing errors
                            }
                        }
                    }
                }
            } catch (error: any) {
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
