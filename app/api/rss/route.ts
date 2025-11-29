import { NextResponse } from "next/server"
import Parser from "rss-parser"

// Create a simple parser instance
const parser = new Parser({
    timeout: 15000
})

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
        return NextResponse.json({ error: "URL required" }, { status: 400 })
    }

    try {
        console.log("[RSS] Fetching feed from:", url)

        // Fetch manually with browser headers to avoid 403 and encoding issues
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        })

        console.log("[RSS] Response status:", response.status, response.statusText)
        console.log("[RSS] Content-Type:", response.headers.get('content-type'))

        if (!response.ok) {
            const text = await response.text()
            console.error("[RSS] Non-OK response body:", text.substring(0, 200))
            throw new Error(`Status code ${response.status}`)
        }

        // Get the text response and parse it
        const xmlText = await response.text()
        console.log("[RSS] Received XML length:", xmlText.length, "bytes")

        // Parse the XML string
        const feed = await parser.parseString(xmlText)

        console.log("[RSS] Feed parsed successfully:", {
            title: feed.title,
            itemsCount: feed.items?.length || 0
        })

        // Map the feed structure to match our expected RSSResponse format
        const responseData = {
            items: feed.items?.map((item: any) => ({
                title: item.title || "",
                guid: item.guid || item.link || "",
                pubDate: item.pubDate || "",
                link: item.link || "",
                content: item.content || item.contentSnippet || "",
                enclosure: item.enclosure ? {
                    url: item.enclosure.url,
                    type: item.enclosure.type,
                    length: item.enclosure.length
                } : undefined
            })) || [],
            feed: {
                title: feed.title || "",
                description: feed.description || "",
                link: feed.link || "",
                image: feed.image?.url || feed.itunes?.image || ""
            }
        }

        return NextResponse.json(responseData)
    } catch (error: any) {
        console.error("[RSS] Parse error:", {
            message: error?.message,
            stack: error?.stack,
            url: url
        })
        return NextResponse.json({
            error: "Failed to parse RSS",
            details: error?.message || "Unknown error"
        }, { status: 500 })
    }
}
