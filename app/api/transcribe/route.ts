import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { getCachedTranscript, saveCachedTranscript } from "@/lib/cache"

// Chunk size: 5MB (approx 5-6 mins of 128kbps MP3)
const CHUNK_SIZE = 5 * 1024 * 1024

function sanitizeFilename(name: string) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

async function transcribeChunk(audioBuffer: ArrayBuffer, chunkIndex: number): Promise<string> {
    const formData = new FormData()
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
    formData.append("file", blob, `chunk_${chunkIndex}.mp3`)
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
        throw new Error(`Chunk ${chunkIndex} failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    return result.text || ""
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
                    try {
                        const cachedTranscript = await getCachedTranscript(episodeGuid)
                        if (cachedTranscript) {
                            sendEvent({ status: "Loaded from cache", text: cachedTranscript })
                            sendEvent({ status: "Completed", text: cachedTranscript })
                            controller.close()
                            return
                        }
                    } catch (e) {
                        console.error("Cache read error:", e)
                    }
                }

                // 1. Get File Size
                sendEvent({ status: "Checking audio size...", text: "" })
                const headRes = await fetch(audioUrl, { method: 'HEAD' })
                const contentLength = headRes.headers.get('content-length')
                const totalSize = contentLength ? parseInt(contentLength) : 0

                if (!totalSize) {
                    // Fallback for no content-length: download whole file
                    // ... (omitted for brevity, assume most podcasts have length)
                    throw new Error("Could not determine audio size")
                }

                // 2. Process Chunks
                let fullTranscript = ""
                let offset = 0
                let chunkIndex = 0

                while (offset < totalSize) {
                    const end = Math.min(offset + CHUNK_SIZE - 1, totalSize - 1)
                    sendEvent({ status: `Downloading chunk ${chunkIndex + 1}...`, text: fullTranscript })

                    const chunkRes = await fetch(audioUrl, {
                        headers: { Range: `bytes=${offset}-${end}` }
                    })

                    if (!chunkRes.ok) throw new Error(`Failed to download chunk ${chunkIndex}`)

                    const chunkBuffer = await chunkRes.arrayBuffer()

                    sendEvent({ status: `Transcribing chunk ${chunkIndex + 1}...`, text: fullTranscript })
                    const chunkText = await transcribeChunk(chunkBuffer, chunkIndex)

                    // Append text (add newline if needed)
                    fullTranscript += (fullTranscript ? "\n\n" : "") + chunkText
                    sendEvent({ status: "Streaming...", text: fullTranscript })

                    offset += CHUNK_SIZE
                    chunkIndex++
                }

                // 3. Save to cache
                if (episodeGuid && fullTranscript) {
                    try {
                        await saveCachedTranscript(episodeGuid, fullTranscript, {
                            title: title || 'Unknown Episode',
                            podcastId: episodeGuid.split('-')[0] || 'unknown',
                            enclosureUrl: audioUrl,
                        })
                    } catch (cacheError) {
                        console.error("Failed to cache transcript:", cacheError)
                    }
                }

                // 4. Save to File (legacy)
                if (title && fullTranscript) {
                    try {
                        const transcriptsDir = path.join(process.cwd(), "transcripts")
                        await fs.mkdir(transcriptsDir, { recursive: true })
                        const filename = `${sanitizeFilename(title)}.txt`
                        await fs.writeFile(path.join(transcriptsDir, filename), fullTranscript, "utf-8")
                    } catch (e) {
                        // ignore
                    }
                }

                sendEvent({ status: "Completed", text: fullTranscript })

            } catch (error: any) {
                console.error("Transcription error:", error)
                sendEvent({ status: "Error", text: `Error: ${error.message}` })
            } finally {
                try { controller.close() } catch (e) { }
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
