import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService, MeetingRequest } from '@/lib/google-calendar';
import { saveChatMessage } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { 
      summary, 
      description, 
      startTime, 
      endTime, 
      attendeeEmail, 
      timeZone, 
      userId 
    } = await request.json();

    // Validate required fields
    if (!summary || !startTime || !endTime || !attendeeEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create meeting request
    const meetingRequest: MeetingRequest = {
      summary,
      description: description || 'Meeting requested through Aven Customer Support',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      attendeeEmail,
      timeZone: timeZone || 'America/New_York'
    };

    // Initialize calendar service
    const calendarService = new GoogleCalendarService();
    
    // For now, we'll use a service account or stored token
    // In production, you'd handle OAuth flow properly
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    if (accessToken) {
      calendarService.setAccessToken(accessToken);
    }

    // Create the meeting
    const meeting = await calendarService.createMeeting(meetingRequest);

    // Format meeting details for chat history
    const meetingMessage = calendarService.formatMeetingForChat(meeting);

    // Save to chat history
    await saveChatMessage(userId, meetingMessage, 'bot');

    return NextResponse.json({
      success: true,
      meeting,
      message: meetingMessage
    });

  } catch (error) {
    console.error('Error creating meeting:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create meeting',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get available time slots
export async function GET(request: NextRequest) {
  try {
    const calendarService = new GoogleCalendarService();
    
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    if (accessToken) {
      calendarService.setAccessToken(accessToken);
    }

    const timeSlots = await calendarService.getAvailableTimeSlots();
    
    return NextResponse.json({
      timeSlots: timeSlots.map(slot => ({
        date: slot.toISOString(),
        display: slot.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        })
      }))
    });

  } catch (error) {
    console.error('Error getting time slots:', error);
    
    return NextResponse.json(
      { error: 'Failed to get time slots' },
      { status: 500 }
    );
  }
} 