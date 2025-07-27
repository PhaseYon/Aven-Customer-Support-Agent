# Rate Limiting Setup Guide

## Overview

The chat system now includes configurable rate limiting to prevent abuse and manage costs. Users are limited to 35 messages per day, with the limit resetting at midnight.

## Configuration

### Environment Variable

Add this to your `.env` file:

```env
# Rate Limiting (set to 'true' to enable, 'false' to disable)
RATE_LIMIT_ENABLED=false
```

### Default Settings

- **Daily Limit**: 35 messages per user
- **Reset Time**: Midnight (00:00:00)
- **Default State**: Disabled (for testing)

## How It Works

### When Enabled (`RATE_LIMIT_ENABLED=true`)

1. **Message Counting**: Each user message is counted against their daily limit
2. **Limit Check**: Before processing each message, the system checks if the user has exceeded their limit
3. **Error Response**: If limit exceeded, returns HTTP 429 with a friendly message
4. **Visual Indicator**: Shows remaining messages in the chat interface

### When Disabled (`RATE_LIMIT_ENABLED=false`)

- No rate limiting applied
- All messages are processed normally
- Rate limit info is still displayed but shows full remaining count

## Features

### Database Tracking
- Uses existing `chat_messages` table
- Counts only user messages (not bot responses)
- Resets automatically at midnight

### User Interface
- Shows remaining messages in the header
- Displays rate limit error messages
- Updates count after each message

### Error Handling
- Graceful error messages for rate limit exceeded
- Fallback to allow messages if database errors occur
- Proper HTTP status codes (429 for rate limit)

## Testing

### Enable Rate Limiting
```bash
# In your .env file
RATE_LIMIT_ENABLED=true
```

### Disable Rate Limiting (for development)
```bash
# In your .env file
RATE_LIMIT_ENABLED=false
```

### Monitor Usage
- Check the rate limit indicator in the chat header
- View console logs for rate limit checks
- Monitor database for message counts

## Customization

You can modify the rate limit settings in `lib/config.ts`:

```typescript
rateLimit: {
  enabled: process.env.RATE_LIMIT_ENABLED === 'true' || false,
  maxMessagesPerDay: 35,  // Change this value
  resetTime: '00:00:00'   // Change reset time
}
```

## Production Deployment

1. Set `RATE_LIMIT_ENABLED=true` in production environment
2. Monitor usage patterns and adjust limits as needed
3. Consider implementing different limits for different user tiers
4. Set up alerts for unusual usage patterns 