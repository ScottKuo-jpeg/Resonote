import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase()

// GET: Fetch user's history
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')

        if (!userId) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('user_history')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data || [])
    } catch (error) {
        console.error('GET /api/library/history error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch history' },
            { status: 500 }
        )
    }
}

// POST: Add or update history entry
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_id, episode_guid, progress, last_position } = body

        if (!user_id || !episode_guid) {
            return NextResponse.json(
                { error: 'user_id and episode_guid are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('user_history')
            .upsert({
                user_id,
                episode_guid,
                progress: progress || 0,
                last_position: last_position || 0,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,episode_guid'
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('POST /api/library/history error:', error)
        return NextResponse.json(
            { error: 'Failed to update history' },
            { status: 500 }
        )
    }
}
