// Configuration settings for the application
export const config = {
  // Rate limiting settings
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true' || false, // Default to false for testing
    maxMessagesPerDay: 35,
    resetTime: '00:00:00' // Reset at midnight
  },
  
  // Chat settings
  chat: {
    maxContextMessages: 10, // Number of recent messages to include in context
    maxResponseLength: 500 // Maximum response length in characters
  },
  
  // API settings
  api: {
    timeout: 30000, // 30 seconds
    maxRetries: 3
  }
}

// Helper function to check if rate limiting is enabled
export function isRateLimitEnabled(): boolean {
  return config.rateLimit.enabled
}

// Helper function to get rate limit settings
export function getRateLimitConfig() {
  return config.rateLimit
} 