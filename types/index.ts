export interface Episode {
    guid: string
    podcast_id: string
    title: string
    enclosure_url?: string
    pub_date?: string
    content_snippet?: string
    created_at?: string
    link?: string
    content?: string
    enclosure?: {
        url: string
        type: string
        length: number
    }
}

export interface Podcast {
    collectionId: number
    collectionName: string
    artistName: string
    artworkUrl600: string
    feedUrl: string
    genres: string[]
    primaryGenreName?: string
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

export interface SearchResponse {
    resultCount: number
    results: Podcast[]
}

export interface RSSResponse {
    items: Episode[]
    feed: {
        title: string
        description: string
        link: string
        image: string
    }
}

export interface TranscribeResponse {
    status?: string
    text?: string
    savedPath?: string
    error?: string
}

// Library Types
export interface UserFollow {
    id: string
    user_id: string
    podcast_id: string
    created_at: string
}

export interface UserLike {
    id: string
    user_id: string
    episode_guid: string
    created_at: string
}

export interface UserHistory {
    id: string
    user_id: string
    episode_guid: string
    progress: number
    last_position: number
    created_at: string
    updated_at: string
}

export type LibraryTab = 'follow' | 'like' | 'history'

export interface LibraryEpisode extends Episode {
    podcast?: Podcast
    liked?: boolean
    followed?: boolean
    historyEntry?: UserHistory
}

// Smart Notes Types
export type NoteType = 'SUMMARY' | 'MINDMAP' | 'CHAT'

export interface SmartNote {
    id: string
    user_id: string
    episode_guid: string
    note_type: NoteType
    title: string
    key_takeaway?: string
    content: string
    cover_url?: string
    tags: string[]
    created_at: string
    updated_at: string
    // Populated fields
    episode?: Episode
    podcast?: Podcast
    episodeTitle?: string
    podcastName?: string
    author?: string
    date?: string
}

export interface CreateNotePayload {
    episode_guid: string
    note_type: NoteType
    title: string
    key_takeaway?: string
    content: string
    cover_url?: string
    tags?: string[]
}
