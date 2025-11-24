import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const term = searchParams.get("term")

    if (!term) {
        return NextResponse.json({ results: [] })
    }

    try {
        const response = await fetch(
            `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(term)}&limit=12`
        )
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ results: [] }, { status: 500 })
    }
}
