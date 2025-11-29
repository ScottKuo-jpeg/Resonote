import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy for iTunes API to avoid CORS issues
export async function GET() {
    try {
        const response = await fetch(
            'https://itunes.apple.com/us/rss/toppodcasts/limit=12/json',
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            }
        )

        if (!response.ok) {
            throw new Error('Failed to fetch from iTunes')
        }

        const data = await response.json()

        if (!data.feed?.entry) {
            return NextResponse.json({ results: [] })
        }

        // Fetch details for each podcast
        const podcasts = await Promise.all(
            data.feed.entry.map(async (entry: any) => {
                try {
                    const podcastId = entry.id.attributes['im:id']
                    const detailResponse = await fetch(
                        `https://itunes.apple.com/lookup?id=${podcastId}&entity=podcast`
                    )
                    const detailData = await detailResponse.json()

                    if (detailData.results?.[0]) {
                        const podcast = detailData.results[0]
                        return {
                            collectionId: podcast.collectionId,
                            collectionName: podcast.collectionName,
                            artistName: podcast.artistName,
                            artworkUrl600: podcast.artworkUrl600,
                            feedUrl: podcast.feedUrl,
                            genres: podcast.genres || [],
                            primaryGenreName: podcast.primaryGenreName
                        }
                    }
                    return null
                } catch (error) {
                    console.error('Error fetching podcast details:', error)
                    return null
                }
            })
        )

        return NextResponse.json({
            results: podcasts.filter(Boolean)
        })
    } catch (error) {
        console.error('iTunes API error:', error)
        return NextResponse.json({ results: [] })
    }
}
