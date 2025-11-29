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
