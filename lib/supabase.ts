import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CONFIG } from './config'

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

export type { Episode, Transcript, AIAnalysis, ChatMessage } from '@/types'
