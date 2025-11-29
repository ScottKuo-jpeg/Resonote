import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PromptTemplate {
    id: string
    name: string
    description: string
    systemPrompt: string
    userPrompt: string
    variables: string[] // Available variables: {transcript}, {podcastName}, {podcastDescription}, {episodeName}, {episodeDescription}
}

export interface AISettings {
    summaryPrompt: PromptTemplate
    mindmapPrompt: PromptTemplate
    chatSystemPrompt: string
}

interface SettingsState {
    settings: AISettings
    updateSummaryPrompt: (prompt: Partial<PromptTemplate>) => void
    updateMindmapPrompt: (prompt: Partial<PromptTemplate>) => void
    updateChatSystemPrompt: (prompt: string) => void
    resetToDefaults: () => void
}

const DEFAULT_SETTINGS: AISettings = {
    summaryPrompt: {
        id: 'summary',
        name: 'Podcast Summary',
        description: 'Generate a structured summary of the podcast episode',
        systemPrompt: 'You are an expert podcast summarizer. Provide a structured summary with: 1. Overview, 2. Key Topics, 3. Key Takeaways. Always respond in the same language as the transcript.',
        userPrompt: `Please summarize this podcast episode:

Podcast: {podcastName}
Episode: {episodeName}
Description: {episodeDescription}

Transcript:
{transcript}

Please provide a comprehensive summary with:
1. Overview (2-3 sentences)
2. Key Topics (bullet points)
3. Key Takeaways (3-5 main points)`,
        variables: ['transcript', 'podcastName', 'podcastDescription', 'episodeName', 'episodeDescription']
    },
    mindmapPrompt: {
        id: 'mindmap',
        name: 'Mind Map Generator',
        description: 'Generate a mind map structure from the podcast content',
        systemPrompt: 'You are an expert at creating mind maps. Generate a hierarchical mind map structure in Markdown format using nested bullet points. Always respond in the same language as the transcript.',
        userPrompt: `Create a detailed mind map for this podcast episode:

Podcast: {podcastName}
Episode: {episodeName}

Transcript:
{transcript}

Generate a mind map with:
- Main topic as the root
- 3-5 major branches (key themes)
- Sub-branches for each theme (details, examples, quotes)
- Use Markdown nested bullet points (-, *, +)`,
        variables: ['transcript', 'podcastName', 'podcastDescription', 'episodeName', 'episodeDescription']
    },
    chatSystemPrompt: `You are an AI assistant helping users understand and discuss podcast content. 

Context:
- Podcast: {podcastName}
- Episode: {episodeName}
- Description: {episodeDescription}

You have access to the full transcript and should:
1. Answer questions accurately based on the transcript
2. Provide timestamps when relevant
3. Offer insights and connections
4. Always respond in the same language as the user's question

Be helpful, concise, and insightful.`
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: DEFAULT_SETTINGS,

            updateSummaryPrompt: (prompt) =>
                set((state) => ({
                    settings: {
                        ...state.settings,
                        summaryPrompt: {
                            ...state.settings.summaryPrompt,
                            ...prompt
                        }
                    }
                })),

            updateMindmapPrompt: (prompt) =>
                set((state) => ({
                    settings: {
                        ...state.settings,
                        mindmapPrompt: {
                            ...state.settings.mindmapPrompt,
                            ...prompt
                        }
                    }
                })),

            updateChatSystemPrompt: (prompt) =>
                set((state) => ({
                    settings: {
                        ...state.settings,
                        chatSystemPrompt: prompt
                    }
                })),

            resetToDefaults: () =>
                set({ settings: DEFAULT_SETTINGS })
        }),
        {
            name: 'ai-settings-storage',
        }
    )
)

// Helper function to replace variables in prompts
export function replacePromptVariables(
    template: string,
    variables: {
        transcript?: string
        podcastName?: string
        podcastDescription?: string
        episodeName?: string
        episodeDescription?: string
    }
): string {
    let result = template

    Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{${key}}`
        result = result.replaceAll(placeholder, value || '')
    })

    return result
}
