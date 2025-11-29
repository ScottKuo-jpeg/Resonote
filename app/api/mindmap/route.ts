import { NextResponse } from "next/server"
import { getCachedMindmap, saveCachedMindmap } from "@/lib/cache"
import { AIService } from "@/services/ai.service"
import { logger } from "@/lib/logger"
import { handleAPIError } from "@/lib/errors"

export async function POST(request: Request) {
    try {
        const { transcript, episodeGuid, context } = await request.json()

        if (!transcript) {
            return NextResponse.json({ error: "Transcript required" }, { status: 400 })
        }

        // Check cache first
        if (episodeGuid) {
            const cachedMindmap = await getCachedMindmap(episodeGuid)
            if (cachedMindmap) {
                logger.info(`Cache hit for mindmap: ${episodeGuid}`)
                return NextResponse.json({ mindmap: cachedMindmap, cached: true })
            }
        }

        logger.info(`Generating mindmap for episode: ${episodeGuid || 'unknown'}`)

        const mindmap = await AIService.generateMindmap(transcript, context)

        // Save to cache
        if (episodeGuid) {
            try {
                await saveCachedMindmap(episodeGuid, mindmap)
            } catch (cacheError) {
                logger.error("Failed to cache mindmap:", cacheError)
            }
        }

        return NextResponse.json({ mindmap })
    } catch (error: any) {
        return handleAPIError(error)
    }
}
