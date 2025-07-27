import Vapi from '@vapi-ai/web'

export interface VapiConfig {
  apiKey: string
  assistantId?: string
  assistantName?: string
  assistantInstructions?: string
}

export class VapiService {
  private vapi: any = null
  private isInitialized = false

  constructor() {
    // Initialize Vapi only on client side
    if (typeof window !== 'undefined') {
      this.initializeVapi()
    }
  }

  private initializeVapi() {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY
    if (!apiKey) {
      console.warn('Vapi API key not found. Voice features will be disabled.')
      return
    }

    try {
      // Initialize Vapi with API key
      this.vapi = new Vapi(apiKey)
      this.isInitialized = true
      console.log('Vapi initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Vapi:', error)
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.vapi !== null
  }

  public async startCall(): Promise<void> {
    if (!this.vapi) {
      throw new Error('Vapi not initialized')
    }

    try {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
      if (!assistantId) {
        throw new Error('Vapi Assistant ID not configured')
      }

      // Based on the SDK test, start() expects (assistant, assistantOverrides, squad)
      await this.vapi.start(assistantId)
      
      console.log('Vapi call started')
    } catch (error) {
      console.error('Failed to start Vapi call:', error)
      throw error
    }
  }

  public async stopCall(): Promise<void> {
    if (!this.vapi) {
      throw new Error('Vapi not initialized')
    }

    try {
      await this.vapi.stop()
      console.log('Vapi call stopped')
    } catch (error) {
      console.error('Failed to stop Vapi call:', error)
      throw error
    }
  }

  public isCallActive(): boolean {
    return this.vapi?.isCallActive?.() || false
  }

  public onCallStart(callback: () => void): void {
    if (this.vapi) {
      this.vapi.on?.('call-start', callback)
    }
  }

  public onCallEnd(callback: () => void): void {
    if (this.vapi) {
      this.vapi.on?.('call-end', callback)
    }
  }

  public onSpeechStart(callback: () => void): void {
    if (this.vapi) {
      this.vapi.on?.('speech-start', callback)
    }
  }

  public onSpeechEnd(callback: () => void): void {
    if (this.vapi) {
      this.vapi.on?.('speech-end', callback)
    }
  }

  public onMessage(callback: (message: any) => void): void {
    if (this.vapi) {
      this.vapi.on?.('message', callback)
    }
  }

  public onError(callback: (error: any) => void): void {
    if (this.vapi) {
      this.vapi.on?.('error', callback)
    }
  }
}

// Create a singleton instance
let vapiServiceInstance: VapiService | null = null

export function getVapiService(): VapiService {
  if (!vapiServiceInstance) {
    vapiServiceInstance = new VapiService()
  }
  return vapiServiceInstance
} 