export interface MeetingRequest {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail: string;
  timeZone: string;
}

export interface MeetingDetails {
  id: string;
  summary: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail: string;
  meetingLink?: string;
  status: 'scheduled' | 'pending' | 'failed';
}

export class GoogleCalendarService {
  private isConfigured: boolean = false;

  constructor() {
    // Check if Google Calendar is configured
    this.isConfigured = !!(process.env.GOOGLE_ACCESS_TOKEN);
  }

  // Set access token (called after OAuth flow)
  async setAccessToken(accessToken: string) {
    // For now, we'll simulate the calendar integration
    // In production, you'd use the actual Google Calendar API
    this.isConfigured = true;
  }

  // Create a meeting
  async createMeeting(meetingRequest: MeetingRequest): Promise<MeetingDetails> {
    try {
      if (!this.isConfigured) {
        // Simulate meeting creation for development
        const meetingId = `meeting-${Date.now()}`;
        const meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`;
        
        return {
          id: meetingId,
          summary: meetingRequest.summary,
          startTime: meetingRequest.startTime,
          endTime: meetingRequest.endTime,
          attendeeEmail: meetingRequest.attendeeEmail,
          meetingLink: meetingLink,
          status: 'scheduled'
        };
      }

      // In production, this would use the actual Google Calendar API
      // For now, we'll simulate the response
      const meetingId = `meeting-${Date.now()}`;
      const meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`;
      
      return {
        id: meetingId,
        summary: meetingRequest.summary,
        startTime: meetingRequest.startTime,
        endTime: meetingRequest.endTime,
        attendeeEmail: meetingRequest.attendeeEmail,
        meetingLink: meetingLink,
        status: 'scheduled'
      };
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw new Error('Failed to create meeting');
    }
  }

  // Get available time slots (simplified - returns next 3 business days)
  async getAvailableTimeSlots(): Promise<Date[]> {
    const slots: Date[] = [];
    const now = new Date();
    
    // Generate slots for next 3 business days
    for (let day = 1; day <= 3; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Add slots for 9 AM, 2 PM, and 4 PM EST
      const times = [9, 14, 16]; // 9 AM, 2 PM, 4 PM
      
      for (const hour of times) {
        const slot = new Date(date);
        slot.setHours(hour, 0, 0, 0);
        slots.push(slot);
      }
    }
    
    return slots;
  }

  // Format meeting details for chat history
  formatMeetingForChat(meeting: MeetingDetails): string {
    const startTime = meeting.startTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return `Meeting scheduled: "${meeting.summary}" on ${startTime} with ${meeting.attendeeEmail}. Meeting ID: ${meeting.id}${meeting.meetingLink ? ` | Link: ${meeting.meetingLink}` : ''}`;
  }
} 