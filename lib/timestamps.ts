// Estimate timestamps based on text length
// Assumes average speaking rate of 150 words per minute

export interface TimestampedParagraph {
    text: string
    startTime: number // in seconds
    endTime: number
}

export function generateTimestamps(text: string, totalDuration?: number): TimestampedParagraph[] {
    // Split by double newlines or periods followed by capital letters
    const paragraphs = text
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0)

    if (paragraphs.length === 0) return []

    // Count total words
    const totalWords = text.split(/\s+/).length
    const wordsPerMinute = 150
    const estimatedDuration = totalDuration || (totalWords / wordsPerMinute) * 60

    const result: TimestampedParagraph[] = []
    let currentTime = 0

    paragraphs.forEach(paragraph => {
        const words = paragraph.split(/\s+/).length
        const duration = (words / wordsPerMinute) * 60

        result.push({
            text: paragraph,
            startTime: currentTime,
            endTime: currentTime + duration,
        })

        currentTime += duration
    })

    return result
}

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}
