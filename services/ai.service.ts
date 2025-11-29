import { CONFIG } from "@/lib/config"
import { logger } from "@/lib/logger"
import { withRetry } from "@/lib/retry"
import { estimateTokens, trackTokenUsage } from "@/lib/token-utils"
import { ChatMessage } from "@/types"

export class AIService {
    private static async callLLM(messages: any[], model: string = CONFIG.AI.MODELS.CHAT, maxTokens: number = CONFIG.AI.LIMITS.MAX_TOKENS) {
        return withRetry(async () => {
            // Estimate input tokens
            const inputText = messages.map(m => m.content).join('\n')
            const inputTokens = estimateTokens(inputText)

            logger.info(`Calling LLM with model: ${model}`, { estimatedInputTokens: inputTokens })

            const response = await fetch(`${CONFIG.AI.BASE_URL}/chat/completions`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${CONFIG.AI.API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: maxTokens,
                }),
            })

            if (!response.ok) {
                throw new Error(`AI API Error: ${response.status}`)
            }

            const data = await response.json()
            const content = data.choices?.[0]?.message?.content || ""

            // Track token usage
            const outputTokens = estimateTokens(content)
            trackTokenUsage('LLM Call', inputTokens, outputTokens, model)

            return content
        })
    }

    static async chat(messages: ChatMessage[], transcript: string) {
        // This is for non-streaming chat if needed, but the route uses streaming.
        // For streaming, we might need a different approach or keep it in the route for now.
        // But for consistency, let's define the interface.
        throw new Error("Use streaming API for chat")
    }

    static async generateSummary(
        transcript: string,
        context?: {
            podcastName?: string
            podcastDescription?: string
            episodeName?: string
            episodeDescription?: string
        }
    ): Promise<string> {
        logger.info(`Generating summary for transcript (${estimateTokens(transcript)} tokens)`)

        // Truncate if exceeds max length
        const maxLen = CONFIG.AI.LIMITS.MAX_TRANSCRIPT_LENGTH
        const safeTranscript = transcript.length > maxLen
            ? transcript.substring(0, maxLen) + "\n\n[内容过长已截断...]"
            : transcript

        // Try to get settings from localStorage (client-side) or use defaults
        let systemPrompt = "You are an expert podcast summarizer. Provide a structured summary with: 1. Overview, 2. Key Topics, 3. Key Takeaways."
        let userPrompt = `Summarize this transcript:\n\n${safeTranscript}`

        // If running in browser context, try to get custom prompts
        if (typeof window !== 'undefined') {
            try {
                const settings = localStorage.getItem('ai-settings-storage')
                if (settings) {
                    const parsed = JSON.parse(settings)
                    const summaryPrompt = parsed.state?.settings?.summaryPrompt
                    if (summaryPrompt) {
                        systemPrompt = summaryPrompt.systemPrompt
                        // Replace variables in user prompt
                        userPrompt = summaryPrompt.userPrompt
                            .replace(/{transcript}/g, safeTranscript)
                            .replace(/{podcastName}/g, context?.podcastName || '')
                            .replace(/{podcastDescription}/g, context?.podcastDescription || '')
                            .replace(/{episodeName}/g, context?.episodeName || '')
                            .replace(/{episodeDescription}/g, context?.episodeDescription || '')
                    }
                }
            } catch (e) {
                logger.warn('Failed to load custom prompts, using defaults')
            }
        }

        return await this.callLLM([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], CONFIG.AI.MODELS.CHAT)
    }

    static async generateMindmap(
        transcript: string,
        context?: {
            podcastName?: string
            podcastDescription?: string
            episodeName?: string
            episodeDescription?: string
        }
    ): Promise<string> {
        // Truncate if too long for single call
        const maxLen = CONFIG.AI.LIMITS.MAX_TRANSCRIPT_LENGTH
        const safeTranscript = transcript.length > maxLen ? transcript.substring(0, maxLen) + "..." : transcript

        // Try to get settings from localStorage (client-side) or use defaults
        let systemPrompt = "You are an expert at creating mind maps. Generate a hierarchical mind map structure in Markdown format using nested bullet points."
        let userPrompt = `Create a mind map for this transcript:\n\n${safeTranscript}`

        // If running in browser context, try to get custom prompts
        if (typeof window !== 'undefined') {
            try {
                const settings = localStorage.getItem('ai-settings-storage')
                if (settings) {
                    const parsed = JSON.parse(settings)
                    const mindmapPrompt = parsed.state?.settings?.mindmapPrompt
                    if (mindmapPrompt) {
                        systemPrompt = mindmapPrompt.systemPrompt
                        // Replace variables in user prompt
                        userPrompt = mindmapPrompt.userPrompt
                            .replace(/{transcript}/g, safeTranscript)
                            .replace(/{podcastName}/g, context?.podcastName || '')
                            .replace(/{podcastDescription}/g, context?.podcastDescription || '')
                            .replace(/{episodeName}/g, context?.episodeName || '')
                            .replace(/{episodeDescription}/g, context?.episodeDescription || '')
                    }
                }
            } catch (e) {
                logger.warn('Failed to load custom mindmap prompts, using defaults')
            }
        }

        return await this.callLLM([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ])
    }

}
