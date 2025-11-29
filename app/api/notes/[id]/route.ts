import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase()

// PATCH: Update a note
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const { data, error } = await supabase
            .from('smart_notes')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('PATCH /api/notes/[id] error:', error)
        return NextResponse.json(
            { error: 'Failed to update note' },
            { status: 500 }
        )
    }
}

// DELETE: Delete a note
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const { error } = await supabase
            .from('smart_notes')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE /api/notes/[id] error:', error)
        return NextResponse.json(
            { error: 'Failed to delete note' },
            { status: 500 }
        )
    }
}
