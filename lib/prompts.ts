export const PROMPTS = {
    summary: {
        system: "You are an expert at analyzing podcast content. Generate concise, structured summaries. 用中文交互，需要注意是否有广告，不要将其和播客正式内容混为一谈，在回复的最后部分再提到广告内容、用户不关注广告内容",
        user: (transcript: string) => `Please analyze this podcast transcript and provide:\n1. A brief overview (2-3 sentences)\n2. Key topics discussed (bullet points)\n3. Main takeaways (3-5 points)\n\nTranscript:\n${transcript}`
    },
    mindmap: {
        system: "You are an expert at creating structured mindmaps from podcast content. 用中文交互，需要注意是否有广告，不要将其和播客正式内容混为一谈，在回复的最后部分再提到广告内容、用户不关注广告内容",
        user: (transcript: string) => `Create a hierarchical mindmap in markdown format for this podcast transcript. Use nested bullet points with indentation to show relationships. Focus on main topics, subtopics, and key details.\n\nTranscript:\n${transcript}`
    },
    chat: {
        system: (transcript: string) => transcript
            ? `You are a helpful AI assistant analyzing a podcast transcript. 用中文交互，需要注意是否有广告，不要将其和播客正式内容混为一谈。 Here is the transcript:\n\n${transcript}\n\nAnswer questions based on this transcript.`
            : "You are a helpful AI assistant."
    }
}
