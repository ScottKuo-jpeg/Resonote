import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { getCachedTranscript, saveCachedTranscript } from "@/lib/cache"

// This is a simplified implementation. 
// For a real production app, we would need a proper job queue (Redis/Bull) 
// to handle long-running transcriptions and SSE for status updates.
// Given the constraints and the "real-time" requirement with a file-based API,
// we will simulate the progress for the user while waiting for the actual API response.

function sanitizeFilename(name: string) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

export async function POST(request: Request) {
    const { audioUrl, title, episodeGuid } = await request.json()

    if (!audioUrl) {
        return NextResponse.json({ error: "Audio URL required" }, { status: 400 })
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            }

            try {
                // Check cache first
                if (episodeGuid) {
                    const cachedTranscript = await getCachedTranscript(episodeGuid)
                    if (cachedTranscript) {
                        sendEvent({ status: "Loaded from cache", text: cachedTranscript })
                        sendEvent({ status: "Completed", text: cachedTranscript })
                        controller.close()
                        return
                    }
                }

                // 1. Download Audio
                sendEvent({ status: "Downloading audio...", text: "" })

                const audioResponse = await fetch(audioUrl)
                if (!audioResponse.ok) throw new Error("Failed to download audio")
                const audioBlob = await audioResponse.blob()

                // 2. Upload to SiliconFlow
                sendEvent({ status: "Transcribing with SiliconFlow...", text: "" })

                const formData = new FormData()
                formData.append("file", audioBlob, "audio.mp3")
                formData.append("model", "TeleAI/TeleSpeechASR")

                const response = await fetch("https://api.siliconflow.cn/v1/audio/transcriptions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.SILICONFLOW_API_KEY}`,
                    },
                    body: formData,
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`SiliconFlow API Error: ${response.status} ${errorText}`)
                }

                const result = await response.json()

                // 3. Save to cache
                if (episodeGuid && result.text) {
                    try {
                        await saveCachedTranscript(episodeGuid, result.text, {
                            title: title || 'Unknown Episode',
                            podcastId: episodeGuid.split('-')[0] || 'unknown',
                            enclosureUrl: audioUrl,
                        })
                    } catch (cacheError) {
                        console.error("Failed to cache transcript:", cacheError)
                    }
                }

                // 4. Save to File (legacy)
                let savedPath = ""
                if (title && result.text) {
                    try {
                        const transcriptsDir = path.join(process.cwd(), "transcripts")
                        await fs.mkdir(transcriptsDir, { recursive: true })

                        const filename = `${sanitizeFilename(title)}.txt`
                        savedPath = path.join(transcriptsDir, filename)

                        await fs.writeFile(savedPath, result.text, "utf-8")
                        sendEvent({ status: "Saving...", text: result.text })
                    } catch (saveError) {
                        console.error("Failed to save transcript:", saveError)
                        // Don't fail the whole request if saving fails, just log it
                    }
                }

                // 5. Send Result
                sendEvent({ status: "Completed", text: result.text, savedPath })

            } catch (error: any) {
                console.error("Transcription error:", error)
                sendEvent({ status: "Error", text: `Error: ${error.message}` })
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
