import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase()

// GET: Fetch user's likes
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')

        if (!userId) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('user_likes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error) {
        console.error('GET /api/library/like error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch likes' },
            { status: 500 }
        )
    }
}

// POST: Like an episode
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_id, episode_guid } = body

        if (!user_id || !episode_guid) {
            return NextResponse.json(
                { error: 'user_id and episode_guid are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('user_likes')
            .insert({
                user_id,
                episode_guid
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return NextResponse.json(
                    { error: 'Already liked this episode' },
                    { status: 409 }
                )
            }
            throw error
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('POST /api/library/like error:', error)
        return NextResponse.json(
            { error: 'Failed to like episode' },
            { status: 500 }
        )
    }
}

// DELETE: Unlike an episode
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_id, episode_guid } = body

        if (!user_id || !episode_guid) {
            return NextResponse.json(
                { error: 'user_id and episode_guid are required' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('user_likes')
            .delete()
            .eq('user_id', user_id)
            .eq('episode_guid', episode_guid)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE /api/library/like error:', error)
        return NextResponse.json(
            { error: 'Failed to unlike episode' },
            { status: 500 }
        )
    }
}
