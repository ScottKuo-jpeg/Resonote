import { NextResponse } from "next/server"
import { getCachedSummary, saveCachedSummary } from "@/lib/cache"

export async function POST(request: Request) {
    const { transcript, episodeGuid } = await request.json()

    if (!transcript) {
        return NextResponse.json({ error: "Transcript required" }, { status: 400 })
    }

    // Check cache first
    if (episodeGuid) {
        const cachedSummary = await getCachedSummary(episodeGuid)
        if (cachedSummary) {
            return NextResponse.json({ summary: cachedSummary, cached: true })
        }
    }

    try {
        const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.SILICONFLOW_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-ai/DeepSeek-V3.2-Exp",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert at analyzing podcast content. Generate concise, structured summaries."
                    },
                    {
                        role: "user",
                        content: `Please analyze this podcast transcript and provide:\n1. A brief overview (2-3 sentences)\n2. Key topics discussed (bullet points)\n3. Main takeaways (3-5 points)\n\nTranscript:\n${transcript}`
                    }
                ],
                max_tokens: 1500,
            }),
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        const summary = data.choices?.[0]?.message?.content || "Failed to generate summary"

        // Save to cache
        if (episodeGuid) {
            try {
                await saveCachedSummary(episodeGuid, summary)
            } catch (cacheError) {
                console.error("Failed to cache summary:", cacheError)
            }
        }

        return NextResponse.json({ summary })
    } catch (error: any) {
        console.error("Summary generation error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
