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

    static async generateSummary(transcript: string): Promise<string> {
        logger.info(`Generating summary for transcript (${estimateTokens(transcript)} tokens)`)

        // Truncate if exceeds max length
        const maxLen = CONFIG.AI.LIMITS.MAX_TRANSCRIPT_LENGTH
        const safeTranscript = transcript.length > maxLen
            ? transcript.substring(0, maxLen) + "\n\n[内容过长已截断...]"
            : transcript

        return await this.callLLM([
            {
                role: "system",
                content: "You are an expert podcast summarizer. Provide a structured summary with: 1. Overview, 2. Key Topics, 3. Key Takeaways."
            },
            {
                role: "user",
                content: `Summarize this transcript:\n\n${safeTranscript}`
            }
        ], CONFIG.AI.MODELS.CHAT)
    }

    static async generateMindmap(transcript: string, systemPrompt: string, userPrompt: (t: string) => string): Promise<string> {
        // We can reuse the split logic if mindmap needs it, but usually mindmap is generated from the whole text or a summary.
        // Assuming transcript fits or we use the summary logic. 
        // For now, let's assume direct call but we might want to use summary for mindmap if transcript is too long.

        // Truncate if too long for single call
        const maxLen = CONFIG.AI.LIMITS.MAX_TRANSCRIPT_LENGTH
        const safeTranscript = transcript.length > maxLen ? transcript.substring(0, maxLen) + "..." : transcript

        return await this.callLLM([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt(safeTranscript) }
        ])
    }

}
