import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.SUPABASE_URL
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_ANON_KEY in .env.local')
        }

        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    }

    return supabaseInstance
}

// For compatibility with existing code
export const supabase = new Proxy({} as SupabaseClient, {
    get(target, prop) {
        return getSupabase()[prop as keyof SupabaseClient]
    }
})

// Database Types
export interface Episode {
    guid: string
    podcast_id: string
    title: string
    enclosure_url?: string
    pub_date?: string
    content_snippet?: string
    created_at?: string
}

export interface Transcript {
    episode_guid: string
    text: string
    created_at?: string
    updated_at?: string
}

export interface AIAnalysis {
    id?: string
    episode_guid: string
    analysis_type: 'summary' | 'mindmap'
    content: string
    model_used?: string
    created_at?: string
}

export interface ChatMessage {
    id?: string
    episode_guid: string
    role: 'user' | 'assistant' | 'system'
    content: string
    created_at?: string
}
