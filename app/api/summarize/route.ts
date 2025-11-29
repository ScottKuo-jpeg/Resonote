import { NextResponse } from "next/server"
import { getCachedSummary, saveCachedSummary } from "@/lib/cache"
import { AIService } from "@/services/ai.service"
import { logger } from "@/lib/logger"
import { handleAPIError } from "@/lib/errors"

export async function POST(request: Request) {
    try {
        const { transcript, episodeGuid } = await request.json()

        if (!transcript) {
            return NextResponse.json({ error: "Transcript required" }, { status: 400 })
        }

        // Check cache first
        if (episodeGuid) {
            const cachedSummary = await getCachedSummary(episodeGuid)
            if (cachedSummary) {
                logger.info(`Cache hit for summary: ${episodeGuid}`)
                return NextResponse.json({ summary: cachedSummary, cached: true })
            }
        }

        logger.info(`Generating summary for episode: ${episodeGuid || 'unknown'}`)

        const summary = await AIService.generateSummary(transcript)

        // Save to cache
        if (episodeGuid) {
            try {
                await saveCachedSummary(episodeGuid, summary)
            } catch (cacheError) {
                logger.error("Failed to cache summary:", cacheError)
            }
        }

        return NextResponse.json({ summary })
    } catch (error: any) {
        return handleAPIError(error)
    }
}
