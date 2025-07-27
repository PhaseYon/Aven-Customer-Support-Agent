# Vapi Voice AI Integration Setup

## Overview

This guide will help you set up Vapi voice AI integration for your Aven customer support chatbot. Vapi provides real-time voice communication between users and your AI assistant, with full RAG (Retrieval-Augmented Generation) integration.

## Features

- **Voice Chat Button** - Click to start voice conversation
- **Real-time Speech Recognition** - Converts user speech to text
- **RAG Integration** - Uses your existing Weaviate knowledge base
- **Text-to-Speech** - AI responses are spoken back to user
- **Natural Conversation Flow** - Seamless voice interaction

## Setup Instructions

### 1. Create Vapi Account

1. **Sign up for Vapi**
   - Go to [Vapi Dashboard](https://dashboard.vapi.ai/)
   - Create a new account or sign in

2. **Get Your API Key**
   - Navigate to "API Keys" in your dashboard
   - Create a new API key
   - Copy the API key (starts with `sk-`)

3. **Create Your Assistant**
   - Go to "Assistants" in your dashboard
   - Create a new assistant
   - Configure the assistant with your desired settings
   - Copy the Assistant ID (starts with `asst_`)

### 2. Environment Variables

Add these to your `.env` file:

```env
# Vapi Voice AI
NEXT_PUBLIC_VAPI_API_KEY=sk-your-vapi-api-key-here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=asst-your-assistant-id-here
```

### 3. Install Dependencies

The Vapi SDK is already added to your `package.json`. Install it:

```bash
npm install
```

### 4. Configure Webhook URL

1. **Get your webhook URL**
   - Your webhook URL will be: `https://yourdomain.com/api/vapi/webhook`
   - For local development: `http://localhost:3000/api/vapi/webhook`

2. **Set up webhook in Vapi Dashboard**
   - Go to your Vapi dashboard
   - Navigate to "Assistants" or "Webhooks"
   - Add your webhook URL
   - Set the webhook to handle function calls

### 5. Test the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test voice chat**
   - Click the "Voice Chat" button in your chat interface
   - Allow microphone permissions
   - Speak your question
   - Listen to the AI response

## How It Works

### User Flow
1. **User clicks "Voice Chat"** → Vapi starts listening
2. **User speaks** → Vapi converts speech to text
3. **Text is processed** → Your RAG system searches Weaviate
4. **AI generates response** → Using context from knowledge base
5. **Response is spoken** → Vapi converts text to speech

### Technical Flow
1. **Frontend** → VoiceButton component handles UI
2. **Vapi SDK** → Manages voice capture and playback
3. **Webhook** → `/api/vapi/webhook` processes function calls
4. **RAG System** → Searches Weaviate and generates responses
5. **Response** → Sent back to Vapi for speech synthesis

## Configuration Options

### Voice Settings
You can customize the voice in your Vapi assistant settings:

```typescript
voice: {
  provider: '11labs', // or 'deepgram', 'azure', etc.
  voiceId: 'pNInz6obpgDQGcFmaJgB', // Sarah voice
  speed: 1.0
}
```

### AI Model Settings
Customize the AI model in your assistant settings:

```typescript
model: {
  provider: 'openai',
  model: 'gpt-4', // or 'gpt-3.5-turbo'
  temperature: 0.7
}
```

### Assistant Instructions
Modify the assistant instructions to match your needs in the Vapi dashboard.

## Troubleshooting

### Common Issues

1. **"Voice features not available"**
   - Check that `NEXT_PUBLIC_VAPI_API_KEY` is set
   - Check that `NEXT_PUBLIC_VAPI_ASSISTANT_ID` is set
   - Verify your API key is valid
   - Check browser console for errors

2. **Microphone not working**
   - Ensure browser has microphone permissions
   - Check if microphone is being used by another app
   - Try refreshing the page

3. **Webhook not receiving calls**
   - Verify webhook URL is correct
   - Check that webhook is enabled in Vapi dashboard
   - Test webhook endpoint manually

4. **No AI responses**
   - Check that your RAG system is working
   - Verify Weaviate connection
   - Check webhook logs for errors

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
DEBUG_VAPI=true
```

## Production Deployment

### 1. Update Webhook URL
Change your webhook URL to your production domain:
```
https://yourdomain.com/api/vapi/webhook
```

### 2. Environment Variables
Ensure all environment variables are set in production:
- `NEXT_PUBLIC_VAPI_API_KEY`
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID`
- `WEAVIATE_URL`
- `WEAVIATE_API_KEY`
- `GEMINI_API_KEY`

### 3. SSL Certificate
Ensure your domain has a valid SSL certificate (required for microphone access)

### 4. Performance Monitoring
Monitor:
- Voice call quality
- Response times
- Error rates
- User satisfaction

## Security Considerations

1. **API Key Security**
   - Never expose your Vapi API key in client-side code
   - Use environment variables
   - Rotate keys regularly

2. **Webhook Security**
   - Validate webhook requests
   - Use HTTPS in production
   - Implement rate limiting

3. **Data Privacy**
   - Voice data is processed by Vapi
   - Review Vapi's privacy policy
   - Consider data retention policies

## Cost Considerations

Vapi pricing is based on:
- **Voice minutes** - Time spent in voice calls
- **API calls** - Number of function calls
- **Storage** - Voice recordings (if enabled)

Monitor your usage in the Vapi dashboard to control costs.

## Support

- **Vapi Documentation**: [docs.vapi.ai](https://docs.vapi.ai/)
- **Vapi Support**: [support.vapi.ai](https://support.vapi.ai/)
- **Community**: [Discord](https://discord.gg/vapi)

## Next Steps

1. **Test the integration** with your existing RAG system
2. **Customize the voice** and AI settings in your Vapi assistant
3. **Add error handling** and user feedback
4. **Monitor performance** and user experience
5. **Deploy to production** when ready 