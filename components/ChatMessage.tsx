'use client'

import { Bot, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === 'bot'
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBot 
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
          {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        
        {/* Message Bubble */}
        <div className={`px-4 py-2 rounded-2xl ${
          isBot 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
            : 'bg-primary-600 text-white'
        }`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isBot ? 'text-gray-500 dark:text-gray-400' : 'text-primary-100'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  )
} 