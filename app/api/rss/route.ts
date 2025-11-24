import { NextResponse } from "next/server"
import Parser from "rss-parser"

const parser = new Parser()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
        return NextResponse.json({ error: "URL required" }, { status: 400 })
    }

    try {
        const feed = await parser.parseURL(url)
        return NextResponse.json(feed)
    } catch (error) {
        console.error("RSS parse error:", error)
        return NextResponse.json({ error: "Failed to parse RSS" }, { status: 500 })
    }
}
