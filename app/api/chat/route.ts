import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { WeaviateService } from '@/lib/weaviate-client'
import { GeminiEmbeddingService } from '@/lib/gemini-embeddings'
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
    
    const { message } = await request.json()
    console.log('Received message:', message)

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
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
    const enhancedPrompt = `You are a helpful customer support assistant for Aven. Use the following relevant information to answer the user's question. If the information provided doesn't answer their question completely, you can use your general knowledge about customer support best practices.

Relevant Information:
${context}

User Question: ${message}

Please provide a helpful, accurate, and concise response based on the information above. If you're not sure about something, be honest about it and suggest they contact Aven support directly.`

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