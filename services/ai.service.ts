import { CONFIG } from "@/lib/config"
import { logger } from "@/lib/logger"
import { withRetry } from "@/lib/retry"
import { ChatMessage } from "@/types"

export class AIService {
    private static async callLLM(messages: any[], model: string = CONFIG.AI.MODELS.CHAT, maxTokens: number = CONFIG.AI.LIMITS.MAX_TOKENS) {
        return withRetry(async () => {
            logger.info(`Calling LLM with model: ${model}`)
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
            return data.choices?.[0]?.message?.content || ""
        })
    }

    static async chat(messages: ChatMessage[], transcript: string) {
        // This is for non-streaming chat if needed, but the route uses streaming.
        // For streaming, we might need a different approach or keep it in the route for now.
        // But for consistency, let's define the interface.
        throw new Error("Use streaming API for chat")
    }

    static async generateSummary(transcript: string): Promise<string> {
        const chunks = this.splitText(transcript, CONFIG.AI.LIMITS.CHUNK_SIZE)

        if (chunks.length === 1) {
            return await this.callLLM([
                { role: "system", content: "You are an expert podcast summarizer. Provide a structured summary with: 1. Overview, 2. Key Topics, 3. Key Takeaways." },
                { role: "user", content: `Summarize this transcript:\n\n${chunks[0]}` }
            ])
        }

        // Map: Summarize each chunk
        const chunkSummaries = await Promise.all(chunks.map(async (chunk, i) => {
            return await this.callLLM([
                { role: "system", content: "Summarize this section of the podcast concisely." },
                { role: "user", content: `Part ${i + 1}:\n\n${chunk}` }
            ])
        }))

        // Reduce: Summarize the summaries
        const combinedSummary = chunkSummaries.join("\n\n---\n\n")
        return await this.callLLM([
            { role: "system", content: "You are an expert podcast summarizer. Create a final cohesive summary from these section summaries." },
            { role: "user", content: `Section Summaries:\n\n${combinedSummary}\n\nProvide a structured final summary with: 1. Overview, 2. Key Topics, 3. Key Takeaways.` }
        ])
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

    private static splitText(text: string, maxChunkSize: number): string[] {
        const chunks: string[] = []
        let currentChunk = ""
        const paragraphs = text.split(/\n\n+/)

        for (const paragraph of paragraphs) {
            if ((currentChunk.length + paragraph.length) > maxChunkSize) {
                if (currentChunk) chunks.push(currentChunk)
                currentChunk = paragraph
            } else {
                currentChunk += (currentChunk ? "\n\n" : "") + paragraph
            }
        }

        if (currentChunk) chunks.push(currentChunk)
        return chunks
    }
}
