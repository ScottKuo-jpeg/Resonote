import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const { transcript } = await request.json()

    if (!transcript) {
        return NextResponse.json({ error: "Transcript required" }, { status: 400 })
    }

    try {
        const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.SILICONFLOW_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "Qwen/Qwen2.5-72B-Instruct",
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

        return NextResponse.json({ summary })
    } catch (error: any) {
        console.error("Summary generation error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
