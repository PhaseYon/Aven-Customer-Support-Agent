import { supabase, UserPreferences, ChatMessage } from './supabase'

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Database connection test failed:', error)
      return false
    }
    
    console.log('Database connection successful')
    return true
  } catch (err) {
    console.error('Database connection exception:', err)
    return false
  }
}

// User Preferences Functions
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // Check if it's a "not found" error (which is expected for new users)
      if (error.code === 'PGRST116') {
        console.log('No user preferences found for user:', userId)
        return null
      }
      console.error('Error fetching user preferences:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Exception in getUserPreferences:', err)
    return null
  }
}

export async function updateUserPreferences(userId: string, darkMode: boolean): Promise<boolean> {
  try {
    // First check if user preferences exist
    const existingPreferences = await getUserPreferences(userId)
    
    if (existingPreferences) {
      // Update existing preferences
      const { error } = await supabase
        .from('user_preferences')
        .update({
          dark_mode: darkMode,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating existing user preferences:', error)
        return false
      }
    } else {
      // Create new preferences
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          dark_mode: darkMode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating new user preferences:', error)
        return false
      }
    }

    console.log(`Successfully ${existingPreferences ? 'updated' : 'created'} preferences for user:`, userId)
    return true
  } catch (err) {
    console.error('Exception in updateUserPreferences:', err)
    return false
  }
}

// Chat History Functions
export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching chat history:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Exception in getChatHistory:', err)
    return []
  }
}

export async function saveChatMessage(
  userId: string, 
  content: string, 
  sender: 'user' | 'bot'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        content,
        sender,
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Error saving chat message:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Exception in saveChatMessage:', err)
    return false
  }
}

export async function clearChatHistory(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing chat history:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Exception in clearChatHistory:', err)
    return false
  }
}

// Rate Limiting Functions
export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of today
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1) // Start of tomorrow

    // Count user messages sent today
    const { data, error } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('user_id', userId)
      .eq('sender', 'user')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (error) {
      console.error('Error checking rate limit:', error)
      return { allowed: true, remaining: 35, resetTime: tomorrow } // Allow if error
    }

    const messageCount = data?.length || 0
    const maxMessages = 35
    const remaining = Math.max(0, maxMessages - messageCount)
    const allowed = messageCount < maxMessages

    return {
      allowed,
      remaining,
      resetTime: tomorrow
    }
  } catch (err) {
    console.error('Exception in checkRateLimit:', err)
    return { allowed: true, remaining: 35, resetTime: new Date() } // Allow if error
  }
}

export async function getRateLimitInfo(userId: string): Promise<{ used: number; remaining: number; resetTime: Date }> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('user_id', userId)
      .eq('sender', 'user')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (error) {
      console.error('Error getting rate limit info:', error)
      return { used: 0, remaining: 35, resetTime: tomorrow }
    }

    const used = data?.length || 0
    const remaining = Math.max(0, 35 - used)

    return {
      used,
      remaining,
      resetTime: tomorrow
    }
  } catch (err) {
    console.error('Exception in getRateLimitInfo:', err)
    return { used: 0, remaining: 35, resetTime: new Date() }
  }
} 