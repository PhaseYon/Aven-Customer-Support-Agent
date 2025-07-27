# Google Calendar Integration Setup

## Overview

The chat system now includes a "Request Meeting" feature that allows users to schedule meetings directly through Google Calendar. The meeting details are saved to chat history so the AI can reference them.

## Features

- **Request Meeting Button** - Prominent button in chat interface
- **Meeting Modal** - User-friendly form for meeting details
- **Time Slot Selection** - Pre-defined available time slots
- **Google Calendar Integration** - Creates actual calendar events
- **Chat History Integration** - AI can reference scheduled meetings
- **Email Invitations** - Automatically sends invites to attendees

## Setup Instructions

### 1. Google Cloud Console Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Calendar API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

4. **Download Credentials**
   - Download the JSON file
   - Note the Client ID and Client Secret

### 2. Environment Variables

Add these to your `.env` file:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
GOOGLE_ACCESS_TOKEN=your-access-token-here

# Default attendee email (will be pre-filled in meeting form)
NEXT_PUBLIC_DEFAULT_ATTENDEE_EMAIL=support@aven.com
```

### 3. Install Dependencies

```bash
npm install googleapis @google-cloud/local-auth
```

### 4. Getting Your Access Token

#### **Quick Setup (OAuth Playground)**

1. **Go to Google OAuth Playground**: https://developers.google.com/oauthplayground/
2. **Configure OAuth**:
   - Click settings icon (⚙️) in top right
   - Check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
3. **Select Calendar API**:
   - Scroll to "Google Calendar API v3"
   - Select "https://www.googleapis.com/auth/calendar"
4. **Get Token**:
   - Click "Authorize APIs"
   - Sign in with your Google account
   - Click "Exchange authorization code for tokens"
   - Copy the "Access token" value
5. **Add to .env**:
   ```env
   GOOGLE_ACCESS_TOKEN=your-copied-token-here
   ```

#### **Production Setup**

For production, implement proper OAuth flow:
1. Create OAuth 2.0 credentials in Google Cloud Console
2. Set up OAuth endpoints in your app
3. Handle token refresh automatically

#### **Service Account Alternative**

For server-to-server authentication:
1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Use service account authentication instead of OAuth

## How It Works

### User Flow

1. **User clicks "Request Meeting"** → Modal opens
2. **User fills form** → Topic, description, attendee email, time slot
3. **User submits** → API creates Google Calendar event
4. **Meeting created** → Details saved to chat history
5. **AI can reference** → Future conversations can mention the meeting

### Meeting Details Format

The AI will see meeting details like:
```
Meeting scheduled: "Aven Account Review" on Tuesday, September 13, 2025 at 2:00 PM EDT with customer@example.com. Meeting ID: abc123 | Link: https://meet.google.com/xyz-abc-def
```

### Available Time Slots

The system provides these default time slots:
- **Next 3 business days**
- **9 AM, 2 PM, 4 PM EST**
- **30-minute meetings**
- **Automatic Google Meet links**

## Customization

### Modify Time Slots

Edit `lib/google-calendar.ts`:

```typescript
// Change available times
const times = [9, 14, 16]; // 9 AM, 2 PM, 4 PM

// Change meeting duration
const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes
```

### Change Default Settings

Edit `app/api/meeting/route.ts`:

```typescript
// Default timezone
timeZone: timeZone || 'America/New_York'

// Default description
description: description || 'Meeting requested through Aven Customer Support'
```

### Modify Meeting Format

Edit `formatMeetingForChat()` in `lib/google-calendar.ts`:

```typescript
return `Meeting scheduled: "${meeting.summary}" on ${startTime} with ${meeting.attendeeEmail}. Meeting ID: ${meeting.id}${meeting.meetingLink ? ` | Link: ${meeting.meetingLink}` : ''}`;
```

## Security Considerations

1. **Access Token Security** - Store tokens securely
2. **Email Validation** - Validate attendee emails
3. **Rate Limiting** - Consider rate limiting meeting requests
4. **Permissions** - Only allow authorized users to schedule meetings

## Troubleshooting

### Common Issues

1. **"Google Calendar credentials not configured"**
   - Check environment variables
   - Verify Client ID and Secret

2. **"Failed to create meeting"**
   - Check access token validity
   - Verify calendar permissions

3. **"No time slots available"**
   - Check timezone settings
   - Verify business day logic

### Debug Mode

Add logging to see what's happening:

```typescript
console.log('Meeting request:', meetingRequest);
console.log('Calendar response:', response.data);
```

## Production Deployment

1. **Set up proper OAuth flow** for user authentication
2. **Use service account** for server-to-server authentication
3. **Implement token refresh** for long-lived access
4. **Add error handling** for calendar API failures
5. **Set up monitoring** for meeting creation success/failure rates 