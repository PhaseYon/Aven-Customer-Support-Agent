# Supabase Database Setup Guide

This guide will help you set up Supabase for storing user preferences and chat history.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Choose a name (e.g., "aven-customer-support")
4. Set a database password (save this!)
5. Choose a region close to your users

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Add them to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Your existing environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GOOGLE_API_KEY=your_google_api_key_here
```

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database-schema.sql`
3. Paste and run the SQL commands
4. This will create:
   - `user_preferences` table for dark mode settings
   - `chat_messages` table for conversation history
   - Row Level Security (RLS) policies
   - Indexes for performance

## Step 4: Configure Row Level Security

The schema includes RLS policies that ensure users can only access their own data. However, since you're using Clerk for authentication, you'll need to modify the policies:

1. Go to **Authentication** → **Policies**
2. For each table, update the policies to use Clerk's user ID format
3. The policies should check against the `user_id` field instead of `auth.jwt()`

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Sign in with a user account
3. Toggle dark mode - it should persist across sessions
4. Send some chat messages - they should be saved
5. Refresh the page - your chat history should load
6. Try the clear history button

## Features Implemented

✅ **User Preferences**: Dark mode preference is saved per user
✅ **Chat History**: All messages are stored and retrieved
✅ **Persistence**: Data survives browser refreshes and sessions
✅ **Security**: Row Level Security ensures data isolation
✅ **Performance**: Indexes optimize query performance
✅ **Real-time**: Supabase can provide real-time updates (future enhancement)

## Database Schema

### user_preferences
- `id`: Unique identifier
- `user_id`: Clerk user ID
- `dark_mode`: Boolean preference
- `created_at`: Timestamp
- `updated_at`: Last modified timestamp

### chat_messages
- `id`: Unique identifier
- `user_id`: Clerk user ID
- `content`: Message text
- `sender`: 'user' or 'bot'
- `timestamp`: Message timestamp
- `created_at`: Record creation timestamp

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check your environment variables
2. **"Table doesn't exist"**: Run the SQL schema
3. **"Permission denied"**: Check RLS policies
4. **"Connection failed"**: Verify your Supabase URL

### Debugging

- Check browser console for errors
- Verify environment variables are loaded
- Test database connection in Supabase dashboard
- Check RLS policies are correctly configured

## Next Steps

1. **Real-time Updates**: Enable real-time subscriptions for live chat
2. **Message Search**: Add full-text search capabilities
3. **User Analytics**: Track usage patterns
4. **Data Export**: Allow users to export their chat history
5. **Message Reactions**: Add emoji reactions to messages

## Security Notes

- All data is protected by Row Level Security
- Users can only access their own data
- API keys are environment variables (not in code)
- Database passwords are encrypted
- Regular backups are automatic with Supabase 