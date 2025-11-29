export const CONFIG = {
    AI: {
        PROVIDER: 'siliconflow',
        BASE_URL: 'https://api.siliconflow.cn/v1',
        API_KEY: process.env.SILICONFLOW_API_KEY!,
        MODELS: {
            CHAT: 'deepseek-ai/DeepSeek-V3.2-Exp',
            TRANSCRIBE: 'TeleAI/TeleSpeechASR',
        },
        LIMITS: {
            MAX_TOKENS: 30000,
            MAX_TRANSCRIPT_LENGTH: 50000,
        }
    },
    TRANSCRIBE: {
        CHUNK_SIZE_MB: 5,
        CHUNK_SIZE_BYTES: 5 * 1024 * 1024,
    },
    RSS: {
        TIMEOUT: 15000,
        USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
}
