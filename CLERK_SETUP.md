# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for your Aven Customer Support application.

## Prerequisites

- A Clerk account (sign up at [clerk.com](https://clerk.com))
- Your Next.js application (already set up)

## Step 1: Create a Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Create a new application
3. Choose "Next.js" as your framework
4. Note down your **Publishable Key** and **Secret Key**

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Optional: Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Your existing environment variables
GOOGLE_API_KEY=your_google_api_key_here
```

## Step 3: Configure Clerk Dashboard

1. In your Clerk dashboard, go to **User & Authentication** → **Email, Phone, Username**
2. Enable the authentication methods you want (Email, Google, etc.)
3. Go to **Paths** and configure:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

## Step 4: Test the Authentication

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. You should see a sign-in page if not authenticated
4. Click "Sign In" to test the authentication flow

## Features Included

✅ **User Authentication**: Sign in/sign up with email or social providers
✅ **Protected Routes**: Chat interface only accessible to authenticated users
✅ **User Profile**: Display user information and sign-out functionality
✅ **Personalized Experience**: Chat greets users by name
✅ **Dark Mode Support**: Authentication pages support dark mode
✅ **Responsive Design**: Works on all device sizes

## File Structure

```
app/
├── sign-in/[[...sign-in]]/page.tsx    # Sign-in page
├── sign-up/[[...sign-up]]/page.tsx    # Sign-up page
├── layout.tsx                         # Root layout with ClerkProvider
└── page.tsx                          # Main page with auth protection

components/
├── ChatInterface.tsx                  # Updated with user context
├── UserProfile.tsx                    # User profile component
└── ... (existing components)

contexts/
└── DarkModeContext.tsx               # Existing dark mode context
```

## Customization

### Styling
- Authentication pages use Tailwind CSS classes
- Colors match your existing design system
- Dark mode support included

### User Data
- User information is available via `useUser()` hook
- Chat messages include user context
- Profile displays user name and email

### Security
- Routes are protected at the component level
- User sessions are managed by Clerk
- Secure token handling

## Troubleshooting

### Common Issues

1. **"Module not found" errors**: Make sure `@clerk/nextjs` is installed
2. **Environment variables not loading**: Restart your development server
3. **Authentication not working**: Check your Clerk dashboard configuration
4. **Styling issues**: Ensure Tailwind CSS is properly configured

### Support

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Discord](https://discord.gg/clerk)
- [Next.js Documentation](https://nextjs.org/docs)

## Next Steps

1. Customize the authentication flow in Clerk dashboard
2. Add additional user profile fields
3. Implement role-based access control
4. Add user preferences and settings
5. Integrate with your backend API 