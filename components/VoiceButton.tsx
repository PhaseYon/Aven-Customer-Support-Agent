'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { getVapiService } from '@/lib/vapi-service'

interface VoiceButtonProps {
  onTranscript?: (transcript: string) => void
  onError?: (error: string) => void
  disabled?: boolean
}

export default function VoiceButton({ onTranscript, onError, disabled = false }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVapiReady, setIsVapiReady] = useState(false)
  const [vapiService, setVapiService] = useState<any>(null)

  useEffect(() => {
    // Initialize Vapi service on client side
    if (typeof window !== 'undefined') {
      const service = getVapiService()
      setVapiService(service)
      
      // Check if Vapi is ready
      const checkVapiReady = () => {
        setIsVapiReady(service.isReady())
      }
      
      checkVapiReady()
      
      // Set up event listeners
      service.onCallStart(() => {
        setIsListening(true)
        setIsLoading(false)
      })
      
      service.onCallEnd(() => {
        setIsListening(false)
        setIsLoading(false)
      })
      
      service.onError((error: any) => {
        console.error('Vapi error:', error)
        setIsListening(false)
        setIsLoading(false)
        onError?.(error.message || 'Voice call failed')
      })
      
      // Check readiness periodically
      const interval = setInterval(checkVapiReady, 1000)
      return () => clearInterval(interval)
    }
  }, [onError])

  const handleVoiceToggle = async () => {
    if (!vapiService || !isVapiReady) {
      onError?.('Voice features not available. Please check your Vapi configuration.')
      return
    }

    if (isListening) {
      // Stop the call
      try {
        await vapiService.stopCall()
      } catch (error) {
        console.error('Failed to stop call:', error)
        onError?.('Failed to stop voice call')
      }
    } else {
      // Start the call
      try {
        setIsLoading(true)
        await vapiService.startCall()
      } catch (error) {
        console.error('Failed to start call:', error)
        setIsLoading(false)
        onError?.('Failed to start voice call')
      }
    }
  }

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin" />
    }
    if (isListening) {
      return <MicOff className="w-5 h-5" />
    }
    return <Mic className="w-5 h-5" />
  }

  const getButtonText = () => {
    if (isLoading) {
      return 'Starting...'
    }
    if (isListening) {
      return 'Stop Voice'
    }
    return 'Voice Chat'
  }

  const getButtonClass = () => {
    let baseClass = 'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium'
    
    if (disabled || !isVapiReady) {
      return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`
    }
    
    if (isListening) {
      return `${baseClass} bg-red-500 text-white hover:bg-red-600`
    }
    
    if (isLoading) {
      return `${baseClass} bg-blue-500 text-white cursor-wait`
    }
    
    return `${baseClass} bg-blue-500 text-white hover:bg-blue-600`
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleVoiceToggle}
        disabled={disabled || !isVapiReady || isLoading}
        className={getButtonClass()}
        title={!isVapiReady ? 'Voice features not available' : isListening ? 'Stop voice chat' : 'Start voice chat'}
      >
        {getButtonIcon()}
        <span className="text-sm">{getButtonText()}</span>
      </button>
      
      {!isVapiReady && (
        <div className="text-xs text-gray-500 text-center">
          Voice features not available
        </div>
      )}
      
      {isListening && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Listening...</span>
        </div>
      )}
    </div>
  )
} 