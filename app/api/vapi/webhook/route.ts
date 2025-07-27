import { NextRequest, NextResponse } from 'next/server'
import { WeaviateService } from '@/lib/weaviate-client'
import { GeminiEmbeddingService } from '@/lib/gemini-embeddings'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const weaviateService = new WeaviateService()
const embeddingService = new GeminiEmbeddingService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle Vapi webhook events
    if (body.type === 'function-call') {
      const { name, arguments: args } = body.functionCall
      
      if (name === 'search_aven_knowledge') {
        const query = args.query
        
        // Step 1: Generate embedding for the query
        const queryEmbedding = await embeddingService.generateEmbedding(query)
        
        // Step 2: Search for relevant documents in Weaviate
        const relevantDocs = await weaviateService.searchSimilar(query, queryEmbedding, 5)
        
        // Step 3: Prepare context from relevant documents
        let context = ''
        if (relevantDocs.length > 0) {
          context = relevantDocs.map((doc, index) => {
            const content = doc.content || ''
            const question = doc.question || ''
            const answer = doc.answer || ''
            const category = doc.category || 'general'
            return `Document ${index + 1} (Category: ${category}):\nQuestion: ${question}\nAnswer: ${answer}\nContent: ${content}\n---`
          }).join('\n\n')
        }
        
        // Step 4: Generate response using RAG
        const enhancedPrompt = `You are Sarah, a senior customer support specialist at Aven. Use the following information from our knowledge base to answer the customer's question. Keep your response warm, professional, and concise (2-4 sentences maximum).

Relevant Information from Our Knowledge Base:
${context}

Customer Question: ${query}

Please provide a helpful, accurate response based on the information above. If the information doesn't fully address their question, acknowledge what you can help with and suggest next steps.`

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        const result = await model.generateContent(enhancedPrompt)
        const response = await result.response
        const aiResponse = response.text()
        
        return NextResponse.json({
          type: 'function-call-result',
          functionCallResult: {
            result: aiResponse,
            contextUsed: relevantDocs.length > 0,
            documentsRetrieved: relevantDocs.length
          }
        })
      }
    }
    
    // Handle other Vapi events (optional)
    if (body.type === 'transcript') {
      console.log('Vapi transcript:', body.transcript)
    }
    
    if (body.type === 'call-end') {
      console.log('Vapi call ended')
    }
    
    // Return success for all events
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Vapi webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 