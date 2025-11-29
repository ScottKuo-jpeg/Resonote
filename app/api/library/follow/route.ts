import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase()

// GET: Fetch user's follows
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')

        if (!userId) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('user_follows')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error) {
        console.error('GET /api/library/follow error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch follows' },
            { status: 500 }
        )
    }
}

// POST: Follow a podcast
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_id, podcast_id, podcast } = body

        if (!user_id || !podcast_id) {
            return NextResponse.json(
                { error: 'user_id and podcast_id are required' },
                { status: 400 }
            )
        }

        // First, ensure podcast exists in podcasts table
        if (podcast) {
            const { error: podcastError } = await supabase
                .from('podcasts')
                .upsert({
                    id: podcast_id,
                    collection_id: podcast.collectionId,
                    collection_name: podcast.collectionName,
                    artist_name: podcast.artistName,
                    artwork_url: podcast.artworkUrl600,
                    feed_url: podcast.feedUrl,
                    primary_genre: podcast.primaryGenreName
                }, { onConflict: 'id' })

            if (podcastError) console.error('Podcast upsert error:', podcastError)
        }

        // Create follow relationship
        const { data, error } = await supabase
            .from('user_follows')
            .insert({
                user_id,
                podcast_id
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return NextResponse.json(
                    { error: 'Already following this podcast' },
                    { status: 409 }
                )
            }
            throw error
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('POST /api/library/follow error:', error)
        return NextResponse.json(
            { error: 'Failed to follow podcast' },
            { status: 500 }
        )
    }
}

// DELETE: Unfollow a podcast
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_id, podcast_id } = body

        if (!user_id || !podcast_id) {
            return NextResponse.json(
                { error: 'user_id and podcast_id are required' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('user_follows')
            .delete()
            .eq('user_id', user_id)
            .eq('podcast_id', podcast_id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE /api/library/follow error:', error)
        return NextResponse.json(
            { error: 'Failed to unfollow podcast' },
            { status: 500 }
        )
    }
}
