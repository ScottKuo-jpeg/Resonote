import { NextResponse } from "next/server"
import { getCachedMindmap, saveCachedMindmap } from "@/lib/cache"
import { PROMPTS } from "@/lib/prompts"

export async function POST(request: Request) {
    const { transcript, episodeGuid } = await request.json()

    if (!transcript) {
        return NextResponse.json({ error: "Transcript required" }, { status: 400 })
    }

    // Check cache first
    if (episodeGuid) {
        const cachedMindmap = await getCachedMindmap(episodeGuid)
        if (cachedMindmap) {
            return NextResponse.json({ mindmap: cachedMindmap, cached: true })
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
                        content: PROMPTS.mindmap.system
                    },
                    {
                        role: "user",
                        content: PROMPTS.mindmap.user(transcript)
                    }
                ],
                max_tokens: 30000,
            }),
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        const mindmap = data.choices?.[0]?.message?.content || "Failed to generate mindmap"

        // Save to cache
        if (episodeGuid) {
            try {
                await saveCachedMindmap(episodeGuid, mindmap)
            } catch (cacheError) {
                console.error("Failed to cache mindmap:", cacheError)
            }
        }

        return NextResponse.json({ mindmap })
    } catch (error: any) {
        console.error("Mindmap generation error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
