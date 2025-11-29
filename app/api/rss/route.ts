import { NextResponse } from "next/server"
import { PodcastService } from "@/services/podcast.service"
import { handleAPIError } from "@/lib/errors"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
        return NextResponse.json({ error: "URL required" }, { status: 400 })
    }

    try {
        const data = await PodcastService.getEpisodes(url)
        return NextResponse.json(data)
    } catch (error: any) {
        return handleAPIError(error)
    }
}
