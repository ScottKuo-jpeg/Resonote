import Parser from "rss-parser"
import { CONFIG } from "@/lib/config"
import { logger } from "@/lib/logger"
import { Podcast, Episode } from "@/types"

const parser = new Parser({
    timeout: CONFIG.RSS.TIMEOUT
})

export class PodcastService {
    static async search(term: string): Promise<Podcast[]> {
        // This usually calls iTunes API or similar. 
        // The current implementation calls /api/search which calls iTunes.
        // We should move the iTunes calling logic here if we want to run it on server side,
        // or keep it in the route.
        // Let's assume this service runs on the server (called by API route).

        const ITUNES_API = 'https://itunes.apple.com/search'
        const url = `${ITUNES_API}?media=podcast&term=${encodeURIComponent(term)}`

        logger.info(`Searching podcasts: ${term}`)
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`iTunes API Error: ${response.status}`)
        }

        const data = await response.json()
        return data.results || []
    }

    static async getEpisodes(feedUrl: string): Promise<{ items: Episode[], feed: any }> {
        logger.info(`Fetching RSS feed: ${feedUrl}`)

        const response = await fetch(feedUrl, {
            headers: {
                'User-Agent': CONFIG.RSS.USER_AGENT,
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch RSS: ${response.status}`)
        }

        const xmlText = await response.text()
        const feed = await parser.parseString(xmlText)

        const items = feed.items?.map((item: any) => ({
            title: item.title || "",
            guid: item.guid || item.link || "",
            pub_date: item.pubDate || item.isoDate || "",
            link: item.link || "",
            content_snippet: item.contentSnippet || item.content || "",
            content: item.content || "",
            podcast_id: "", // Will be filled by context if needed
            enclosure: item.enclosure ? {
                url: item.enclosure.url,
                type: item.enclosure.type,
                length: item.enclosure.length
            } : undefined,
            enclosure_url: item.enclosure?.url || ""
        })) || []

        logger.info(`Parsed ${items.length} episodes from RSS feed`)
        if (items.length > 0) {
            logger.info('First episode:', {
                title: items[0].title,
                pub_date: items[0].pub_date,
                has_content: !!items[0].content_snippet
            })
        }

        return {
            items,
            feed: {
                title: feed.title || "",
                description: feed.description || "",
                link: feed.link || "",
                image: feed.image?.url || feed.itunes?.image || ""
            }
        }
    }
}
