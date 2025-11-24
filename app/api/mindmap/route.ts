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
                        content: "You are an expert at creating structured mindmaps from podcast content."
                    },
                    {
                        role: "user",
                        content: `Create a hierarchical mindmap in markdown format for this podcast transcript. Use nested bullet points with indentation to show relationships. Focus on main topics, subtopics, and key details.\n\nTranscript:\n${transcript}`
                    }
                ],
                max_tokens: 1500,
            }),
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        const mindmap = data.choices?.[0]?.message?.content || "Failed to generate mindmap"

        return NextResponse.json({ mindmap })
    } catch (error: any) {
        console.error("Mindmap generation error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
