# Aven Customer Support Chatbot Interface

A modern, beautiful chatbot interface built with NextJS and Tailwind CSS. This is a frontend-only implementation showcasing the UI design.

## Features

- 🎨 Modern and responsive design
- 💬 Real-time chat interface
- 🤖 AI assistant persona
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- 📱 Mobile-friendly layout
- 🎯 Beautiful animations and transitions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Aven-Customer-Support/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main page component
├── components/
│   ├── ChatInterface.tsx    # Main chat interface component
│   └── ChatMessage.tsx      # Individual message component
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Usage

The chatbot interface includes:

- **Welcome Message**: The AI assistant greets users with a welcome message
- **Message Input**: Users can type messages in the textarea
- **Send Button**: Click the send button or press Enter to send messages
- **Typing Indicator**: Shows when the AI is "typing" a response
- **Demo Responses**: The bot responds with a demo message (non-functional as requested)

## Customization

You can easily customize the interface by:

- Modifying colors in `tailwind.config.js`
- Updating the AI assistant's welcome message in `ChatInterface.tsx`
- Changing the demo response text
- Adjusting the layout and styling in the component files

## Note

This is a **frontend-only implementation**. The chatbot functionality is simulated for demonstration purposes. To make it functional, you would need to integrate with an actual AI service or backend API.
