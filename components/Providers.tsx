'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <DarkModeProvider>
        {children}
      </DarkModeProvider>
    </ClerkProvider>
  )
} 