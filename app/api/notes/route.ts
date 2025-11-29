import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase()

// GET: Fetch all notes for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')

        if (!userId) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('smart_notes')
            .select(`
                *,
                episodes (
                    title,
                    podcast_id,
                    pub_date
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Enrich notes with episode and podcast data
        const enrichedNotes = await Promise.all((data || []).map(async (note) => {
            if (note.episodes) {
                // Fetch podcast data
                const { data: podcastData } = await supabase
                    .from('podcasts')
                    .select('*')
                    .eq('id', note.episodes.podcast_id)
                    .single()

                return {
                    ...note,
                    episodeTitle: note.episodes.title,
                    podcastName: podcastData?.collection_name,
                    author: podcastData?.artist_name,
                    date: note.created_at,
                    coverUrl: note.cover_url || podcastData?.artwork_url
                }
            }
            return note
        }))

        return NextResponse.json(enrichedNotes)
    } catch (error) {
        console.error('GET /api/notes error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch notes' },
            { status: 500 }
        )
    }
}

// POST: Create a new note
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            user_id,
            episode_guid,
            note_type,
            title,
            key_takeaway,
            content,
            cover_url,
            tags
        } = body

        if (!user_id || !episode_guid || !note_type || !title || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: user_id, episode_guid, note_type, title, content' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('smart_notes')
            .insert({
                user_id,
                episode_guid,
                note_type,
                title,
                key_takeaway,
                content,
                cover_url,
                tags: tags || []
            })
            .select(`
                *,
                episodes (
                    title,
                    podcast_id,
                    pub_date
                )
            `)
            .single()

        if (error) throw error

        // Enrich the note
        if (data && data.episodes) {
            const { data: podcastData } = await supabase
                .from('podcasts')
                .select('*')
                .eq('id', data.episodes.podcast_id)
                .single()

            const enrichedNote = {
                ...data,
                episodeTitle: data.episodes.title,
                podcastName: podcastData?.collection_name,
                author: podcastData?.artist_name,
                date: data.created_at,
                coverUrl: data.cover_url || podcastData?.artwork_url
            }

            return NextResponse.json(enrichedNote)
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('POST /api/notes error:', error)
        return NextResponse.json(
            { error: 'Failed to create note' },
            { status: 500 }
        )
    }
}
