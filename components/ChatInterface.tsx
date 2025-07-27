'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Send, Bot, User, Loader2, Trash2, AlertCircle, Calendar } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ConfirmationModal from './ConfirmationModal'
import MeetingRequestModal from './MeetingRequestModal'
import VoiceButton from './VoiceButton'
import { getChatHistory, saveChatMessage, clearChatHistory, testDatabaseConnection, getRateLimitInfo } from '@/lib/database'
import { isRateLimitEnabled } from '@/lib/config'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ChatInterface() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<{ used: number; remaining: number; resetTime: Date } | null>(null)
  const [showMeetingModal, setShowMeetingModal] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Helper function to generate welcome message
  const getWelcomeMessage = () => {
    return `Hi${user?.firstName ? ` ${user.firstName}` : ''}! I'm Sarah, your Aven support specialist. I'm here to help you with any questions about your account, our services, or anything else you need assistance with. What can I help you with today?`
  }

  // Load rate limit information
  const loadRateLimitInfo = async () => {
    if (!user?.id || !isRateLimitEnabled()) return
    
    try {
      const info = await getRateLimitInfo(user.id)
      setRateLimitInfo(info)
    } catch (error) {
      console.log('Could not load rate limit info:', error)
    }
  }

  // Load chat history from database
  useEffect(() => {
    if (!isClient) return

    const loadChatHistory = async () => {
      // Show welcome message immediately if no user
      if (!user?.id) {
        const welcomeMessage = getWelcomeMessage()
        setMessages([{
          id: '1',
          content: welcomeMessage,
          sender: 'bot',
          timestamp: new Date()
        }])
        setIsLoadingHistory(false)
        return
      }

      setIsLoadingHistory(true)
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Loading timeout reached, showing welcome message')
        const welcomeMessage = getWelcomeMessage()
        setMessages([{
          id: '1',
          content: welcomeMessage,
          sender: 'bot',
          timestamp: new Date()
        }])
        setIsLoadingHistory(false)
      }, 5000) // 5 second timeout

      try {
        // Test database connection first
        const isConnected = await testDatabaseConnection()
        
        if (isConnected) {
          const history = await getChatHistory(user.id)
          
          if (history.length > 0) {
            // Convert database format to component format
            const formattedHistory = history.map(msg => ({
              id: msg.id,
              content: msg.content,
              sender: msg.sender,
              timestamp: new Date(msg.timestamp)
            }))
            setMessages(formattedHistory)
          } else {
            // Show welcome message if no history and save it to database
            const welcomeMessage = getWelcomeMessage()
            
            setMessages([{
              id: '1',
              content: welcomeMessage,
              sender: 'bot',
              timestamp: new Date()
            }])
            
            // Save welcome message to database
            await saveChatMessage(user.id, welcomeMessage, 'bot')
          }
        } else {
          // Database not available, show welcome message
          console.log('Database not available, showing welcome message')
          const welcomeMessage = getWelcomeMessage()
          setMessages([{
            id: '1',
            content: welcomeMessage,
            sender: 'bot',
            timestamp: new Date()
          }])
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
        // Show welcome message on error
        const welcomeMessage = getWelcomeMessage()
        setMessages([{
          id: '1',
          content: welcomeMessage,
          sender: 'bot',
          timestamp: new Date()
        }])
      } finally {
        clearTimeout(timeoutId)
        setIsLoadingHistory(false)
      }
    }

    loadChatHistory()
    loadRateLimitInfo() // Load rate limit info
  }, [user?.id, isClient])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user?.id) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Save user message to database
    await saveChatMessage(user.id, inputMessage, 'user')

    try {
      // Call the Gemini API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          userId: user?.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle rate limit error specifically
        if (response.status === 429) {
          const rateLimitMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: errorData.message || 'You have reached your daily message limit. Please try again tomorrow.',
            sender: 'bot',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, rateLimitMessage])
          await saveChatMessage(user.id, rateLimitMessage.content, 'bot')
          return
        }
        
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: 'bot',
        timestamp: new Date()
      }
      
      // Log RAG usage for debugging
      if (data.contextUsed) {
        console.log(`🤖 RAG used: Retrieved ${data.documentsRetrieved} relevant documents`)
      } else {
        console.log('🤖 No relevant documents found, using general knowledge')
      }
      setMessages(prev => [...prev, botMessage])
      
      // Save bot message to database
      await saveChatMessage(user.id, data.message, 'bot')
      
      // Update rate limit info
      await loadRateLimitInfo()
    } catch (error) {
      console.error('Error calling AI API:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Save error message to database
      await saveChatMessage(user.id, 'Sorry, I encountered an error. Please try again.', 'bot')
    } finally {
      setIsTyping(false)
    }
  }

  const handleClearHistory = async () => {
    if (!user?.id) return
    
    const success = await clearChatHistory(user.id)
    if (success) {
      const welcomeMessage = getWelcomeMessage()
      
      setMessages([{
        id: '1',
        content: welcomeMessage,
        sender: 'bot',
        timestamp: new Date()
      }])
      
      // Save welcome message to database after clearing history
      await saveChatMessage(user.id, welcomeMessage, 'bot')
    }
  }

  const handleClearHistoryClick = () => {
    setShowClearConfirmation(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleMeetingScheduled = (meetingDetails: string) => {
    const meetingMessage: Message = {
      id: Date.now().toString(),
      content: meetingDetails,
      sender: 'bot',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, meetingMessage])
  }

  const handleRequestMeeting = () => {
    setShowMeetingModal(true)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">AI Assistant</h2>
              <p className="text-primary-100 text-sm">
                {user?.firstName ? `Welcome back, ${user.firstName}!` : 'Online • Ready to help'}
              </p>
              {isRateLimitEnabled() && rateLimitInfo && (
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-primary-100 text-xs">
                    {rateLimitInfo.remaining} messages remaining today
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <VoiceButton 
              onError={(error) => {
                console.error('Voice error:', error)
                // You could show a toast notification here
              }}
            />
            <button
              onClick={handleRequestMeeting}
              className="px-3 py-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
              title="Request a meeting"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Request Meeting</span>
            </button>
            <button
              onClick={handleClearHistoryClick}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto chat-messages p-4 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {isLoadingHistory && isClient ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Loading chat history...</p>
            </div>
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI is typing...</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Welcome! How can I help you today?</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center transition-colors duration-300">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleClearHistory}
        title="Clear Chat History"
        message="Are you sure you want to clear your chat history? This action cannot be undone."
        confirmText="Clear History"
        cancelText="Cancel"
        type="danger"
      />

      {/* Meeting Request Modal */}
      <MeetingRequestModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onMeetingScheduled={handleMeetingScheduled}
        userId={user?.id || ''}
      />
    </div>
  )
} 