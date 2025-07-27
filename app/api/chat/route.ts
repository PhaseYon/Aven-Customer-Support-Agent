import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create a chat session
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'You are a helpful customer support assistant for Aven. Be friendly, professional, and concise in your responses. Help customers with their questions about products, services, or general inquiries.' }]
        },
        {
          role: 'model',
          parts: [{ text: 'Hello! I\'m here to help you with any questions about Aven\'s products and services. How can I assist you today?' }]
        }
      ]
    })

    // Send the user's message and get response
    const result = await chat.sendMessage(message)
    const response = await result.response
    const aiResponse = response.text()

    return NextResponse.json({
      message: aiResponse,
      timestamp: new Date()
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