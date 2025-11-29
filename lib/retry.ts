interface RetryOptions {
    maxRetries?: number
    delay?: number
    backoff?: number
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, delay = 1000, backoff = 2 } = options
    let currentDelay = delay

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            if (i === maxRetries - 1) throw error

            console.warn(`Retry ${i + 1}/${maxRetries} failed. Retrying in ${currentDelay}ms...`)
            await new Promise(resolve => setTimeout(resolve, currentDelay))
            currentDelay *= backoff
        }
    }

    throw new Error("Unreachable")
}
