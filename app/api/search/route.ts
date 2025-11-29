import { NextResponse } from "next/server"
import { PodcastService } from "@/services/podcast.service"
import { handleAPIError } from "@/lib/errors"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const term = searchParams.get("term")

    if (!term) {
        return NextResponse.json({ results: [] })
    }

    try {
        const results = await PodcastService.search(term)
        return NextResponse.json({ results })
    } catch (error: any) {
        return handleAPIError(error)
    }
}
