import { supabase, type Episode, type Transcript, type AIAnalysis, type ChatMessage } from "./supabase"

// Transcript
export async function getCachedTranscript(episodeGuid: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('transcripts')
            .select('text')
            .eq('episode_guid', episodeGuid)
            .single()

        if (error) throw error
        return data?.text || null
    } catch {
        return null
    }
}

export async function saveCachedTranscript(
    episodeGuid: string,
    transcript: string,
    episodeData?: { title: string; podcastId: string; enclosureUrl?: string }
): Promise<void> {
    try {
        // Ensure episode exists
        if (episodeData) {
            await supabase
                .from('episodes')
                .upsert({
                    guid: episodeGuid,
                    podcast_id: episodeData.podcastId,
                    title: episodeData.title,
                    enclosure_url: episodeData.enclosureUrl,
                }, { onConflict: 'guid' })
        }

        // Save transcript
        await supabase
            .from('transcripts')
            .upsert({
                episode_guid: episodeGuid,
                text: transcript,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'episode_guid' })
    } catch (error) {
        console.error('Failed to save transcript to Supabase:', error)
        throw error
    }
}

// Summary
export async function getCachedSummary(episodeGuid: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('ai_analyses')
            .select('content')
            .eq('episode_guid', episodeGuid)
            .eq('analysis_type', 'summary')
            .single()

        if (error) throw error
        return data?.content || null
    } catch {
        return null
    }
}

export async function saveCachedSummary(episodeGuid: string, summary: string): Promise<void> {
    try {
        await supabase
            .from('ai_analyses')
            .upsert({
                episode_guid: episodeGuid,
                analysis_type: 'summary',
                content: summary,
                model_used: 'deepseek-ai/DeepSeek-V3.2-Exp',
            }, { onConflict: 'episode_guid,analysis_type' })
    } catch (error) {
        console.error('Failed to save summary to Supabase:', error)
        throw error
    }
}

// Mindmap
export async function getCachedMindmap(episodeGuid: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('ai_analyses')
            .select('content')
            .eq('episode_guid', episodeGuid)
            .eq('analysis_type', 'mindmap')
            .single()

        if (error) throw error
        return data?.content || null
    } catch {
        return null
    }
}

export async function saveCachedMindmap(episodeGuid: string, mindmap: string): Promise<void> {
    try {
        await supabase
            .from('ai_analyses')
            .upsert({
                episode_guid: episodeGuid,
                analysis_type: 'mindmap',
                content: mindmap,
                model_used: 'deepseek-ai/DeepSeek-V3.2-Exp',
            }, { onConflict: 'episode_guid,analysis_type' })
    } catch (error) {
        console.error('Failed to save mindmap to Supabase:', error)
        throw error
    }
}

// Chat
export async function getCachedChat(episodeGuid: string): Promise<Array<{ role: string; content: string }> | null> {
    try {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('role, content')
            .eq('episode_guid', episodeGuid)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data || null
    } catch {
        return null
    }
}

export async function saveCachedChat(episodeGuid: string, messages: Array<{ role: string; content: string }>): Promise<void> {
    try {
        // Delete existing messages for this episode
        await supabase
            .from('chat_messages')
            .delete()
            .eq('episode_guid', episodeGuid)

        // Insert all messages
        const chatMessages = messages.map(msg => ({
            episode_guid: episodeGuid,
            role: msg.role,
            content: msg.content,
        }))

        await supabase
            .from('chat_messages')
            .insert(chatMessages)
    } catch (error) {
        console.error('Failed to save chat to Supabase:', error)
        throw error
    }
}
