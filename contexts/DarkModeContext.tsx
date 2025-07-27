'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { getUserPreferences, updateUserPreferences, testDatabaseConnection } from '@/lib/database'

interface DarkModeContextType {
  isDark: boolean
  toggleDarkMode: () => void
  isLoading: boolean
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const { user } = useUser()

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const initializeTheme = async () => {
      try {
        // Always start with localStorage/system preference for immediate response
        const savedTheme = localStorage.getItem('darkMode')
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'true')
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setIsDark(prefersDark)
        }

        // Set loading to false immediately after setting initial theme
        setIsLoading(false)

        // If user is logged in, try to get database preference (non-blocking)
        if (user?.id) {
          try {
            const isConnected = await testDatabaseConnection()
            
            if (isConnected) {
              const preferences = await getUserPreferences(user.id)
              if (preferences) {
                setIsDark(preferences.dark_mode)
              }
            }
          } catch (dbError) {
            console.log('Database preference loading failed, using localStorage:', dbError)
          }
        }
      } catch (error) {
        console.error('Error initializing theme:', error)
        // Fallback to localStorage on any error
        const savedTheme = localStorage.getItem('darkMode')
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'true')
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setIsDark(prefersDark)
        }
        setIsLoading(false)
      }
    }

    initializeTheme()
  }, [user?.id, isClient])

  useEffect(() => {
    if (!isClient) return

    console.log('Dark mode changed to:', isDark, 'User ID:', user?.id, 'Loading:', isLoading)

    // Update document class when theme changes
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save to localStorage as fallback
    localStorage.setItem('darkMode', isDark.toString())
    console.log('Saved to localStorage:', isDark)
    
    // Save to database if user is logged in
    if (user?.id && !isLoading) {
      console.log('Attempting to save to database for user:', user.id)
      updateUserPreferences(user.id, isDark).then(success => {
        console.log('Database save result:', success)
      }).catch(error => {
        console.error('Failed to save dark mode preference to database:', error)
      })
    } else {
      console.log('Not saving to database - User ID:', user?.id, 'Loading:', isLoading)
    }
  }, [isDark, user?.id, isLoading, isClient])

  const toggleDarkMode = () => {
    console.log('Toggling dark mode from:', isDark, 'to:', !isDark)
    setIsDark(!isDark)
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode, isLoading }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
} 