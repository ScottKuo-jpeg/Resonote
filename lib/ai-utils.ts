import { CONFIG } from "./config"
import { logger } from "./logger"

// Split text into chunks that fit within context window
export function splitText(text: string, maxChunkSize: number = CONFIG.AI.LIMITS.CHUNK_SIZE): string[] {
    const chunks: string[] = []
    let currentChunk = ""

    // Split by paragraphs first to avoid breaking sentences
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

// Helper to call LLM
async function callLLM(messages: any[], model: string = CONFIG.AI.MODELS.CHAT) {
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
            max_tokens: CONFIG.AI.LIMITS.MAX_TOKENS,
        }),
    })

    if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ""
}

// Map-Reduce Summarization
export async function generateSegmentedSummary(transcript: string): Promise<string> {
    const chunks = splitText(transcript, CONFIG.AI.LIMITS.CHUNK_SIZE)

    if (chunks.length === 1) {
        return await callLLM([
            { role: "system", content: "You are an expert podcast summarizer. Provide a structured summary with: 1. Overview, 2. Key Topics, 3. Key Takeaways." },
            { role: "user", content: `Summarize this transcript:\n\n${chunks[0]}` }
        ])
    }

    // Map: Summarize each chunk
    const chunkSummaries = await Promise.all(chunks.map(async (chunk, i) => {
        return await callLLM([
            { role: "system", content: "Summarize this section of the podcast concisely." },
            { role: "user", content: `Part ${i + 1}:\n\n${chunk}` }
        ])
    }))

    // Reduce: Summarize the summaries
    const combinedSummary = chunkSummaries.join("\n\n---\n\n")
    return await callLLM([
        { role: "system", content: "You are an expert podcast summarizer. Create a final cohesive summary from these section summaries." },
        { role: "user", content: `Section Summaries:\n\n${combinedSummary}\n\nProvide a structured final summary with: 1. Overview, 2. Key Topics, 3. Key Takeaways.` }
    ])
}
