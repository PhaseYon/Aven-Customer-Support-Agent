import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aven Customer Support Chat',
  description: 'AI-powered customer support chatbot interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <DarkModeProvider>
            {children}
          </DarkModeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
} 