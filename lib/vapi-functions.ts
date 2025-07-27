// Vapi Function Definitions for Assistant Configuration
// Add these functions to your Vapi assistant in the dashboard

export const vapiFunctions = [
  {
    name: 'search_aven_knowledge',
    description: 'Search Aven knowledge base for relevant information',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'schedule_meeting',
    description: 'Schedule a meeting in Google Calendar',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Meeting title or summary'
        },
        startTime: {
          type: 'string',
          description: 'Start time in ISO format (e.g., 2024-01-15T14:00:00Z)'
        },
        endTime: {
          type: 'string',
          description: 'End time in ISO format (e.g., 2024-01-15T14:30:00Z)'
        },
        description: {
          type: 'string',
          description: 'Meeting description (optional)'
        },
        attendeeEmail: {
          type: 'string',
          description: 'Email address of the attendee (optional, defaults to support@aven.com)'
        }
      },
      required: ['summary', 'startTime', 'endTime']
    }
  }
]

// Helper function to format date/time for meeting scheduling
export function formatDateTimeForMeeting(date: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const meetingDate = new Date(date)
  meetingDate.setHours(hours, minutes, 0, 0)
  return meetingDate.toISOString()
}

// Helper function to parse natural language date/time
export function parseNaturalDateTime(text: string): { date: Date | null, time: string | null } {
  const now = new Date()
  
  // Simple parsing for common patterns
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  // Date parsing
  let date: Date | null = null
  if (text.toLowerCase().includes('tomorrow')) {
    date = tomorrow
  } else if (text.toLowerCase().includes('next week')) {
    date = nextWeek
  } else if (text.toLowerCase().includes('today')) {
    date = now
  }
  
  // Time parsing
  let time: string | null = null
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,
    /(\d{1,2})\s*(am|pm)/i,
    /(\d{1,2}):(\d{2})/i
  ]
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern)
    if (match) {
      let hours = parseInt(match[1])
      const minutes = match[2] ? parseInt(match[2]) : 0
      const period = match[3]?.toLowerCase()
      
      if (period === 'pm' && hours !== 12) hours += 12
      if (period === 'am' && hours === 12) hours = 0
      
      time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      break
    }
  }
  
  return { date, time }
}

// Helper function to generate meeting end time (default 30 minutes)
export function generateEndTime(startTime: string, durationMinutes: number = 30): string {
  const start = new Date(startTime)
  const end = new Date(start.getTime() + durationMinutes * 60000)
  return end.toISOString()
} 