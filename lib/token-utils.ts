import { logger } from "./logger"

/**
 * Estimate token count for text (rough approximation: 1 token ≈ 4 characters)
 * This is a simple heuristic. For accurate counting, consider using a tokenizer library.
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
}

/**
 * Track token usage for an operation
 */
export function trackTokenUsage(
    operation: string,
    inputTokens: number,
    outputTokens: number,
    model: string
) {
    const total = inputTokens + outputTokens
    logger.info(`Token Usage [${operation}]`, {
        model,
        input: inputTokens,
        output: outputTokens,
        total,
    })
}

/**
 * Estimate cost based on token usage
 * Note: Update these rates based on your AI provider's pricing
 */
export function estimateCost(
    inputTokens: number,
    outputTokens: number,
    model: string
): number {
    // Placeholder rates (USD per 1M tokens)
    // Update with actual SiliconFlow pricing
    const rates = {
        'deepseek-ai/DeepSeek-V3.2-Exp': { input: 2.0, output: 8.0 },
        'deepseek-ai/DeepSeek-Chat': { input: 0.1, output: 0.2 },
    }

    const modelRates = rates[model as keyof typeof rates] || { input: 1.0, output: 2.0 }

    const inputCost = (inputTokens / 1_000_000) * modelRates.input
    const outputCost = (outputTokens / 1_000_000) * modelRates.output

    return inputCost + outputCost
}
