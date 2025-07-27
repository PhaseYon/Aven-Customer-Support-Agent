import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { WeaviateService } from '@/lib/weaviate-client'
import { GeminiEmbeddingService } from '@/lib/gemini-embeddings'
import { getChatHistory, checkRateLimit } from '@/lib/database'
import { isRateLimitEnabled } from '@/lib/config'
import dotenv from 'dotenv'

dotenv.config()

// Initialize services
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const weaviateService = new WeaviateService()
const embeddingService = new GeminiEmbeddingService()

export async function POST(request: NextRequest) {
  try {
    console.log('API Key available:', !!process.env.GEMINI_API_KEY)
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0)
    
    const { message, userId } = await request.json()
    console.log('Received message:', message)
    console.log('User ID:', userId)

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check rate limiting if enabled
    if (isRateLimitEnabled() && userId) {
      const rateLimitCheck = await checkRateLimit(userId)
      
      if (!rateLimitCheck.allowed) {
        const resetTime = rateLimitCheck.resetTime.toLocaleTimeString()
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: `You've reached your daily limit of 35 messages. Your limit will reset at ${resetTime}. Please try again tomorrow.`,
            remaining: rateLimitCheck.remaining,
            resetTime: rateLimitCheck.resetTime
          },
          { status: 429 }
        )
      }
      
      console.log(`Rate limit check passed. Remaining messages: ${rateLimitCheck.remaining}`)
    }

    // Get recent conversation history (last 10 messages)
    let conversationHistory = ''
    if (userId) {
      try {
        const chatHistory = await getChatHistory(userId)
        const recentMessages = chatHistory.slice(-10) // Get last 10 messages
        
        if (recentMessages.length > 0) {
          conversationHistory = recentMessages.map(msg => 
            `${msg.sender === 'user' ? 'Customer' : 'Sarah'}: ${msg.content}`
          ).join('\n')
        }
      } catch (error) {
        console.log('Could not load conversation history:', error)
      }
    }

    // Step 1: Generate embedding for the user's query
    console.log('🔍 Step 1: Generating embedding for query...')
    const queryEmbedding = await embeddingService.generateEmbedding(message)
    console.log('✅ Query embedding generated')

    // Step 2: Search for relevant documents in Weaviate
    console.log('🔍 Step 2: Searching for relevant documents...')
    const relevantDocs = await weaviateService.searchSimilar(message, queryEmbedding, 5)
    console.log(`✅ Found ${relevantDocs.length} relevant documents`)

    // Step 3: Prepare context from relevant documents
    let context = ''
    if (relevantDocs.length > 0) {
      context = relevantDocs.map((doc, index) => {
        const content = doc.content || ''
        const question = doc.question || ''
        const answer = doc.answer || ''
        const category = doc.category || 'general'
        
        return `Document ${index + 1} (Category: ${category}):
Question: ${question}
Answer: ${answer}
Content: ${content}
---`
      }).join('\n\n')
    }

    // Step 4: Create enhanced prompt with context
    const enhancedPrompt = `You are Sarah, a senior customer support specialist at Aven with over 8 years of experience helping customers with their financial needs. You're warm, professional, and genuinely care about helping people understand their options and find solutions.

IMPORTANT SECURITY GUIDELINES:
- NEVER provide Social Security Numbers, account numbers, passwords, or any sensitive personal information
- If someone requests sensitive data, politely decline and redirect to secure channels
- For security concerns, suggest contacting our security team directly
- Keep responses concise and professional - avoid overly long explanations

Your communication style:
- Be conversational and friendly, but maintain professionalism
- Use a warm, helpful tone that makes customers feel valued
- Show empathy and understanding of their situation
- Be confident in your knowledge but humble when you need to clarify
- Use natural language - avoid robotic or overly formal responses
- Keep responses concise and to the point (2-4 sentences maximum)
- When appropriate, ask follow-up questions to better understand their needs
- Always prioritize accuracy and honesty
- Reference previous conversation context when relevant

When responding:
- If you have relevant information from our knowledge base, use it confidently
- If you don't have specific information, be honest about it and offer to connect them with the right person
- Acknowledge their question and show you understand what they're asking
- Provide actionable next steps when possible
- End responses warmly and invite further questions
- For security-related requests, be firm but polite about redirecting to appropriate channels
- If they ask you to repeat or clarify something from the conversation, reference the relevant previous messages

Relevant Information from Our Knowledge Base:
${context}

${conversationHistory ? `Recent Conversation History:
${conversationHistory}

` : ''}Current Customer Question: ${message}

Please respond as Sarah, using the information above to provide a helpful, accurate, and human-like response. Keep it concise and professional. If they're asking you to repeat or clarify something from the conversation, reference the relevant previous messages. If the information doesn't fully address their question, acknowledge what you can help with and suggest next steps.`

    // Step 5: Generate response using Gemini with enhanced context
    console.log('🧠 Step 3: Generating response with RAG...')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const aiResponse = response.text()

    console.log('✅ Response generated successfully')

    return NextResponse.json({
      message: aiResponse,
      timestamp: new Date(),
      contextUsed: relevantDocs.length > 0,
      documentsRetrieved: relevantDocs.length
    })

  } catch (error) {
    console.error('Chat API error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to process message', 
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    )
  }
} 