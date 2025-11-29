import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { LibraryTab } from '@/types'

const supabase = getSupabase()

// GET: Fetch library episodes based on tab (follow/like/history)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')
        const tab = searchParams.get('tab') as LibraryTab
        const page = parseInt(searchParams.get('page') || '0')
        const limit = parseInt(searchParams.get('limit') || '10')

        if (!userId || !tab) {
            return NextResponse.json(
                { error: 'user_id and tab are required' },
                { status: 400 }
            )
        }

        const offset = page * limit
        let episodes: any[] = []

        if (tab === 'follow') {
            // Get episodes from followed podcasts
            const { data: follows } = await supabase
                .from('user_follows')
                .select('podcast_id')
                .eq('user_id', userId)

            if (!follows || follows.length === 0) {
                return NextResponse.json({ episodes: [], hasMore: false })
            }

            const podcastIds = follows.map((f: { podcast_id: string }) => f.podcast_id)

            // Get recent episodes from these podcasts
            const { data, error } = await supabase
                .from('episodes')
                .select(`
                    *,
                    podcasts!inner(*)
                `)
                .in('podcast_id', podcastIds)
                .order('pub_date', { ascending: false })
                .range(offset, offset + limit)

            if (error) throw error
            episodes = data || []

        } else if (tab === 'like') {
            // Get liked episodes
            const { data: likes } = await supabase
                .from('user_likes')
                .select('episode_guid')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit)

            if (!likes || likes.length === 0) {
                return NextResponse.json({ episodes: [], hasMore: false })
            }

            const episodeGuids = likes.map((l: { episode_guid: string }) => l.episode_guid)

            // Get episode details
            const { data, error } = await supabase
                .from('episodes')
                .select(`
                    *,
                    podcasts(*)
                `)
                .in('guid', episodeGuids)

            if (error) throw error
            episodes = data || []

        } else if (tab === 'history') {
            // Get history episodes
            const { data: history } = await supabase
                .from('user_history')
                .select('episode_guid, progress, last_position, updated_at')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit)

            if (!history || history.length === 0) {
                return NextResponse.json({ episodes: [], hasMore: false })
            }

            const episodeGuids = history.map((h: { episode_guid: string }) => h.episode_guid)

            // Get episode details
            const { data, error } = await supabase
                .from('episodes')
                .select(`
                    *,
                    podcasts(*)
                `)
                .in('guid', episodeGuids)

            if (error) throw error

            // Merge with history info
            episodes = (data || []).map((ep: any) => {
                const historyEntry = history.find((h: { episode_guid: string }) => h.episode_guid === ep.guid)
                return {
                    ...ep,
                    historyEntry
                }
            })
        }

        // Check if there are more episodes
        const hasMore = episodes.length === limit + 1
        if (hasMore) episodes = episodes.slice(0, limit)

        return NextResponse.json({ episodes, hasMore })

    } catch (error) {
        console.error('GET /api/library/episodes error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch library episodes' },
            { status: 500 }
        )
    }
}
