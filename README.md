# 🚀 Aven Customer Support AI Assistant

> **A sophisticated AI-powered customer support chatbot with voice capabilities, meeting scheduling, and intelligent knowledge retrieval.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

---

## ✨ Features

### 🤖 **AI-Powered Support**
- **Retrieval-Augmented Generation (RAG)** - Intelligent responses using Weaviate vector database
- **Conversation Memory** - Context-aware follow-up conversations
- **Professional Persona** - "Sarah" - Senior Customer Support Specialist
- **Rate Limiting** - Configurable daily message limits per user

### 🗣️ **Voice Communication**
- **Real-time Voice Chat** - Powered by Vapi AI
- **Speech-to-Text** - Natural voice input processing
- **Text-to-Speech** - AI responses spoken back to users
- **Voice Meeting Scheduling** - Schedule meetings through voice conversation

### 📅 **Meeting Management**
- **Google Calendar Integration** - Create and send calendar invites
- **Voice Scheduling** - Natural language meeting scheduling
- **Chat History Integration** - Meeting details saved to conversation
- **Flexible Time Slots** - Available time slot management

### 🔍 **Knowledge Base**
- **Vector Search** - Semantic search through Aven documentation
- **Weaviate Integration** - High-performance vector database
- **Gemini AI Embeddings** - Google's latest embedding technology
- **Context-Aware Responses** - Relevant information retrieval

### 🎨 **User Experience**
- **Modern UI/UX** - Beautiful, responsive design
- **Dark Mode Toggle** - User preference support
- **Real-time Chat** - Instant message delivery
- **Mobile Responsive** - Works perfectly on all devices
- **Keyboard Shortcuts** - Enter to send, Shift+Enter for new line

### 🔐 **Security & Authentication**
- **Clerk Authentication** - Secure user management
- **Environment Variables** - Secure API key management
- **Rate Limiting** - Abuse prevention
- **Input Validation** - Secure data handling

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 14 | Full-stack React framework |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Database** | Supabase | PostgreSQL database for chat history |
| **Vector DB** | Weaviate | Vector database for RAG |
| **AI/ML** | Google Gemini | Embeddings and text generation |
| **Voice** | Vapi AI | Real-time voice communication |
| **Calendar** | Google Calendar API | Meeting scheduling |
| **Auth** | Clerk | User authentication |
| **Deployment** | Vercel | Production hosting |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Weaviate Cloud Services account
- Google Cloud account (for Gemini)
- Vapi account (for voice features)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd Aven-Customer-Support
npm install
```

### 2. Environment Setup
Create a `.env.local` file:
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Services
GEMINI_API_KEY=your-gemini-api-key
WEAVIATE_URL=your-weaviate-endpoint
WEAVIATE_API_KEY=your-weaviate-api-key

# Voice
NEXT_PUBLIC_VAPI_API_KEY=your-vapi-api-key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-assistant-id

# Calendar
GOOGLE_ACCESS_TOKEN=your-google-access-token
NEXT_PUBLIC_DEFAULT_ATTENDEE_EMAIL=support@aven.com

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_MESSAGES=35
RATE_LIMIT_RESET_TIME=86400
```

### 3. Database Setup
```bash
# Run the database schema
npm run db:setup
```

### 4. Vectorize Data
```bash
# Vectorize your knowledge base
npm run vectorize
```

### 5. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your AI assistant!

---

## 📁 Project Structure

```
Aven-Customer-Support/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes
│   │   ├── 📄 chat/route.ts         # Main chat endpoint
│   │   ├── 📄 meeting/route.ts      # Meeting scheduling
│   │   └── 📁 vapi/
│   │       └── 📄 webhook/route.ts  # Vapi webhook handler
│   ├── 📄 globals.css               # Global styles
│   ├── 📄 layout.tsx                # Root layout
│   └── 📄 page.tsx                  # Main page
├── 📁 components/                   # React Components
│   ├── 📄 ChatInterface.tsx         # Main chat UI
│   ├── 📄 ChatMessage.tsx           # Message component
│   ├── 📄 VoiceButton.tsx           # Voice chat button
│   ├── 📄 MeetingRequestModal.tsx   # Meeting modal
│   ├── 📄 DarkModeToggle.tsx        # Dark mode toggle
│   └── 📄 UserProfile.tsx           # User profile
├── 📁 lib/                          # Utility Libraries
│   ├── 📄 database.ts               # Supabase client
│   ├── 📄 weaviate-client.ts        # Weaviate service
│   ├── 📄 gemini-embeddings.ts      # Gemini embeddings
│   ├── 📄 google-calendar.ts        # Calendar service
│   ├── 📄 vapi-service.ts           # Vapi service
│   └── 📄 vapi-functions.ts         # Function definitions
├── 📁 scripts/                      # Utility Scripts
│   ├── 📄 vectorize-aven-data.ts    # Data vectorization
│   ├── 📄 test-weaviate-connection.ts
│   ├── 📄 test-rag.ts               # RAG testing
│   └── 📄 test-voice-scheduling.ts  # Voice testing
└── 📁 contexts/                     # React Contexts
    └── 📄 DarkModeContext.tsx       # Dark mode context
```

---

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run vectorize` | Vectorize knowledge base |
| `npm run test-weaviate` | Test Weaviate connection |
| `npm run test-rag` | Test RAG functionality |
| `npm run test-vapi` | Test Vapi integration |
| `npm run test-voice-scheduling` | Test voice meeting scheduling |

---

## 🔧 Configuration

### Rate Limiting
```env
RATE_LIMIT_ENABLED=true          # Enable/disable rate limiting
RATE_LIMIT_MAX_MESSAGES=35       # Messages per day
RATE_LIMIT_RESET_TIME=86400      # Reset time in seconds
```

### Voice Assistant
Configure your Vapi assistant with these functions:
- `search_aven_knowledge` - RAG search
- `schedule_meeting` - Meeting scheduling

### Knowledge Base
Add your documentation to `aven-data.txt` and run:
```bash
npm run vectorize
```

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy!

### Environment Variables for Production
Set these in your Vercel dashboard:
- All variables from `.env.local`
- Update webhook URLs to production domain

---

## 📚 Documentation

- **[Weaviate Setup](./WEAVIATE_SETUP.md)** - Vector database configuration
- **[Supabase Setup](./SUPABASE_SETUP.md)** - Database configuration
- **[Clerk Setup](./CLERK_SETUP.md)** - Authentication setup
- **[Vapi Setup](./VAPI_SETUP.md)** - Voice integration guide
- **[Google Calendar Setup](./GOOGLE_CALENDAR_SETUP.md)** - Calendar integration
- **[Rate Limit Setup](./RATE_LIMIT_SETUP.md)** - Rate limiting configuration

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** - The React framework
- **Vapi AI** - Voice communication platform
- **Weaviate** - Vector database
- **Google Gemini** - AI/ML services
- **Supabase** - Database and authentication
- **Clerk** - User authentication
- **Tailwind CSS** - Utility-first CSS framework

---

<div align="center">

**Built with ❤️ for Aven Customer Support**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/aven-customer-support)

</div>
